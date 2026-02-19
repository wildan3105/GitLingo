/**
 * TopSearchPort - Domain Port
 * Interface for persisting and querying top search records
 * Implements Hexagonal Architecture / Ports & Adapters pattern
 *
 * All methods are synchronous — the chosen adapter (better-sqlite3) is
 * a synchronous driver, and these operations are fast enough to be safe
 * on the main thread.
 */

import { TopSearch } from '../models/TopSearch';

export interface TopSearchUpsertParams {
  /**
   * Normalized (lowercase) username — callers are responsible for normalization
   */
  username: string;

  /**
   * Provider name (e.g., "github")
   */
  provider: string;

  /**
   * Avatar URL to store, or null. Existing value is kept when null is passed.
   */
  avatarUrl: string | null;
}

export interface TopSearchQueryParams {
  /**
   * Filter by provider
   */
  provider: string;

  /**
   * Maximum number of records to return
   */
  limit: number;

  /**
   * Number of records to skip before collecting results
   */
  offset: number;
}

export interface TopSearchQueryResult {
  /**
   * The page of top search records, ordered by hit DESC, updated_at DESC, username ASC
   */
  data: TopSearch[];

  /**
   * Total number of records matching the provider filter (for pagination)
   */
  total: number;
}

export interface TopSearchPort {
  /**
   * Upsert a search record.
   * - Inserts a new row with hit=1 if the username+provider pair does not exist.
   * - Increments hit by 1 and refreshes updated_at if it already exists.
   * - Updates avatar_url only when a non-null value is provided.
   */
  upsert(params: TopSearchUpsertParams): void;

  /**
   * Retrieve a paginated, sorted list of top search records for a given provider.
   */
  findTopSearches(params: TopSearchQueryParams): TopSearchQueryResult;
}
