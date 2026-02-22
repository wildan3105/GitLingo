/**
 * Logger - Shared Singleton
 *
 * A single pino root logger instance for the entire application.
 * Node.js module caching guarantees singleton semantics — the same instance
 * is returned on every import, with no getInstance() boilerplate needed.
 *
 * Usage:
 *   import { createLogger } from '../../shared/utils/logger';
 *   const logger = createLogger('MyService');
 *   logger.info({ userId }, 'User fetched');
 */

import pino from 'pino';
import { config } from '../config/env';
import { getRequestLogger } from './requestContext';

/**
 * Root logger.
 *
 * - level     : controlled by LOG_LEVEL env var (trace | debug | info | warn | error | fatal)
 * - timestamp : ISO 8601 strings ("2026-02-22T10:30:45.123Z") instead of epoch ms
 */
export const logger = pino({
  level: config.logLevel,
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: ['GITHUB_TOKEN', 'req.headers.authorization', 'req.headers.cookie'],
    censor: '[redacted]',
  },
});

/**
 * Create a named component logger.
 *
 * Returns a Proxy that resolves the active logger lazily at each log call:
 * - Inside a request context: delegates to req.log.child({ name }),
 *   so every log line automatically carries the request's reqId.
 * - Outside a request context (startup, shutdown): delegates to the
 *   root logger child, which has no reqId.
 *
 * @param name - Component or service identifier (e.g. 'CachedSearchService')
 */
export function createLogger(name: string): pino.Logger {
  const base = logger.child({ name });
  return new Proxy(base, {
    get(_target: pino.Logger, prop: string | symbol): unknown {
      const source = getRequestLogger()?.child({ name }) ?? base;
      const val = (source as unknown as Record<string | symbol, unknown>)[prop];
      if (typeof val !== 'function') return val;
      return (val as { bind(thisArg: pino.Logger): unknown }).bind(source);
    },
  });
}
