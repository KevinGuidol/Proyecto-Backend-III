// src/utils/logger.js
import log4js from 'log4js';

log4js.levels.addLevels({
  DEBUG: { value: 10000, colour: 'blue' },
  HTTP: { value: 20000, colour: 'green' },
  INFO: { value: 30000, colour: 'cyan' },
  WARNING: { value: 40000, colour: 'yellow' },
  ERROR: { value: 50000, colour: 'red' },
  FATAL: { value: 60000, colour: 'magenta' },
});

log4js.configure({
  appenders: {
    console: {
      type: 'console',
      layout: {
        type: 'pattern',
        pattern: '%d{yyyy-MM-dd hh:mm:ss.SSS} [%p]: %m',
      },
    },
    debugFile: {
      type: 'file',
      filename: 'debug.log',
    },
    errorFile: {
      type: 'file',
      filename: 'errors.log',
    },
    errorFilter: {
      type: 'logLevelFilter',
      appender: 'errorFile',
      level: 'error',
    },
  },
  categories: {
    default: {
      appenders: ['console', 'debugFile', 'errorFilter'],
      level: 'DEBUG',
    },
    production: {
      appenders: ['console', 'errorFile'],
      level: 'INFO',
    },
  },
});

export const getLogger = () => {
  const env = process.env.NODE_ENV || 'development';
  return log4js.getLogger(env === 'production' ? 'production' : 'default');
};