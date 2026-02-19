/**
 * TopSearch Routes
 * Defines routes for the topsearch endpoint
 */

import { Router } from 'express';
import { TopSearchController } from '../controllers/TopSearchController';
import { validateTopSearchQuery } from '../validation/topSearchSchema';

export function createTopSearchRoutes(topSearchController: TopSearchController): Router {
  const router = Router();

  /**
   * GET /api/v1/topsearch
   * Returns the paginated top search leaderboard
   */
  router.get('/topsearch', validateTopSearchQuery, topSearchController.getTopSearches);

  return router;
}
