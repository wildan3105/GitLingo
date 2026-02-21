/**
 * Routes Index
 * Single assembly point — mounts all controllers under /api/v1.
 * Route definitions live in each controller's getRouter().
 */

import { Router } from 'express';
import { SearchController } from '../controllers/SearchController';
import { TopSearchController } from '../controllers/TopSearchController';
import { HealthController } from '../controllers/HealthController';

export function createRoutes(
  searchController: SearchController,
  topSearchController: TopSearchController,
  healthController: HealthController
): Router {
  const router = Router();
  const v1 = Router();

  v1.use(healthController.getRouter());
  v1.use(searchController.getRouter());
  v1.use(topSearchController.getRouter());

  router.use('/api/v1', v1);

  return router;
}
