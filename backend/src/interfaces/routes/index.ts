/**
 * Routes Index
 * Mounts all application routes
 */

import { Router, Request, Response } from 'express';
import { SearchController } from '../controllers/SearchController';
import { createSearchRoutes } from './searchRoutes';

export function createRoutes(searchController: SearchController): Router {
  const router = Router();

  /**
   * Health check endpoint
   * GET /health
   */
  router.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  /**
   * Mount API routes
   */
  router.use('/api/v1', createSearchRoutes(searchController));

  return router;
}
