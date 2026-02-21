/**
 * CachedSearchService - Application Service (Decorator)
 * Wraps SearchService with a SQLite-backed cache layer.
 *
 * The controller is completely unaware of caching — it receives the same
 * SearchResult | SearchError shape regardless of whether the result came
 * from cache or a live GitHub API call.
 *
 * Cache strategy:
 *   - Valid hit  → return cached payload immediately (no fetch)
 *   - Expired    → fetch fresh; on success upsert; on error serve expired + warn
 *   - Miss       → fetch fresh; on success upsert; on error return error as-is
 *
 * Stampede protection:
 *   - An in-memory Map tracks in-flight fetch promises keyed by cache key string.
 *   - Concurrent requests for the same cold/expired key share one fetch.
 */

import { createLogger } from '../../shared/utils/logger';
import { CachePort, CacheKey } from '../../domain/ports/CachePort';
import { CacheEntry } from '../../domain/models/CacheEntry';
import { SearchResult } from '../types/SearchResult';
import { SearchError } from '../types/SearchError';
import { SearchOptions } from '../types/SearchOptions';
import { SearchPort } from '../ports/SearchPort';

const logger = createLogger('CachedSearchService');

const SCHEMA_VERSION = 'v1';
const PROVIDER = 'github';

/**
 * Compute a deterministic, stable hash string from search options.
 * - undefined or empty options → 'default' (preserves existing cache entries)
 * - Non-empty options → sorted 'key=value' pairs joined by '&'
 */
export function buildOptionsHash(options: SearchOptions | undefined): string {
  if (options === undefined) return 'default';
  const entries = Object.entries(options).filter(([, v]) => v !== undefined);
  if (entries.length === 0) return 'default';
  return entries
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${String(v)}`)
    .join('&');
}

/** Convert Unix epoch seconds to ISO-8601 string */
function toISO(epochSeconds: number): string {
  return new Date(epochSeconds * 1000).toISOString();
}

export class CachedSearchService implements SearchPort {
  private readonly inflight = new Map<string, Promise<SearchResult | SearchError>>();

  constructor(
    private readonly inner: SearchPort,
    private readonly cache: CachePort,
    private readonly providerBaseUrl: string
  ) {}

  public searchLanguageStatistics(
    username: string,
    options?: SearchOptions
  ): Promise<SearchResult | SearchError> {
    const key = this.buildKey(username, options);
    const keyStr = this.keyToString(key);

    // Return in-flight promise if one already exists for this key (stampede protection)
    const inflight = this.inflight.get(keyStr);
    if (inflight !== undefined) return inflight;

    // Check cache — return immediately on a valid (non-expired) hit
    const now = Math.floor(Date.now() / 1000);
    const entry = this.cache.get(key);

    if (entry !== null && now < entry.cachedUntil) {
      return Promise.resolve(this.buildFromCacheEntry(entry));
    }

    // Cache miss or expired — fetch, (maybe) cache, return
    const fallback = entry; // null on miss, CacheEntry on expired

    const promise = this.inner
      .searchLanguageStatistics(username, options)
      .then((result): SearchResult | SearchError => {
        if (!result.ok) {
          // Fetch failed — serve expired entry as fallback if available
          if (fallback !== null) {
            logger.warn(
              { username, expiredAt: toISO(fallback.cachedUntil) },
              'GitHub fetch failed; serving expired cache entry as fallback'
            );
            return this.buildFromCacheEntry(fallback);
          }
          // No fallback — return error as-is
          return result;
        }

        // Fetch succeeded — upsert to cache and return with cache metadata
        const payload = {
          ok: result.ok,
          provider: result.provider,
          profile: result.profile,
          data: result.data,
        };
        const stored = this.cache.upsert(key, JSON.stringify(payload));

        return {
          ...result,
          metadata: {
            ...result.metadata, // preserves generatedAt = time of fresh fetch
            cachedAt: toISO(stored.cachedAt),
            cachedUntil: toISO(stored.cachedUntil),
          },
        };
      })
      .finally(() => {
        this.inflight.delete(keyStr);
      });

    this.inflight.set(keyStr, promise);
    return promise;
  }

  /** Build the composite cache key, normalizing username to lowercase. */
  private buildKey(username: string, options?: SearchOptions): CacheKey {
    return {
      provider: PROVIDER,
      providerBaseUrl: this.providerBaseUrl,
      username: username.toLowerCase(),
      schemaVersion: SCHEMA_VERSION,
      optionsHash: buildOptionsHash(options),
    };
  }

  /** Stable string representation of the cache key for the in-flight Map. */
  private keyToString(key: CacheKey): string {
    return `${key.provider}:${key.providerBaseUrl}:${key.username}:${key.schemaVersion}:${key.optionsHash}`;
  }

  /**
   * Reconstruct a SearchResult from a CacheEntry.
   * generatedAt is set to cachedAt (per the decision matrix in the spec).
   */
  private buildFromCacheEntry(entry: CacheEntry): SearchResult {
    const payload = JSON.parse(entry.payloadJson) as Omit<SearchResult, 'metadata'>;
    return {
      ...payload,
      metadata: {
        generatedAt: toISO(entry.cachedAt),
        unit: 'repos',
        cachedAt: toISO(entry.cachedAt),
        cachedUntil: toISO(entry.cachedUntil),
      },
    };
  }
}
