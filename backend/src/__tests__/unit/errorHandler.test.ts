/**
 * ErrorHandler Middleware Unit Tests
 */

import { Request, Response, NextFunction } from 'express';
import { errorHandler } from '../../interfaces/middleware/errorHandler';

describe('errorHandler', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    // Set up mock response
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });

    mockRequest = {};
    mockResponse = {
      status: statusMock,
    };
    mockNext = jest.fn();
  });

  it('should return 500 status code', () => {
    const error = new Error('Test error');

    errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(statusMock).toHaveBeenCalledWith(500);
  });

  it('should return error response with correct structure', () => {
    const error = new Error('Test error message');

    errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        ok: false,
        provider: 'unknown',
        error: expect.objectContaining({
          code: 'internal_server_error',
        }),
        meta: expect.objectContaining({
          generatedAt: expect.any(String),
        }),
      })
    );
  });

  it('should include error message and stack in non-production mode', () => {
    // In test mode (non-production), error details should be included
    const error = new Error('Detailed error message');

    errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          message: 'Detailed error message',
          stack: expect.any(String),
        }),
      })
    );
  });

  it('should handle errors without stack trace', () => {
    const error = new Error('Error without stack');
    delete error.stack;

    errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalled();
  });
});
