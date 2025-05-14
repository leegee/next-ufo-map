import { NextResponse } from 'next/server';
import { pool } from '../../lib/server/dbh';
import { CustomError } from '../../lib/server/CustomError';
import { logger } from '../../lib/server/logger';

// Generate MVT tile from PostGIS data
async function generateTile(z: number, x: number, y: number) {
    const sql = `
        SELECT ST_AsMVT(m, 'sightings') AS mvt
        FROM (
            SELECT
                id,
                *,
                ST_AsMVTGeom(
                    point, 
                    ST_TileEnvelope($1, $2, $3),  -- Use z, x, y to get the bounding box
                    4096,  -- extent
                    256,   -- tile size
                    false
                ) AS geometry
            FROM sightings
            WHERE point && ST_TileEnvelope($1, $2, $3)  -- Does point's bounding box intersect the tile?
        ) AS m
    `;

    const { rows } = await pool.query(sql, [z, x, y]);

    if (rows.length === 0 || !rows[0].mvt) {
        throw new CustomError({
            action: 'tiles',
            msg: `No data found for z:${z}, x:${x}, y:${y}`,
            details: JSON.stringify({ x, y, z }),
        });
    }

    const buffer = Buffer.from(rows[0].mvt); // Convert to Buffer

    return buffer;
}

// API route for tile generation
export async function GET(
    req: Request,
    { params }: { params: Promise<{ z: string, x: string, y: string }> }
) {
    const { z, x, y } = await params;

    const zInt = parseInt(z, 10);
    const xInt = parseInt(x, 10);
    const yInt = parseInt(y, 10);

    if (isNaN(zInt) || isNaN(xInt) || isNaN(yInt)) {
        throw new CustomError({
            action: 'tiles',
            msg: 'Invalid tile coordinates',
            details: 'z, x, and y must be integers',
        });
    }

    try {
        const tileData = await generateTile(zInt, xInt, yInt);

        return NextResponse.json(tileData, {
            headers: {
                'Content-Type': 'application/x-protobuf',
                'Cache-Control': 'public, max-age=3600', // Cache tile for 1 hour
            },
        });
    } catch (e) {
        logger.error(`Error generating tile: ${(e as Error).message}`);
        return NextResponse.json(
            { msg: 'Error generating tile', error: (e as Error).message },
            { status: 500 }
        );
    }
}
