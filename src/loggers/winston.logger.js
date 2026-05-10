import winston from 'winston';
import { config } from '../config/config.js';

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const getLevel = () => {
  switch (config.NODE_ENV) {
    case 'production':
      return 'info';
    case 'testing':
      return 'warn';
    default:
      return 'debug';
  }
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'blue',
  http: 'white',
  debug: 'white',
};

winston.addColors(colors);

const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    // print extra metadata (error, stack, url etc.) if present
    const metaStr = Object.keys(meta).length ? '\n' + JSON.stringify(meta, null, 2) : '';
    return `${timestamp} [${level}]: ${message}${metaStr}`;
  })
);

// JSON format for production log files (readable by log tools)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }), // captures stack trace
  winston.format.json()
);

const logger = winston.createLogger({
  level: getLevel(),
  levels,
  transports: [
    new winston.transports.Console({
      format: consoleFormat,
    }),

    // Save errors to file in production
    ...(config.NODE_ENV === 'production'
      ? [
          new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            format: fileFormat,
          }),
          new winston.transports.File({
            filename: 'logs/combined.log',
            format: fileFormat,
          }),
        ]
      : []),
  ],
  exitOnError: false,
});

// Morgan stream
logger.stream = {
  write: (message) => logger.http(message.trim()),
};

export default logger;
