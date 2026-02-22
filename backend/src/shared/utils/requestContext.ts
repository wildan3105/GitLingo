/**
 * RequestContext - AsyncLocalStorage-based request scoping
 *
 * Propagates the pino-http request logger (which carries reqId) through the
 * async call chain without touching any service signatures.
 *
 * Usage:
 *   - Middleware in index.ts binds req.log into the store for each request
 *   - createLogger() in logger.ts reads the store at log-call time
 *   - Code running outside a request context (startup, shutdown) gets undefined
 */

import { AsyncLocalStorage } from 'async_hooks';
import pino from 'pino';

export const requestContext = new AsyncLocalStorage<pino.Logger>();

export function getRequestLogger(): pino.Logger | undefined {
  return requestContext.getStore();
}
