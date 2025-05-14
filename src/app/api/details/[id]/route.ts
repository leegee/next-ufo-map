// src\app\api\details\[id]\route.ts

import { NextResponse } from 'next/server';
import { FetchSightingDetailsResponseType } from '../../../types';
import { isCombinedDb } from '../../../lib/server/config';
import { pool } from '../../../lib/server/dbh';

// import { CustomError } from '../../lib/shared/CustomError';

const DBH = pool;

export async function GET(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;

    const body: FetchSightingDetailsResponseType = {
        msg: '',
        status: 200,
        details: {},
    };

    if (!id) {
        return NextResponse.error();
        // throw new CustomError({
        //     action: 'details',
        //     msg: 'Missing request parameter',
        //     details: ['id'],
        // });
    }

    try {
        // Construct the SQL query based on the database configuration
        const sql = isCombinedDb()
            ? `SELECT * FROM sightings WHERE id=$1`
            : `SELECT sightings.*, 
                observed_via.*, 
                yes_no_dontknow.*, 
                sky_condition.*, 
                sun_position.*, 
                fylke.*, 
                report_status.* 
                FROM sightings
                LEFT JOIN report_status ON sightings.report_status = report_status.id
                LEFT JOIN observed_via ON sightings.observed_via_id = observed_via.id
                LEFT JOIN yes_no_dontknow ON sightings.physical_effects = yes_no_dontknow.id
                LEFT JOIN sky_condition ON sightings.sky_condition_id = sky_condition.id
                LEFT JOIN sun_position ON sightings.sun_position_id = sun_position.id
                LEFT JOIN fylke ON sightings.Fylke = fylke.id
                WHERE sightings.id=$1`;

        const { rows } = await DBH.query(sql, [id]);
        body.details = rows[0];
    } catch (e) {
        return NextResponse.json(
            { msg: 'Error retrieving sighting details', error: (e as Error).message },
            { status: 500 }
        );
    }

    return NextResponse.json(body);
}
