/**
 * CachePort - Domain Port
 * Interface for reading and writing cached search results.
 * Implements Hexagonal Architecture / Ports & Adapters pattern.
 *
 * All methods are synchronous — the chosen adapter (better-sqlite3) is
 * a synchronous driver, consistent with TopSearchPort.
 *
 * Staleness checks (cachedUntil vs now) are the caller's responsibility.
 * TTL is an implementation detail of the adapter (configured at construction).
 */

import { CacheEntry } from '../models/CacheEntry';

export interface CacheKey {
  provider: string;
  providerBaseUrl: string;
  username: string;
  schemaVersion: string;
  optionsHash: string;
}

export interface CachePort {
  /**
   * Retrieve a cache entry by its composite key.
   * Returns the entry regardless of whether it is still fresh or expired.
   * Returns null if no entry exists for the given key.
   */
  get(key: CacheKey): CacheEntry | null;

  /**
   * Insert or update a cache entry for the given key and payload.
   * The adapter sets cachedAt, cachedUntil (based on its configured TTL),
   * and updatedAt internally.
   * Returns the stored entry so the caller can read the timestamps
   * without a separate get() round-trip.
   */
  upsert(key: CacheKey, payloadJson: string): CacheEntry;
}
