/**
 * TopSearch Validation Schema
 * Validates query parameters for the GET /api/v1/topsearch endpoint
 */

import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { Providers, DEFAULT_PROVIDER } from '../../shared/constants/providers';

const DEFAULT_LIMIT = 10;
const DEFAULT_OFFSET = 0;
const MIN_LIMIT = 1;
const MAX_LIMIT = 100;

export const topSearchQuerySchema = z.object({
  limit: z.coerce
    .number()
    .int('limit must be an integer')
    .min(MIN_LIMIT, `limit must be at least ${MIN_LIMIT}`)
    .max(MAX_LIMIT, `limit must be at most ${MAX_LIMIT}`)
    .default(DEFAULT_LIMIT),

  offset: z.coerce
    .number()
    .int('offset must be an integer')
    .min(0, 'offset must be 0 or greater')
    .default(DEFAULT_OFFSET),

  provider: z.enum(Object.values(Providers) as [string, ...string[]]).default(DEFAULT_PROVIDER),
});

export type TopSearchQuery = z.infer<typeof topSearchQuerySchema>;

/**
 * Validation middleware for the topsearch endpoint
 */
export function validateTopSearchQuery(req: Request, res: Response, next: NextFunction): void {
  try {
    topSearchQuerySchema.parse(req.query);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        ok: false,
        error: {
          code: 'validation_error',
          message: 'Invalid query parameters',
          details: {
            errors: error.issues.map((issue) => ({
              field: issue.path.join('.'),
              message: issue.message,
            })),
          },
        },
        meta: {
          generatedAt: new Date().toISOString(),
        },
      });
      return;
    }

    next(error);
  }
}
