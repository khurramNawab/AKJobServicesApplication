import { AsyncLocalStorage } from "async_hooks";
import crypto from "crypto";
import pino from "pino";

// Node native AsyncLocalStorage for thread-local request context tracking
const asyncLocalStorage = new AsyncLocalStorage();

const isProd = process.env.NODE_ENV === "production";

// ─── Production Pino Async Logger Setup ─────────────────────────────────────────
let pinoLogger = null;
try {
  if (isProd) {
    pinoLogger = pino(
      {
        level: process.env.LOG_LEVEL || "info",
        formatters: {
          level: (label) => ({ level: label.toUpperCase() }),
        },
        timestamp: pino.stdTimeFunctions.isoTime,
      },
      pino.destination({ minLength: 4096, sync: false }) // 4KB buffer for extreme async throughput
    );

    // Periodic flush to guarantee no logs sit in memory buffer during low activity
    setInterval(() => {
      if (pinoLogger) pinoLogger.flush();
    }, 5000).unref();
  }
} catch (err) {
  console.error("⚠️ [Pino Initialization Failure] Fallback to stdout log stream:", err.message);
}

// ─── Telemetry Formatting Rules ─────────────────────────────────────────────
const COLORS = {
  info: "\x1b[32m",    // Green
  warn: "\x1b[33m",    // Yellow
  error: "\x1b[31m",   // Red
  security: "\x1b[35m" // Magenta
};
const RESET = "\x1b[0m";

const writeLog = (level, message, meta = {}) => {
  const store = asyncLocalStorage.getStore();
  const correlationId = store?.correlationId || "SYSTEM";

  const logPayload = {
    correlationId,
    ...meta,
  };

  // Route to high-speed Pino async stream if initialized in production
  if (pinoLogger) {
    const pinoLevel = level === "security" ? "warn" : level;
    pinoLogger[pinoLevel](logPayload, message);
  } else {
    // Custom structured fallback logging
    const logOutput = {
      timestamp: new Date().toISOString(),
      level,
      correlationId,
      message,
      ...meta,
    };
    if (isProd) {
      console.log(JSON.stringify(logOutput));
    } else {
      // Development: Colorized and easily readable console logs
      const color = COLORS[level] || RESET;
      const metaString = Object.keys(meta).length ? ` | ${JSON.stringify(meta)}` : "";
      console.log(
        `${color}[${level.toUpperCase()}]${RESET} [CID: ${correlationId}] ${message}${metaString}`
      );
    }
  }
};

// ─── Logger Export Interface ────────────────────────────────────────────────
export const logger = {
  info: (message, meta) => writeLog("info", message, meta),
  warn: (message, meta) => writeLog("warn", message, meta),
  error: (message, meta) => writeLog("error", message, meta),
  security: (message, meta) => writeLog("security", message, meta),
};

// ─── Correlation ID Middleware ──────────────────────────────────────────────
export const correlationIdMiddleware = (req, res, next) => {
  const correlationId = req.headers["x-correlation-id"] || crypto.randomUUID();
  res.setHeader("x-correlation-id", correlationId);

  // Bind the request store lifecycle
  asyncLocalStorage.run({ correlationId }, () => {
    next();
  });
};

// ─── API Performance Monitor Middleware ──────────────────────────────────────
export const requestTimer = (req, res, next) => {
  const start = Date.now();
  
  res.on("finish", () => {
    const duration = Date.now() - start;
    
    // Slow endpoint threshold: > 500ms
    if (duration > 500) {
      logger.warn(`SLOW API WARNING: [${req.method}] ${req.originalUrl} took ${duration}ms`, {
        ip: req.ip || req.connection?.remoteAddress,
        userAgent: req.get("User-Agent"),
        durationMs: duration,
      });
    } else {
      logger.info(`[${req.method}] ${req.originalUrl} completed in ${duration}ms`, {
        status: res.statusCode,
      });
    }
  });

  next();
};

export const logSuspiciousActivity = (action, details, ip) => {
  logger.security(`SUSPICIOUS ACTIVITY: ${action}`, {
    details,
    ipAddress: ip,
  });
};
