/**
 * ProviderError Unit Tests
 */

import { ProviderError } from '../../infrastructure/errors/ProviderError';

describe('ProviderError', () => {
  it('should create error with all properties', () => {
    const causeError = new Error('Original error');
    const error = new ProviderError({
      code: 'USER_NOT_FOUND',
      message: 'User not found',
      retryAfter: 60,
      details: { username: 'testuser' },
      cause: causeError,
    });

    expect(error.name).toBe('ProviderError');
    expect(error.code).toBe('USER_NOT_FOUND');
    expect(error.message).toBe('User not found');
    expect(error.retryAfter).toBe(60);
    expect(error.details).toEqual({ username: 'testuser' });
    expect(error.cause).toBe(causeError);
  });

  it('should create error with minimal properties', () => {
    const error = new ProviderError({
      code: 'PROVIDER_ERROR',
      message: 'Something went wrong',
    });

    expect(error.name).toBe('ProviderError');
    expect(error.code).toBe('PROVIDER_ERROR');
    expect(error.message).toBe('Something went wrong');
    expect(error.retryAfter).toBeUndefined();
    expect(error.details).toBeUndefined();
    expect(error.cause).toBeUndefined();
  });

  describe('isUserNotFound', () => {
    it('should return true for USER_NOT_FOUND errors', () => {
      const error = new ProviderError({
        code: 'USER_NOT_FOUND',
        message: 'User not found',
      });

      expect(error.isUserNotFound()).toBe(true);
    });

    it('should return false for other errors', () => {
      const error = new ProviderError({
        code: 'RATE_LIMITED',
        message: 'Rate limited',
      });

      expect(error.isUserNotFound()).toBe(false);
    });
  });

  describe('isRateLimited', () => {
    it('should return true for RATE_LIMITED errors', () => {
      const error = new ProviderError({
        code: 'RATE_LIMITED',
        message: 'Rate limited',
        retryAfter: 60,
      });

      expect(error.isRateLimited()).toBe(true);
    });

    it('should return false for other errors', () => {
      const error = new ProviderError({
        code: 'NETWORK_ERROR',
        message: 'Network error',
      });

      expect(error.isRateLimited()).toBe(false);
    });
  });

  describe('isRetryable', () => {
    it('should return true for NETWORK_ERROR', () => {
      const error = new ProviderError({
        code: 'NETWORK_ERROR',
        message: 'Network error',
      });

      expect(error.isRetryable()).toBe(true);
    });

    it('should return true for RATE_LIMITED', () => {
      const error = new ProviderError({
        code: 'RATE_LIMITED',
        message: 'Rate limited',
      });

      expect(error.isRetryable()).toBe(true);
    });

    it('should return false for non-retryable errors', () => {
      const error = new ProviderError({
        code: 'USER_NOT_FOUND',
        message: 'User not found',
      });

      expect(error.isRetryable()).toBe(false);
    });
  });
});
