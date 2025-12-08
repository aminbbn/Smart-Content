export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

export const logger = {
  log: (level: LogLevel, message: string, meta: any = {}) => {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...meta,
    };
    // In production, this would go to a logging service. For now, stdout is captured by Cloudflare.
    console.log(JSON.stringify(entry));
  },
  info: (msg: string, meta?: any) => logger.log(LogLevel.INFO, msg, meta),
  error: (msg: string, meta?: any) => logger.log(LogLevel.ERROR, msg, meta),
  warn: (msg: string, meta?: any) => logger.log(LogLevel.WARN, msg, meta),
  debug: (msg: string, meta?: any) => logger.log(LogLevel.DEBUG, msg, meta),
};