/**
 * Error Handler Middleware
 * Global error handler for Express
 */

import { Request, Response, NextFunction } from 'express';
import pino from 'pino';
import { isProduction } from '../../shared/config/env';

const logger = pino();

/**
 * Global error handler middleware
 * Must be registered after all routes
 */
export function errorHandler(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log the error
  logger.error(
    {
      err: error,
      stack: error.stack,
    },
    'Unhandled error'
  );

  // Don't leak stack traces in production
  const errorResponse = {
    ok: false,
    provider: 'unknown',
    error: {
      code: 'internal_server_error',
      message: isProduction() ? 'An unexpected error occurred' : error.message,
      ...(isProduction() ? {} : { stack: error.stack }),
    },
    meta: {
      generatedAt: new Date().toISOString(),
    },
  };

  res.status(500).json(errorResponse);
}
