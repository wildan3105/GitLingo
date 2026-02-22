/**
 * SearchError - Application Type
 * Error response matching API contract
 */

export interface SearchError {
  /**
   * Success indicator (always false for errors)
   */
  ok: false;

  /**
   * Provider name (e.g., "github", "gitlab")
   */
  provider: string;

  /**
   * Error details
   */
  error: {
    /**
     * Machine-readable error code
     */
    code: string;

    /**
     * Human-readable error message
     */
    message: string;

    /**
     * Additional error context
     */
    details?: Record<string, unknown>;

    /**
     * Seconds to wait before retrying (for rate limit errors)
     */
    retryAfterSeconds?: number;
  };

  /**
   * Response metadata
   */
  metadata: {
    /**
     * ISO timestamp when the error occurred
     */
    generatedAt: string;
  };
}
