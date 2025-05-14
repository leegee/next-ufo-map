import pg from "pg"; // TODO Check out pgBouncer
import config, { VercelDbConfig, OurDbConfig } from '../server/config';

let poolConfig: pg.PoolConfig;

// Could/should sort this out
if ((config.db as VercelDbConfig).POSTGRES_URL) {
    poolConfig = {
        connectionString: (config.db as VercelDbConfig).POSTGRES_URL
    };
} else {
    poolConfig = {
        user: (config.db as OurDbConfig).user,
        password: (config.db as OurDbConfig).password,
        host: (config.db as OurDbConfig).host,
        port: Number((config.db as OurDbConfig).port),
        database: (config.db as OurDbConfig).database,
    };
}

export const pool = new pg.Pool(poolConfig);

export default pool;

export function finaliseDbh() {
    pool.end();
}
