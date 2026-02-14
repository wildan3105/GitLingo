/**
 * SearchController
 * Handles HTTP requests for the search endpoint
 */

import { Request, Response, NextFunction } from 'express';
import { SearchService } from '../../application/services/SearchService';
import { SearchQuery } from '../validation/searchSchema';
import { DEFAULT_PROVIDER } from 'shared/constants/providers';

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
      case 'not_implemented':
        return 501; // Not implemented
      case 'network_error':
        return 503; // Service unavailable
      case 'timeout':
        return 504; // Gateway timeout
      default:
        return 500;
    }
  }
}
