/**
 * ProviderError - Infrastructure Error
 * Custom error for version control provider failures
 */

export type ProviderErrorCode =
  | 'USER_NOT_FOUND'
  | 'RATE_LIMITED'
  | 'NETWORK_ERROR'
  | 'PROVIDER_ERROR';

export interface ProviderErrorOptions {
  code: ProviderErrorCode;
  message: string;
  retryAfter?: number; // seconds to wait before retry
  details?: Record<string, unknown>;
  cause?: Error;
}

export class ProviderError extends Error {
  public readonly code: ProviderErrorCode;
  public readonly retryAfter: number | undefined;
  public readonly details: Record<string, unknown> | undefined;
  public readonly cause: Error | undefined;

  constructor(options: ProviderErrorOptions) {
    super(options.message);
    this.name = 'ProviderError';
    this.code = options.code;
    this.retryAfter = options.retryAfter;
    this.details = options.details;
    this.cause = options.cause;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, ProviderError);
    }
  }

  /**
   * Check if error is a user not found error
   */
  public isUserNotFound(): boolean {
    return this.code === 'USER_NOT_FOUND';
  }

  /**
   * Check if error is a rate limit error
   */
  public isRateLimited(): boolean {
    return this.code === 'RATE_LIMITED';
  }

  /**
   * Check if error is retryable
   */
  public isRetryable(): boolean {
    return this.code === 'NETWORK_ERROR' || this.code === 'RATE_LIMITED';
  }
}
