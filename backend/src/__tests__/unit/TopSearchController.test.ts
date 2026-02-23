/**
 * TopSearchController Unit Tests
 */

import { Request, Response, NextFunction } from 'express';
import { TopSearchController } from '../../interfaces/controllers/TopSearchController';
import { TopSearchService } from '../../application/services/TopSearchService';
import { validateTopSearchQuery } from '../../interfaces/validation/topSearchSchema';

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
        username: 'octocat',
        provider: 'github',
        hit: 42,
        avatarUrl: 'https://avatars.example.com/octocat',
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

    it('should pass limit, offset, and provider through to the service as numbers', async () => {
      mockRequest.query = { limit: '5', offset: '20', provider: 'github' };
      const controller = new TopSearchController(mockTopSearchService);

      await controller.getTopSearches(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockTopSearchService.getTopSearches).toHaveBeenCalledWith({
        provider: 'github',
        limit: 5, // coerced to number in the controller
        offset: 20,
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

  describe('validateTopSearchQuery middleware', () => {
    function makeValidationMocks(): {
      jsonMock: jest.Mock;
      statusMock: jest.Mock;
      req: Partial<Request>;
      res: Partial<Response>;
      next: jest.Mock;
    } {
      const jsonMock = jest.fn();
      const statusMock = jest.fn().mockReturnValue({ json: jsonMock });
      return {
        jsonMock,
        statusMock,
        req: { query: {} },
        res: { status: statusMock },
        next: jest.fn(),
      };
    }

    it('should return 400 when limit exceeds 100', () => {
      const { jsonMock, statusMock, res, next } = makeValidationMocks();
      const req = { query: { limit: '200' } } as Partial<Request>;

      validateTopSearchQuery(req as Request, res as Response, next as NextFunction);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          ok: false,
          error: expect.objectContaining({ code: 'validation_error' }),
        })
      );
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 400 when limit is 0', () => {
      const { jsonMock, statusMock, res, next } = makeValidationMocks();
      const req = { query: { limit: '0' } } as Partial<Request>;

      validateTopSearchQuery(req as Request, res as Response, next as NextFunction);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({ ok: false }));
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 400 when offset is negative', () => {
      const { jsonMock, statusMock, res, next } = makeValidationMocks();
      const req = { query: { offset: '-1' } } as Partial<Request>;

      validateTopSearchQuery(req as Request, res as Response, next as NextFunction);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith(expect.objectContaining({ ok: false }));
      expect(next).not.toHaveBeenCalled();
    });

    it('should call next() when all params are valid', () => {
      const { statusMock, res, next } = makeValidationMocks();
      const req = { query: { limit: '5', offset: '10', provider: 'github' } } as Partial<Request>;

      validateTopSearchQuery(req as Request, res as Response, next as NextFunction);

      expect(next).toHaveBeenCalledWith();
      expect(statusMock).not.toHaveBeenCalled();
    });

    it('should call next() with no params (all defaults are valid)', () => {
      const { statusMock, res, next } = makeValidationMocks();
      const req = { query: {} } as Partial<Request>;

      validateTopSearchQuery(req as Request, res as Response, next as NextFunction);

      expect(next).toHaveBeenCalledWith();
      expect(statusMock).not.toHaveBeenCalled();
    });
  });
});
