/* eslint-disable @typescript-eslint/no-explicit-any */
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import { utilities as nestWinstonModuleUtilities } from 'nest-winston';

const tsFormat = (): string => {
  const now = new Date();
  const isOffset = 5.5 * 60 * 60 * 1000;
  const istTime = new Date(now.getTime() + isOffset);

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  const day = String(istTime.getUTCDate()).padStart(2, '0');
  const month = months[istTime.getUTCMonth()];
  const year = istTime.getUTCFullYear();
  const hours = String(istTime.getUTCHours()).padStart(2, '0');
  const minutes = String(istTime.getUTCMinutes()).padStart(2, '0');
  const seconds = String(istTime.getUTCSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

const productionFormat = winston.format.printf(
  ({ timestamp, level, message, context, trace, error, ...metadata }) => {
    const logObject: any = {
      '@timestamp': timestamp,
      level,
      message,
      context: context || 'Application',
    };

    if (error) logObject.error = error;
    if (trace) logObject.trace = trace;

    if (Object.keys(metadata).length > 0) {
      logObject.metadata = metadata;
    }

    return JSON.stringify(logObject);
  }
);

const consoleTransport = new winston.transports.Console({
  level: process.env['NODE_ENV'] === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.colorize(),
    nestWinstonModuleUtilities.format.nestLike('PosterParlor', {
      prettyPrint: true,
      colors: true,
    })
  ),
});

// Info transport - logs info, warn, and debug (but NOT error)
const fileInfoTransport = new winston.transports.DailyRotateFile({
  dirname: 'logs',
  filename: 'info-%DATE%.log',
  level: 'info',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '30d',
  format: winston.format.combine(
    winston.format.timestamp({ format: tsFormat }),
    // Filter out error level logs from info file
    winston.format((info) => {
      return info.level === 'error' ? false : info;
    })(),
    productionFormat
  ),
});

// Error transport - logs ONLY errors
const fileErrorTransport = new winston.transports.DailyRotateFile({
  dirname: 'logs',
  filename: 'error-%DATE%.log',
  level: 'error', // 🔥 THIS IS THE KEY FIX
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '45d',
  format: winston.format.combine(
    winston.format.timestamp({ format: tsFormat }),
    productionFormat
  ),
});

export const loggerConfig = {
  format: winston.format.combine(
    winston.format.timestamp({ format: tsFormat }),
    winston.format.errors({ stack: true })
  ),

  transports: [consoleTransport, fileInfoTransport, fileErrorTransport],

  exceptionHandlers: [fileErrorTransport],
  rejectionHandlers: [fileErrorTransport],
};
