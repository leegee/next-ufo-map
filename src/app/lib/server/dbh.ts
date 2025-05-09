import pg from "pg"; // TODO Check out pgBouncer
import config, { isNextJs, VercelDbConfig, OurDbConfig } from '../shared/config';

let poolConfig: pg.PoolConfig;

if (isNextJs) {
    const dbConfig = config.db as VercelDbConfig;
    poolConfig = {
        connectionString: dbConfig.POSTGRES_URL
    };
} else {
    const dbConfig = config.db as OurDbConfig;
    poolConfig = {
        user: dbConfig.user,
        password: dbConfig.password,
        host: dbConfig.host,
        port: Number(dbConfig.port),
        database: dbConfig.database,
    };
}

export const pool = new pg.Pool(poolConfig);

export default pool;

export function finaliseDbh() {
    if (isNextJs) {
        pool.end();
    }
}
