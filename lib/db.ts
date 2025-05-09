import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export async function getNearbyPoints(lat: number, lon: number) {
    const { rows } = await pool.query('SELECT * FROM sightings');
    return rows;
}
