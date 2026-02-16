/**
 * SearchController Unit Tests
 */

import { Request, Response, NextFunction } from 'express';
import { SearchController } from '../../interfaces/controllers/SearchController';
import { SearchService } from '../../application/services/SearchService';

describe('SearchController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;
  let mockSearchService: jest.Mocked<SearchService>;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });

    mockRequest = {
      query: { username: 'testuser' },
    };
    mockResponse = {
      status: statusMock,
    };
    mockNext = jest.fn();

    // Create a mock SearchService
    mockSearchService = {
      searchLanguageStatistics: jest.fn(),
    } as any;
  });

  describe('search', () => {
    it('should return 200 for successful search', async () => {
      const successResult = {
        ok: true as const,
        provider: 'github',
        profile: {
          username: 'testuser',
          type: 'user' as const,
          providerUserId: '123',
          isVerified: true,
        },
        series: [],
        metadata: {
          generatedAt: new Date().toISOString(),
          unit: 'repos' as const,
          limit: 0,
        },
      };

      mockSearchService.searchLanguageStatistics.mockResolvedValue(successResult);

      const controller = new SearchController(mockSearchService);
      await controller.search(mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(successResult);
    });

    it('should return 404 for user not found', async () => {
      const errorResult = {
        ok: false as const,
        provider: 'github',
        error: {
          code: 'user_not_found',
          message: 'User not found',
        },
        meta: {
          generatedAt: new Date().toISOString(),
        },
      };

      mockSearchService.searchLanguageStatistics.mockResolvedValue(errorResult);

      const controller = new SearchController(mockSearchService);
      await controller.search(mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith(errorResult);
    });

    it('should return 429 for rate limit', async () => {
      const errorResult = {
        ok: false as const,
        provider: 'github',
        error: {
          code: 'rate_limited',
          message: 'Rate limited',
          retry_after_seconds: 60,
        },
        meta: {
          generatedAt: new Date().toISOString(),
        },
      };

      mockSearchService.searchLanguageStatistics.mockResolvedValue(errorResult);

      const controller = new SearchController(mockSearchService);
      await controller.search(mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(429);
      expect(jsonMock).toHaveBeenCalledWith(errorResult);
    });

    it('should return 503 for network error', async () => {
      const errorResult = {
        ok: false as const,
        provider: 'github',
        error: {
          code: 'network_error',
          message: 'Network error',
        },
        meta: {
          generatedAt: new Date().toISOString(),
        },
      };

      mockSearchService.searchLanguageStatistics.mockResolvedValue(errorResult);

      const controller = new SearchController(mockSearchService);
      await controller.search(mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(503);
      expect(jsonMock).toHaveBeenCalledWith(errorResult);
    });

    it('should call next() with error if exception occurs', async () => {
      const error = new Error('Unexpected error');
      mockSearchService.searchLanguageStatistics.mockRejectedValue(error);

      const controller = new SearchController(mockSearchService);
      await controller.search(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('should return 501 for unimplemented provider (gitlab)', async () => {
      mockRequest.query = { username: 'testuser', provider: 'gitlab' };

      const controller = new SearchController(mockSearchService);
      await controller.search(mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(501);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          ok: false,
          provider: 'gitlab',
          error: expect.objectContaining({
            code: 'not_implemented',
            message: expect.stringContaining('gitlab'),
          }),
        })
      );
      expect(mockSearchService.searchLanguageStatistics).not.toHaveBeenCalled();
    });

    it('should return 501 for unimplemented provider (bitbucket)', async () => {
      mockRequest.query = { username: 'testuser', provider: 'bitbucket' };

      const controller = new SearchController(mockSearchService);
      await controller.search(mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(501);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          ok: false,
          provider: 'bitbucket',
          error: expect.objectContaining({
            code: 'not_implemented',
          }),
        })
      );
      expect(mockSearchService.searchLanguageStatistics).not.toHaveBeenCalled();
    });

    it('should work with github provider (default)', async () => {
      mockRequest.query = { username: 'testuser', provider: 'github' };

      const successResult = {
        ok: true as const,
        provider: 'github',
        profile: {
          username: 'testuser',
          type: 'user' as const,
          providerUserId: '123',
          isVerified: true,
        },
        series: [],
        metadata: {
          generatedAt: new Date().toISOString(),
          unit: 'repos' as const,
          limit: 0,
        },
      };

      mockSearchService.searchLanguageStatistics.mockResolvedValue(successResult);

      const controller = new SearchController(mockSearchService);
      await controller.search(mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(mockSearchService.searchLanguageStatistics).toHaveBeenCalledWith('testuser');
    });
  });
});
