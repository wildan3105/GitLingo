/**
 * Search Validation Schema
 * Validates query parameters for the search endpoint
 */

import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { Providers, DEFAULT_PROVIDER } from '../../shared/constants/providers';

const MINIMUM_USERNAME_LENGTH = 1;
const MAXIMUM_USERNAME_LENGTH = 39;

/**
 * Zod schema for search query parameters
 */
export const searchQuerySchema = z.object({
  username: z
    .string()
    .min(MINIMUM_USERNAME_LENGTH, 'Username is required')
    .max(MAXIMUM_USERNAME_LENGTH, 'Username must be 39 characters or less')
    .regex(/^[A-Za-z0-9-]+$/, 'Username can only contain letters, numbers, and hyphens'),

  provider: z.enum(Object.values(Providers)).default(DEFAULT_PROVIDER).optional(),
});

export type SearchQuery = z.infer<typeof searchQuerySchema>;

/**
 * Validation middleware for search endpoint
 */
export function validateSearchQuery(req: Request, res: Response, next: NextFunction): void {
  try {
    // Validate query parameters (throws if invalid)
    searchQuerySchema.parse(req.query);

    // If validation passes, continue to controller
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        ok: false,
        provider: 'unknown',
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
