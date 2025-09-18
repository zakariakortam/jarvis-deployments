import winston from 'winston';
import path from 'path';

const logDir = 'logs';

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} [${level}]: ${stack || message}`;
  })
);

// Create logger instance
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { 
    service: 'energy-optimizer-api',
    version: process.env.npm_package_version || '1.0.0'
  },
  transports: [
    // Error log file
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    // Combined log file
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 10
    }),
    // Console output
    new winston.transports.Console({
      format: consoleFormat,
      level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug'
    })
  ],
  // Handle exceptions and rejections
  exceptionHandlers: [
    new winston.transports.File({ filename: path.join(logDir, 'exceptions.log') })
  ],
  rejectionHandlers: [
    new winston.transports.File({ filename: path.join(logDir, 'rejections.log') })
  ]
});

// Energy-specific logging utilities
export const energyLogger = {
  consumption: (deviceId: string, userId: string, kwh: number, cost: number) => {
    logger.info('Energy consumption recorded', {
      event: 'consumption_logged',
      deviceId,
      userId,
      consumption_kwh: kwh,
      cost_usd: cost,
      timestamp: new Date().toISOString()
    });
  },
  
  scheduling: (scheduleId: string, action: string, deviceId: string) => {
    logger.info('Schedule event', {
      event: 'schedule_action',
      scheduleId,
      action,
      deviceId,
      timestamp: new Date().toISOString()
    });
  },
  
  recommendation: (userId: string, type: string, potentialSavings: number) => {
    logger.info('Recommendation generated', {
      event: 'recommendation_created',
      userId,
      type,
      potential_savings: potentialSavings,
      timestamp: new Date().toISOString()
    });
  },
  
  alert: (userId: string, alertType: string, message: string) => {
    logger.warn('Energy alert triggered', {
      event: 'energy_alert',
      userId,
      alertType,
      message,
      timestamp: new Date().toISOString()
    });
  }
};

// Performance monitoring
export const performanceLogger = {
  apiRequest: (method: string, endpoint: string, duration: number, statusCode: number) => {
    logger.info('API request completed', {
      event: 'api_request',
      method,
      endpoint,
      duration_ms: duration,
      status_code: statusCode,
      timestamp: new Date().toISOString()
    });
  },
  
  dbQuery: (operation: string, collection: string, duration: number) => {
    logger.debug('Database operation', {
      event: 'db_operation',
      operation,
      collection,
      duration_ms: duration,
      timestamp: new Date().toISOString()
    });
  }
};

// If we're not in production, add debug logs to console
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat,
    level: 'debug'
  }));
}