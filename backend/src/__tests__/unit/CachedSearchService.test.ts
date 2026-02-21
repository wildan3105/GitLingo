/**
 * CachedSearchService Unit Tests
 * Uses jest mocks for both SearchService and CachePort — no real DB or GitHub API.
 */

import { CachedSearchService } from '../../application/services/CachedSearchService';
import { SearchService } from '../../application/services/SearchService';
import { CachePort } from '../../domain/ports/CachePort';
import { CacheEntry } from '../../domain/models/CacheEntry';
import { SearchResult } from '../../application/types/SearchResult';
import { SearchError } from '../../application/types/SearchError';

const PROVIDER_BASE_URL = 'https://github.com';

// Helpers ------------------------------------------------------------------

function makeSuccessResult(generatedAt = new Date().toISOString()): SearchResult {
  return {
    ok: true,
    provider: 'github',
    profile: {
      username: 'torvalds',
      type: 'user',
      providerUserId: '1024',
      isVerified: true,
    },
    data: [{ key: 'C', label: 'C', value: 5, color: '#555555' }],
    metadata: { generatedAt, unit: 'repos' },
  };
}

function makeErrorResult(): SearchError {
  return {
    ok: false,
    provider: 'github',
    error: { code: 'rate_limited', message: 'Rate limited' },
    meta: { generatedAt: new Date().toISOString() },
  };
}

function makeCacheEntry(overrides: Partial<CacheEntry> = {}): CacheEntry {
  const now = Math.floor(Date.now() / 1000);
  const freshResult = makeSuccessResult();
  const { metadata: _m, ...payload } = freshResult;
  return {
    provider: 'github',
    providerBaseUrl: PROVIDER_BASE_URL,
    username: 'torvalds',
    schemaVersion: 'v1',
    optionsHash: 'default',
    payloadJson: JSON.stringify(payload),
    cachedAt: now - 100,
    cachedUntil: now + 3600, // valid by default
    updatedAt: now - 100,
    ...overrides,
  };
}

function makeMockCache(entry: CacheEntry | null = null): jest.Mocked<CachePort> {
  return {
    get: jest.fn().mockReturnValue(entry),
    upsert: jest.fn().mockReturnValue(makeCacheEntry()),
  };
}

function makeMockInner(
  result: SearchResult | SearchError = makeSuccessResult()
): jest.Mocked<Pick<SearchService, 'searchLanguageStatistics'>> {
  return {
    searchLanguageStatistics: jest.fn().mockResolvedValue(result),
  };
}

function makeService(
  inner: Pick<SearchService, 'searchLanguageStatistics'>,
  cache: CachePort
): CachedSearchService {
  return new CachedSearchService(inner as SearchService, cache, PROVIDER_BASE_URL);
}

// Tests --------------------------------------------------------------------

describe('CachedSearchService', () => {
  describe('cache hit (valid)', () => {
    it('should return cached payload without calling inner', async () => {
      const entry = makeCacheEntry(); // cachedUntil in the future
      const cache = makeMockCache(entry);
      const inner = makeMockInner();
      const svc = makeService(inner, cache);

      const result = await svc.searchLanguageStatistics('torvalds');

      expect(inner.searchLanguageStatistics).not.toHaveBeenCalled();
      expect(cache.upsert).not.toHaveBeenCalled();
      expect(result.ok).toBe(true);
    });

    it('should include cachedAt and cachedUntil in metadata on a valid hit', async () => {
      const entry = makeCacheEntry();
      const svc = makeService(makeMockInner(), makeMockCache(entry));

      const result = await svc.searchLanguageStatistics('torvalds');

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.metadata.cachedAt).toBe(new Date(entry.cachedAt * 1000).toISOString());
      expect(result.metadata.cachedUntil).toBe(new Date(entry.cachedUntil * 1000).toISOString());
    });

    it('generatedAt should equal cachedAt on a valid cache hit', async () => {
      const entry = makeCacheEntry();
      const svc = makeService(makeMockInner(), makeMockCache(entry));

      const result = await svc.searchLanguageStatistics('torvalds');

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.metadata.generatedAt).toBe(result.metadata.cachedAt);
    });
  });

  describe('cache miss', () => {
    it('should call inner and upsert on a cache miss', async () => {
      const cache = makeMockCache(null); // null = miss
      const inner = makeMockInner();
      const svc = makeService(inner, cache);

      await svc.searchLanguageStatistics('torvalds');

      expect(inner.searchLanguageStatistics).toHaveBeenCalledTimes(1);
      expect(cache.upsert).toHaveBeenCalledTimes(1);
    });

    it('should return result with cachedAt/cachedUntil in metadata on a miss', async () => {
      const storedEntry = makeCacheEntry();
      const cache = makeMockCache(null);
      cache.upsert.mockReturnValue(storedEntry);
      const svc = makeService(makeMockInner(), cache);

      const result = await svc.searchLanguageStatistics('torvalds');

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.metadata.cachedAt).toBe(new Date(storedEntry.cachedAt * 1000).toISOString());
      expect(result.metadata.cachedUntil).toBe(
        new Date(storedEntry.cachedUntil * 1000).toISOString()
      );
    });

    it('generatedAt should be the time of fresh fetch (not cachedAt) on a cache miss', async () => {
      const fetchTime = '2026-02-20T10:00:00.000Z';
      const storedEntry = makeCacheEntry();
      const cache = makeMockCache(null);
      cache.upsert.mockReturnValue(storedEntry);
      const svc = makeService(makeMockInner(makeSuccessResult(fetchTime)), cache);

      const result = await svc.searchLanguageStatistics('torvalds');

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      // generatedAt is the inner service's fetch time, not cachedAt
      expect(result.metadata.generatedAt).toBe(fetchTime);
      expect(result.metadata.generatedAt).not.toBe(result.metadata.cachedAt);
    });
  });

  describe('cache expired + inner success', () => {
    it('should call inner and upsert a new entry when cache is expired', async () => {
      const now = Math.floor(Date.now() / 1000);
      const expiredEntry = makeCacheEntry({ cachedUntil: now - 1 }); // expired
      const cache = makeMockCache(expiredEntry);
      const inner = makeMockInner();
      const svc = makeService(inner, cache);

      await svc.searchLanguageStatistics('torvalds');

      expect(inner.searchLanguageStatistics).toHaveBeenCalledTimes(1);
      expect(cache.upsert).toHaveBeenCalledTimes(1);
    });

    it('should return fresh result with new cachedAt/cachedUntil when expired + inner succeeds', async () => {
      const now = Math.floor(Date.now() / 1000);
      const expiredEntry = makeCacheEntry({ cachedUntil: now - 1 });
      const freshEntry = makeCacheEntry({ cachedAt: now, cachedUntil: now + 3600 });
      const cache = makeMockCache(expiredEntry);
      cache.upsert.mockReturnValue(freshEntry);
      const svc = makeService(makeMockInner(), cache);

      const result = await svc.searchLanguageStatistics('torvalds');

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.metadata.cachedAt).toBe(new Date(freshEntry.cachedAt * 1000).toISOString());
      expect(result.metadata.cachedUntil).toBe(
        new Date(freshEntry.cachedUntil * 1000).toISOString()
      );
    });
  });

  describe('cache expired + inner error', () => {
    it('should serve the expired entry when inner returns an error', async () => {
      const now = Math.floor(Date.now() / 1000);
      const expiredEntry = makeCacheEntry({ cachedUntil: now - 1 });
      const cache = makeMockCache(expiredEntry);
      const inner = makeMockInner(makeErrorResult());
      const svc = makeService(inner, cache);

      const result = await svc.searchLanguageStatistics('torvalds');

      // Should return the expired cached result, not the error
      expect(result.ok).toBe(true);
      expect(cache.upsert).not.toHaveBeenCalled();
    });

    it('should include cachedAt/cachedUntil from the expired entry in the fallback response', async () => {
      const now = Math.floor(Date.now() / 1000);
      const expiredEntry = makeCacheEntry({ cachedAt: now - 7200, cachedUntil: now - 1 });
      const cache = makeMockCache(expiredEntry);
      const svc = makeService(makeMockInner(makeErrorResult()), cache);

      const result = await svc.searchLanguageStatistics('torvalds');

      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.metadata.cachedAt).toBe(new Date(expiredEntry.cachedAt * 1000).toISOString());
      expect(result.metadata.cachedUntil).toBe(
        new Date(expiredEntry.cachedUntil * 1000).toISOString()
      );
    });
  });

  describe('cache miss + inner error', () => {
    it('should return the error result unchanged with no upsert', async () => {
      const cache = makeMockCache(null);
      const errorResult = makeErrorResult();
      const inner = makeMockInner(errorResult);
      const svc = makeService(inner, cache);

      const result = await svc.searchLanguageStatistics('torvalds');

      expect(result.ok).toBe(false);
      expect(cache.upsert).not.toHaveBeenCalled();
    });

    it('should not include cachedAt or cachedUntil in the error response', async () => {
      const cache = makeMockCache(null);
      const svc = makeService(makeMockInner(makeErrorResult()), cache);

      const result = await svc.searchLanguageStatistics('torvalds');

      expect(result.ok).toBe(false);
      // SearchError has no metadata.cachedAt/cachedUntil
      expect((result as SearchResult).metadata).toBeUndefined();
    });
  });

  describe('inner returns ok: false on a miss (not a found result)', () => {
    it('should not upsert when inner returns an error on a miss', async () => {
      const cache = makeMockCache(null);
      cache.upsert = jest.fn();
      const svc = makeService(makeMockInner(makeErrorResult()), cache);

      await svc.searchLanguageStatistics('nobody');

      expect(cache.upsert).not.toHaveBeenCalled();
    });
  });

  describe('single-flight', () => {
    it('should call inner exactly once for two concurrent requests for the same key', async () => {
      const cache = makeMockCache(null);
      const inner = makeMockInner();
      const svc = makeService(inner, cache);

      // Fire two concurrent requests before either resolves
      const [r1, r2] = await Promise.all([
        svc.searchLanguageStatistics('torvalds'),
        svc.searchLanguageStatistics('torvalds'),
      ]);

      expect(inner.searchLanguageStatistics).toHaveBeenCalledTimes(1);
      expect(r1.ok).toBe(true);
      expect(r2.ok).toBe(true);
    });

    it('should allow a second fetch after the first in-flight completes', async () => {
      const cache = makeMockCache(null);
      const inner = makeMockInner();
      // Second call sees null too (cache mock always returns null)
      const svc = makeService(inner, cache);

      await svc.searchLanguageStatistics('torvalds'); // first completes
      await svc.searchLanguageStatistics('torvalds'); // second is a new request

      // inner called twice — single-flight map is cleared after first resolves
      expect(inner.searchLanguageStatistics).toHaveBeenCalledTimes(2);
    });
  });
});
