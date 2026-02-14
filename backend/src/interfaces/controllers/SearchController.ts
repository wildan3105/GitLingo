/**
 * SearchController
 * Handles HTTP requests for the search endpoint
 */

import { Request, Response, NextFunction } from 'express';
import { SearchService } from '../../application/services/SearchService';
import { SearchQuery } from '../validation/searchSchema';

export class SearchController {
  private readonly searchService: SearchService;

  constructor(searchService: SearchService) {
    this.searchService = searchService;
  }

  /**
   * Handle search request
   * GET /api/v1/search?username=<username>&provider=<provider>
   */
  public search = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Query params are already validated by middleware
      const { username } = req.query as unknown as SearchQuery;

      // Call application service
      const result = await this.searchService.searchLanguageStatistics(username);

      // Determine HTTP status code based on result
      if (result.ok) {
        res.status(200).json(result);
        return;
      }

      // Handle error responses with appropriate status codes
      const statusCode = this.getStatusCodeForError(result.error.code);
      res.status(statusCode).json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Map error codes to HTTP status codes
   */
  private getStatusCodeForError(errorCode: string): number {
    switch (errorCode) {
      case 'user_not_found':
        return 404;
      case 'rate_limited':
        return 429;
      case 'validation_error':
        return 400;
      case 'network_error':
        return 503; // Service unavailable
      default:
        return 500;
    }
  }
}
