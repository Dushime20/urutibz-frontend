// Production-ready logging utility
const isDevelopment = import.meta.env.MODE === 'development';

export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      console.log(...args);
    }
  },
  error: (...args: any[]) => {
    // Always log errors, even in production
    console.error(...args);
  },
  warn: (...args: any[]) => {
    if (isDevelopment) {
      console.warn(...args);
    }
  },
  info: (...args: any[]) => {
    if (isDevelopment) {
      console.info(...args);
    }
  },
  debug: (...args: any[]) => {
    if (isDevelopment) {
      console.debug(...args);
    }
  },
  group: (...args: any[]) => {
    if (isDevelopment) {
      console.group(...args);
    }
  },
  groupEnd: () => {
    if (isDevelopment) {
      console.groupEnd();
    }
  }
};

// For production monitoring (optional)
export const productionLogger = {
  error: (error: any, context?: string) => {
    // Send to monitoring service in production
    if (!isDevelopment) {
      // Example: Send to Sentry, LogRocket, etc.
      // Sentry.captureException(error, { extra: { context } });
    }
    console.error(error);
  },
  info: (message: string, data?: any) => {
    // Send important events to monitoring
    if (!isDevelopment) {
      // Example: Analytics tracking
    }
  }
}; 