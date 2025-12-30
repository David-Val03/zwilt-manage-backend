import winston from "winston";

/**
 * Create and configure a Winston logger instance
 * Uses readable format for development, JSON for production
 * Log level is configurable via LOG_LEVEL environment variable
 */
const isDevelopment = process.env.NODE_ENV !== "production";

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp({
      format: () =>
        new Date().toISOString().replace("T", " ").slice(0, 19) + " [UTC]",
    }),
    winston.format.errors({ stack: true }),
    isDevelopment ? winston.format.simple() : winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp({
          format: () =>
            new Date().toISOString().replace("T", " ").slice(0, 19) + " [UTC]",
        }),
        winston.format.errors({ stack: true }),
        isDevelopment
          ? winston.format.combine(
              winston.format.colorize({ all: true }),
              winston.format.printf(({ level, message, ...meta }) => {
                const metaStr = Object.keys(meta).length
                  ? ` ${JSON.stringify(meta)}`
                  : "";
                return `${level}: ${message}${metaStr}`;
              })
            )
          : winston.format.json()
      ),
    }),
  ],
});

/**
 * Add additional transports to the logger
 * Example: addTransport(new winston.transports.File({ filename: 'error.log', level: 'error' }));
 */
export const addTransport = (transport: winston.transport) => {
  logger.add(transport);
};
