/**
 * TopSearchController Unit Tests
 */

import { Request, Response, NextFunction } from 'express';
import { TopSearchController } from '../../interfaces/controllers/TopSearchController';
import { TopSearchService } from '../../application/services/TopSearchService';

describe('TopSearchController', () => {
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let mockTopSearchService: jest.Mocked<TopSearchService>;

  const emptyResult = {
    ok: true as const,
    data: [],
    pagination: { total: 0, count: 0, offset: 0, limit: 10 },
  };

  const populatedResult = {
    ok: true as const,
    data: [
      {
        username: 'torvalds',
        provider: 'github',
        hit: 42,
        avatarUrl: 'https://avatars.example.com/torvalds',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-06-01T12:00:00.000Z',
      },
    ],
    pagination: { total: 1, count: 1, offset: 0, limit: 10 },
  };

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });

    mockRequest = { query: {} };
    mockResponse = { status: statusMock };
    mockNext = jest.fn();

    mockTopSearchService = {
      getTopSearches: jest.fn().mockReturnValue(emptyResult),
      record: jest.fn(),
    } as unknown as jest.Mocked<TopSearchService>;
  });

  describe('getTopSearches', () => {
    it('should return 200 with data and pagination on success', async () => {
      mockTopSearchService.getTopSearches.mockReturnValue(populatedResult);
      const controller = new TopSearchController(mockTopSearchService);

      await controller.getTopSearches(mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(populatedResult);
    });

    it('should use default limit=10, offset=0, provider=github when query params are omitted', async () => {
      mockRequest.query = {};
      const controller = new TopSearchController(mockTopSearchService);

      await controller.getTopSearches(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockTopSearchService.getTopSearches).toHaveBeenCalledWith({
        provider: 'github',
        limit: 10,
        offset: 0,
      });
    });

    it('should pass limit, offset, and provider through to the service', async () => {
      mockRequest.query = { limit: '5', offset: '20', provider: 'github' };
      const controller = new TopSearchController(mockTopSearchService);

      await controller.getTopSearches(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockTopSearchService.getTopSearches).toHaveBeenCalledWith({
        provider: 'github',
        limit: '5', // raw query string — coercion happens in validation middleware
        offset: '20',
      });
    });

    it('should return 200 with empty data when service returns empty result', async () => {
      mockTopSearchService.getTopSearches.mockReturnValue(emptyResult);
      const controller = new TopSearchController(mockTopSearchService);

      await controller.getTopSearches(mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(200);
      expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({ ok: true, data: [] }));
    });

    it('should call next(error) on unexpected exception', async () => {
      const boom = new Error('Unexpected crash');
      mockTopSearchService.getTopSearches.mockImplementation(() => {
        throw boom;
      });
      const controller = new TopSearchController(mockTopSearchService);

      await controller.getTopSearches(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(boom);
      expect(statusMock).not.toHaveBeenCalled();
    });
  });
});
