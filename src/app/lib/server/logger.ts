import { createLogger, transports, format } from "winston";
import config from '../client/config';

const logger = createLogger({
    level: config.log.level,
    format: format.combine(format.timestamp(), format.json()),
    transports: [new transports.Console()],
});

export { logger };
