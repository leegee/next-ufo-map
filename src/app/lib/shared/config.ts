/**
 * Configuration for database and API.
 * Handles different environments (local vs. Vercel).
 * Porting still in progress. TODO move server config out
 */

const env = process.env;

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

export type ConfigType = {
    flags: { [key: string]: boolean };
    locale: string;
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
    gui: {
        debounce: number;
        apiRequests: {
            debounceMs: number;
        };
        map: {
            centre: [number, number];
            cluster_eps_metres: number;
        };
    };
    zoomLevelForPoints: number;
    zoomLevelForPointDetails: number;
    minQLength: number;
    log: {
        level: string;
    };
};

export const isNextJs = env && env.VERCEL_URL ? true : false;

export function isCombinedDb(): boolean {
    return config.db.database === 'ufo';
}

const config: ConfigType = {
    locale: 'no',
    log: {
        level: 'info',
    },
    db: env && env.POSTGRES_URL
        ? {
            POSTGRES_URL: env.POSTGRES_URL,
            database: env.UFO_DATABASE || env.POSTGRES_DATABASE || 'ufo',
        }
        : {
            host: env.PGHOST || env.POSTGRES_HOST || 'localhost',
            port: parseInt(env.PGPORT || env.POSTGRES_PORT || '5432'),
            user: env.PGUSER || env.POSTGRES_USER || 'postgres',
            password: env.PGPASSWORD || env.POSTGRES_PASSWORD || 'password',
            database: env.UFO_DATABASE || env.POSTGRES_DATABASE || 'ufo',
        },
    api: {
        url: isNextJs ? `//${env.NEXT_PUBLIC_VERCEL_URL}` : (env.NEXT_PUBLIC_API_URL || '//localhost:3000'),
        endpoints: {
            search: `/api/search`,
            details: `/api/details`,
            tiles: `/api/tiles`,
        },
        searchableTextColumnNames: ['location_text', 'report_text'],
        debug: true,
    },
    gui: {
        debounce: 500,
        apiRequests: {
            debounceMs: 1000,
        },
        map: {
            centre: [18, 64] as [number, number],
            cluster_eps_metres: 50000,
        },
    },
    zoomLevelForPoints: 8,
    zoomLevelForPointDetails: 11,
    minQLength: 3,
    flags: {
        USE_BOUNDS_WITHOUT_PANEL: false,
    },
};

console.log(config);

export default config;
