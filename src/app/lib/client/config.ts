/**
 * Configuration for database and API.
 * Handles different environments (local vs. Vercel).
 * Porting still in progress. TODO move server config out
 */

export type ConfigType = {
    flags: { [key: string]: boolean };
    locale: string;
    db: {
        database: string
    };
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

export function isCombinedDb(): boolean {
    return config.db.database === 'ufo';
}

const config: ConfigType = {
    locale: 'no',
    log: {
        level: 'info',
    },
    db: {
        database: process.env.NEXT_PUBLIC_UFO_DATABASE || process.env.NEXT_PUBLIC_POSTGRES_DATABASE || 'ufo',
    },
    api: {
        url: (process.env.NEXT_PUBLIC_API_URL || ''),
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
