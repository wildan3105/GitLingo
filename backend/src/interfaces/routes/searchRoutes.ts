/**
 * Search Routes
 * Defines routes for the search endpoint
 */

import { Router } from 'express';
import { SearchController } from '../controllers/SearchController';
import { validateSearchQuery } from '../validation/searchSchema';

export function createSearchRoutes(searchController: SearchController): Router {
  const router = Router();

  /**
   * GET /api/v1/search
   * Search language statistics for a user
   */
  router.get('/search', validateSearchQuery, searchController.search);

  return router;
}
