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

/**
 * Root logger.
 *
 * - level     : controlled by LOG_LEVEL env var (trace | debug | info | warn | error | fatal)
 * - timestamp : ISO 8601 strings ("2026-02-22T10:30:45.123Z") instead of epoch ms
 */
export const logger = pino({
  level: config.logLevel,
  timestamp: pino.stdTimeFunctions.isoTime,
});

/**
 * Create a child logger bound to a named component.
 * Inherits the root level and timestamp format; adds a `name` field to every line.
 *
 * @param name - Component or service identifier (e.g. 'CachedSearchService')
 */
export function createLogger(name: string): pino.Logger {
  return logger.child({ name });
}
