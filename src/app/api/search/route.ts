import QueryStream from 'pg-query-stream';
import { PassThrough } from 'stream';
import type { FeatureCollection } from 'geojson';
import { parse } from 'url';
import { NextResponse } from 'next/server';

import { FeatureSourceAttributeType, isFeatureSourceAttributeType, MapDictionaryType, QueryParamsType, QueryResponseType, SqlBitsType } from '../../types';
import config from '../../lib/server/config';
import { logger } from '../../lib/server/logger';
import { pool } from '../../lib/server/dbh';

import { listToCsvLine, nodeStreamToWebStream } from '../../lib/server/csv';

const DBH = pool;

export async function GET(req: Request) {
    const userArgs: QueryParamsType | null = getCleanArgs(req);

    if (!userArgs) {
        return NextResponse.error();
    }

    if (userArgs.q && userArgs.q.length < config.minQLength) {
        return NextResponse.error();
    }

    const acceptHeader = req.headers.get('accept') || '';

    return acceptHeader.includes('text/csv') ? searchCsv(userArgs) : searchGeoJson(userArgs);
}


async function searchCsv(userArgs: QueryParamsType) {
    const client = await pool.connect();
    const sqlBits = constructSqlBits(userArgs);
    const sql = `SELECT * FROM sightings WHERE ${sqlBits.whereColumns.join(' AND ')} LIMIT 1000`;
    const query = new QueryStream(sql, sqlBits.whereParams || []);

    try {
        const stream = client.query(query);
        const csvStream = new PassThrough();
        let isFirstLine = true;

        stream.on('data', (row) => {
            if (isFirstLine) {
                listToCsvLine(Object.keys(row));
                isFirstLine = false;
            }
            csvStream.write(listToCsvLine(Object.values(row)));
        });

        stream.on('end', () => {
            csvStream.end();
            client.release();
        });

        stream.on('error', (err) => {
            csvStream.destroy(err);
            client.release();
        });

        const webStream = nodeStreamToWebStream(csvStream);

        return new NextResponse(webStream, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': 'attachment; filename="ufo-sightings.csv"',
            },
        });
    }
    catch (error) {
        logger.error('Error handling request:', error);
        return NextResponse.error();
    }
}


async function searchGeoJson(userArgs: QueryParamsType) {
    const body: QueryResponseType = {
        msg: '',
        status: 200,
        dictionary: {} as MapDictionaryType,
        results: undefined,
    };

    let forErrorReporting = {};

    try {
        let sql: string;
        const sqlBits = constructSqlBits(userArgs);

        if (userArgs.zoom >= config.zoomLevelForPoints) {
            sql = geoJsonForPoints(sqlBits);
        }
        else {
            sql = geoJsonForClusters(sqlBits /*, userArgs*/);
        }

        const formattedQueryForLogging = sql.replace(/\$(\d+)/g, (_: string, index: number) => {
            const param = sqlBits.whereParams ? sqlBits.whereParams[index - 1] : undefined;
            return param === undefined ? '' : typeof param === 'string' ? `'${param}'` : String(param);
        });

        forErrorReporting = { sql, sqlBits, formattedQuery: formattedQueryForLogging, userArgs };

        const { rows } = await DBH.query(sql, sqlBits.whereParams ? sqlBits.whereParams : undefined);

        const features = rows[0].jsonb_build_object.features;

        if (features === null && config.api.debug) {
            logger.warn({ action: 'query', msg: 'Found no features', sql, sqlBits });
        }
        else {
            if (!rows[0].jsonb_build_object.pointsCount) {
                let pointsCount = 0;
                features.forEach((feature) => {
                    pointsCount += feature.properties.num_points;
                });
                rows[0].jsonb_build_object.pointsCount = pointsCount;
            }
        }

        body.results = rows[0].jsonb_build_object;
        body.dictionary = await getDictionary(body.results, sqlBits, userArgs);

        // console.debug(forErrorReporting);

        return NextResponse.json(body);
    }

    catch (e) {
        console.error(forErrorReporting);
        return NextResponse.json({ msg: 'Internal server error', error: e.message }, { status: 500 });
    }
}


function constructSqlBits(userArgs: QueryParamsType): SqlBitsType {
    const whereColumns: string[] = [];
    const selectColumns = [
        'id', 'location_text', 'address', 'report_text', 'datetime', 'point', 'duration_seconds',
    ];
    const whereParams: string[] = [];
    const orderByClause: string[] = [];

    whereColumns.push(`(point && ST_Transform(ST_MakeEnvelope($${whereParams.length + 1}, $${whereParams.length + 2}, $${whereParams.length + 3}, $${whereParams.length + 4}, 4326), 3857))`);

    whereParams.push(
        String(userArgs.minlng), String(userArgs.minlat), String(userArgs.maxlng), String(userArgs.maxlat)
    );

    if (userArgs.q !== undefined && userArgs.q !== '') {
        const searchWords = userArgs.q.split(' ');
        searchWords.forEach(word => whereParams.push(`%${word}%`));

        const searchConditions = searchWords.map(
            (_word, index) => `(location_text ILIKE $${whereParams.length - searchWords.length + index + 1} OR report_text ILIKE $${whereParams.length - searchWords.length + index + 1})`
        ).join(' AND ');

        whereColumns.push(`(${searchConditions})`);

        // Use last param added for similarity (pick first search word for example)
        selectColumns.push(
            `(
                COALESCE(similarity(location_text, $${whereParams.length - searchWords.length + 1}), 0.001) 
                +
                COALESCE(similarity(report_text, $${whereParams.length - searchWords.length + 1}), 0.001)
            ) / 2 AS search_score`
        );

        orderByClause.push('search_score DESC');
    }

    if (userArgs.from_date !== undefined && userArgs.to_date !== undefined) {
        whereColumns.push(
            `(datetime BETWEEN $${whereParams.length + 1} AND $${whereParams.length + 2})`
        );
        whereParams.push(
            userArgs.from_date,
            userArgs.to_date
        );
        orderByClause.push('datetime ' + userArgs.sort_order);
    }
    else if (userArgs.from_date !== undefined) {
        whereColumns.push(`(datetime >= $${whereParams.length + 1})`);
        whereParams.push(userArgs.from_date);
        orderByClause.push('datetime ' + userArgs.sort_order);
    }
    else if (userArgs.to_date !== undefined) {
        whereColumns.push(`(datetime <= $${whereParams.length + 1})`);
        whereParams.push(userArgs.to_date);
        orderByClause.push('datetime ' + userArgs.sort_order);
    }

    if (config.db.database === 'ufo') {
        selectColumns.push('shape', 'duration_seconds', 'rgb', 'colour', 'source');
        if (userArgs.source && userArgs.source !== 'not-specified') {
            whereColumns.push(`(source=$${whereParams.length + 1})`);
            whereParams.push(userArgs.source);
        }
    }

    const rv: SqlBitsType = {
        selectColumns: selectColumns,
        whereColumns: whereColumns,
        whereParams: whereParams,
        orderByClause: orderByClause.length ? orderByClause : undefined,
    };

    return rv;
}

async function getDictionary(featureCollection: FeatureCollection | undefined, sqlBits: SqlBitsType, userArgs: QueryParamsType) {
    const dictionary: MapDictionaryType = {
        datetime: {
            min: undefined,
            max: undefined,
        },
        selected_columns: sqlBits.selectColumns,
    };

    let min: Date | undefined = undefined;
    let max: Date | undefined = undefined;

    if (!featureCollection || !featureCollection.features) {
        logger.warn({ action: 'getDictionary', warning: 'no features', featureCollection });
        return dictionary;
    }

    for (const feature of featureCollection.features) {
        let thisDatetime: Date | undefined;

        try {
            thisDatetime = new Date(feature.properties?.datetime);
            if (isNaN(thisDatetime.getTime())) {
                thisDatetime = undefined;
            }
        } catch {
            thisDatetime = undefined;
        }

        if (typeof thisDatetime !== 'undefined') {
            if (typeof min === 'undefined' || thisDatetime.getTime() < min.getTime()) {
                min = thisDatetime;
            }
            if (typeof max === 'undefined' || thisDatetime.getTime() > max.getTime()) {
                max = thisDatetime;
            }
        }
    }

    dictionary.datetime = {
        min: typeof min !== 'undefined' ? new Date(min).getFullYear() : new Date(userArgs.from_date).getFullYear(),
        max: typeof max !== 'undefined' ? new Date(max).getFullYear() : new Date(userArgs.to_date).getFullYear(),
    };

    console.log(dictionary.datetime, min, max)

    return dictionary;
}

function getCleanArgs(req: Request) {
    const url = req.url || '';
    const { query } = parse(url, true); // TODO this is deprecated
    const userArgs: QueryParamsType = {
        zoom: parseInt(query.zoom as string),
        minlng: parseFloat(query.minlng as string),
        minlat: parseFloat(query.minlat as string),
        maxlng: parseFloat(query.maxlng as string),
        maxlat: parseFloat(query.maxlat as string),

        to_date: query.to_date ? (Array.isArray(query.to_date) ? query.to_date[0] : query.to_date) : undefined,
        from_date: query.from_date ? (Array.isArray(query.from_date) ? query.from_date[0] : query.from_date) : undefined,

        // Potentially the subject of a text search:
        q: query.q ? String(query.q).trim() : undefined,

        // Potentially the subject of the text search: undefined = search all cols defined in config.api.searchableTextColumnNames
        // Not yet implemented.
        q_subject: query.q_subject && config.api.searchableTextColumnNames.includes(
            Array.isArray(query.q_subject) ? query.q_subject[0] : query.q_subject
        ) ? String(query.q_subject) : undefined,

        sort_order: String(query.sort_order) === 'ASC' || String(query.sort_order) === 'DESC' ? String(query.sort_order) as 'ASC' | 'DESC' : undefined,
    };

    if (query.source && isFeatureSourceAttributeType(query.source)) {
        userArgs.source = query.source as FeatureSourceAttributeType;
    }

    if (userArgs.from_date && Number(userArgs.from_date) === 1) {
        delete userArgs.from_date;
    }

    if (userArgs.to_date && Number(userArgs.to_date) === 1) {
        delete userArgs.to_date;
    }

    if (userArgs.from_date) {
        const year = parseInt(userArgs.from_date);
        if (!isNaN(year)) {
            userArgs.from_date = new Date(Date.UTC(year, 0, 1, 0, 0, 0)).toISOString();
        }
    }
    if (userArgs.to_date) {
        const year = parseInt(userArgs.to_date);
        if (!isNaN(year)) {
            userArgs.to_date = new Date(Date.UTC(year, 11, 31, 23, 59, 59)).toISOString();
        }
    }

    if (!userArgs.sort_order) {
        userArgs.sort_order = 'DESC';
    }

    return (
        userArgs !== null &&
        userArgs.minlat !== undefined && userArgs.minlng !== undefined &&
        userArgs.maxlat !== undefined && userArgs.maxlng !== undefined
    ) ? userArgs : null;
}


function geoJsonForPoints(sqlBits: SqlBitsType) {
    return `SELECT jsonb_build_object(
            'type', 'FeatureCollection',
            'features', jsonb_agg(feature),
            'pointsCount', COUNT(*),
            'clusterCount', 0
        )
        FROM (
            SELECT jsonb_build_object(
                'type', 'Feature',
                'geometry', ST_AsGeoJSON(s.point, 3857)::jsonb,
                'properties', to_jsonb(s) - 'point'
            ) AS feature
            FROM (
                SELECT ${sqlBits.selectColumns.join(', ')} FROM sightings
                WHERE ${sqlBits.whereColumns.join(' AND ')}
                ${sqlBits.orderByClause ? ' ORDER BY ' + sqlBits.orderByClause.join(',') : ''}
            ) AS s
        ) AS fc` ;
}


function geoJsonForClusters(sqlBits: SqlBitsType) {
    // For cluster boudnaries, not currently used:  const eps = epsFromZoom(userArgs.zoom);
    // For heatmaps: 
    const eps = 1000 * 10;

    return `SELECT jsonb_build_object(
            'type', 'FeatureCollection',
            'features', jsonb_agg(feature),
            'pointsCount', 0,
            'clusterCount', COUNT(*)
        )
        FROM (
            SELECT jsonb_build_object(
                'type', 'Feature',
                'geometry', ST_AsGeoJSON(s.cluster_geom, 3857)::jsonb,
                'properties', jsonb_build_object(
                    'cluster_id', s.cluster_id,
                    'num_points', s.num_points
                )
            ) AS feature
            FROM (
                SELECT 
                    cluster_id,
                    ST_ConvexHull(ST_Collect(point)) AS cluster_geom,
                    COUNT(*) AS num_points
                FROM (
                    SELECT 
                        ST_ClusterDBSCAN(point, eps := ${eps}, minpoints := 1) OVER() AS cluster_id,
                        point
                    FROM sightings
                    WHERE ${sqlBits.whereColumns.join(' AND ')}
                ) AS clustered_points
                GROUP BY cluster_id
            ) AS s
        ) AS fc;
        `;
}


