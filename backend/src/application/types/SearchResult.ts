/**
 * SearchResult - Application Type
 * Successful search response matching API contract
 */

import { Profile } from '../../domain/models/Profile';
import { LanguageStatistic } from '../../domain/models/LanguageStatistic';

export interface SearchResult {
  /**
   * Success indicator
   */
  ok: true;

  /**
   * Provider name (e.g., "github", "gitlab")
   */
  provider: string;

  /**
   * User or organization profile
   */
  profile: Profile;

  /**
   * Language statistics (chart-ready data)
   */
  data: LanguageStatistic[];

  /**
   * Response metadata
   */
  metadata: {
    /**
     * ISO timestamp when the result was generated
     */
    generatedAt: string;

    /**
     * Unit of measurement (always "repos")
     */
    unit: string;

    /**
     * ISO timestamp when the result was cached.
     * Present only when the cache is enabled and the result was stored.
     */
    cachedAt?: string;

    /**
     * ISO timestamp when the cached result expires.
     * Present only when the cache is enabled and the result was stored.
     */
    cachedUntil?: string;
  };
}
