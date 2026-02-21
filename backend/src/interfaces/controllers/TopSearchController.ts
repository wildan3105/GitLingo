/**
 * TopSearchController
 * Handles HTTP requests for GET /api/v1/topsearch
 */

import { Request, Response, NextFunction, Router } from 'express';
import { TopSearchService } from '../../application/services/TopSearchService';
import { TopSearchQuery, validateTopSearchQuery } from '../validation/topSearchSchema';
import { DEFAULT_PROVIDER } from '../../shared/constants/providers';

export class TopSearchController {
  private readonly router: Router;
  private readonly topSearchService: TopSearchService;

  constructor(topSearchService: TopSearchService) {
    this.topSearchService = topSearchService;
    this.router = Router();
    this.router.get('/topsearch', validateTopSearchQuery, this.getTopSearches);
  }

  getRouter(): Router {
    return this.router;
  }

  /**
   * Handle GET /api/v1/topsearch
   * Returns paginated top search leaderboard.
   * Always responds 200 — service never throws (errors return empty data).
   */
  public getTopSearches = (req: Request, res: Response, next: NextFunction): void => {
    try {
      const {
        limit = 10,
        offset = 0,
        provider = DEFAULT_PROVIDER,
      } = req.query as unknown as TopSearchQuery;

      // Coerce to numbers: the Zod middleware validates but Express req.query values are
      // always strings; the service and pagination must receive numeric types.
      const result = this.topSearchService.getTopSearches({
        provider,
        limit: Number(limit),
        offset: Number(offset),
      });

      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
