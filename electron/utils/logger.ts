type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel: LogLevel = (process.env.NODE_ENV === 'development' || process.env.VITE_DEV_SERVER_URL)
  ? 'debug'
  : 'info';

function getTimestamp(): string {
  return new Date().toISOString();
}

function formatMessage(level: LogLevel, args: unknown[]): string {
  const timestamp = getTimestamp();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
  const message = args
    .map((arg) => {
      if (typeof arg === 'string') return arg;
      if (arg instanceof Error) return `${arg.message}\n${arg.stack || ''}`;
      try {
        return JSON.stringify(arg);
      } catch {
        return String(arg);
      }
    })
    .join(' ');

  return `${prefix} ${message}`;
}

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[currentLevel];
}

export const logger = {
  debug(...args: unknown[]): void {
    if (shouldLog('debug')) {
      console.debug(formatMessage('debug', args));
    }
  },

  info(...args: unknown[]): void {
    if (shouldLog('info')) {
      console.info(formatMessage('info', args));
    }
  },

  warn(...args: unknown[]): void {
    if (shouldLog('warn')) {
      console.warn(formatMessage('warn', args));
    }
  },

  error(...args: unknown[]): void {
    if (shouldLog('error')) {
      console.error(formatMessage('error', args));
    }
  },
};
