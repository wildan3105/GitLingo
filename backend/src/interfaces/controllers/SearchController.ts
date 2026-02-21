/**
 * SearchController
 * Handles HTTP requests for the search endpoint
 */

import { Request, Response, NextFunction, Router } from 'express';
import { SearchPort } from '../../application/ports/SearchPort';
import { TopSearchService } from '../../application/services/TopSearchService';
import { SearchQuery, validateSearchQuery } from '../validation/searchSchema';
import { DEFAULT_PROVIDER } from '../../shared/constants/providers';

export class SearchController {
  private readonly router: Router;
  private readonly searchService: SearchPort;
  private readonly topSearchService: TopSearchService | undefined;

  constructor(searchService: SearchPort, topSearchService?: TopSearchService) {
    this.searchService = searchService;
    this.topSearchService = topSearchService;
    this.router = Router();
    this.router.get('/search', validateSearchQuery, this.search);
  }

  getRouter(): Router {
    return this.router;
  }

  /**
   * Handle search request
   * GET /api/v1/search?username=<username>&provider=<provider>
   */
  public search = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Query params are already validated by middleware
      const { username, provider = DEFAULT_PROVIDER } = req.query as unknown as SearchQuery;

      // Check if provider is implemented
      if (provider !== DEFAULT_PROVIDER) {
        res.status(501).json({
          ok: false,
          provider,
          error: {
            code: 'not_implemented',
            message: `Provider '${provider}' is not yet implemented. Only 'github' is currently supported.`,
            details: { provider, supportedProviders: [DEFAULT_PROVIDER] },
          },
          meta: {
            generatedAt: new Date().toISOString(),
          },
        });
        return;
      }

      // Call application service
      const result = await this.searchService.searchLanguageStatistics(username);

      // Determine HTTP status code based on result
      if (result.ok) {
        res.status(200).json(result);
        this.topSearchService?.record(username, provider, result.profile.avatarUrl ?? null);
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
        return 403;
      case 'invalid_token':
        return 401;
      case 'insufficient_scopes':
        return 403;
      case 'validation_error':
        return 400;
      case 'not_implemented':
        return 501;
      case 'network_error':
        return 503;
      case 'timeout':
        return 504;
      default:
        return 500;
    }
  }
}
