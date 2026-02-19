/**
 * Routes Index
 * Mounts all application routes
 */

import { Router, Request, Response } from 'express';
import { SearchController } from '../controllers/SearchController';
import { HealthService } from '../../application/services/HealthService';
import { createSearchRoutes } from './searchRoutes';

export function createRoutes(
  searchController: SearchController,
  healthService?: HealthService
): Router {
  const router = Router();

  /**
   * Health check endpoint
   * GET /api/v1/health
   */
  router.get('/api/v1/health', (_req: Request, res: Response) => {
    const data: Record<string, unknown> = {
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };

    if (healthService) {
      const { ok, services } = healthService.check();
      data.services = services;
      res.status(200).json({ ok, data });
    } else {
      res.status(200).json({ ok: true, data });
    }
  });

  /**
   * Mount API routes
   */
  router.use('/api/v1', createSearchRoutes(searchController));

  return router;
}
