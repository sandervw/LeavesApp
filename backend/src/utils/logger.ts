import winston from 'winston';

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' }
});
// Always log to console for Azure Container Apps (no persistent file storage)
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
} else {
  // In production, use JSON format for better log aggregation
  logger.add(new winston.transports.Console({
    format: winston.format.json(),
  }));
}