import clientConfig, { isCombinedDb, type ConfigType as ClientConfigType } from '../client/config';

export { isCombinedDb };

export type OurDbConfig = {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
};

export type VercelDbConfig = {
    POSTGRES_URL: string;
    database: string;
};

export type ConfigType = ClientConfigType & {
    flags: { [key: string]: boolean };
    db: VercelDbConfig | OurDbConfig;
    api: {
        url: string;
        endpoints: {
            search: string;
            details: string;
            tiles: string;
        };
        searchableTextColumnNames: string[];
        debug: boolean;
    };
    log: {
        level: string;
    };
};

const config: ConfigType = {
    ...clientConfig,
    log: {
        level: 'info',
    },
    db: process.env && process.env.POSTGRES_URL
        ? {
            POSTGRES_URL: process.env.POSTGRES_URL,
            database: process.env.UFO_DATABASE || process.env.POSTGRES_DATABASE || 'ufo',
        }
        : {
            host: process.env.PGHOST || process.env.POSTGRES_HOST || 'localhost',
            port: parseInt(process.env.PGPORT || process.env.POSTGRES_PORT || '5432'),
            user: process.env.PGUSER || process.env.POSTGRES_USER || 'postgres',
            password: process.env.PGPASSWORD || process.env.POSTGRES_PASSWORD || 'password',
            database: process.env.UFO_DATABASE || process.env.POSTGRES_DATABASE || 'ufo',
        },
    api: {
        url: process.env.NEXT_PUBLIC_API_URL || '//localhost:3000',
        endpoints: {
            search: `/api/search`,
            details: `/api/details`,
            tiles: `/api/tiles`,
        },
        searchableTextColumnNames: ['location_text', 'report_text'],
        debug: true,
    },
    flags: {
    },
};

console.log(config);

export default config;
