/**
 * Simple console logger with timestamp and level formatting.
 * Provides info, warn, error, and debug log levels.
 */

const getTimestamp = () => {
  return new Date().toISOString();
};

const formatMessage = (level, ...args) => {
  const message = args
    .map((arg) => {
      if (arg instanceof Error) {
        return arg.stack || arg.message;
      }
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg, null, 2);
        } catch {
          return String(arg);
        }
      }
      return String(arg);
    })
    .join(' ');

  return `[${getTimestamp()}] [${level}] ${message}`;
};

const logger = {
  /**
   * Log informational messages.
   * @param  {...any} args - Messages to log
   */
  info(...args) {
    console.log(formatMessage('INFO', ...args));
  },

  /**
   * Log warning messages.
   * @param  {...any} args - Messages to log
   */
  warn(...args) {
    console.warn(formatMessage('WARN', ...args));
  },

  /**
   * Log error messages.
   * @param  {...any} args - Messages to log
   */
  error(...args) {
    console.error(formatMessage('ERROR', ...args));
  },

  /**
   * Log debug messages (only in development).
   * @param  {...any} args - Messages to log
   */
  debug(...args) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(formatMessage('DEBUG', ...args));
    }
  }
};

module.exports = logger;
