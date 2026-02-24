/**
 * TopSearchService Unit Tests
 * Uses a mock TopSearchPort — no database involved.
 */

import { TopSearchService } from '../../application/services/TopSearchService';
import {
  TopSearchPort,
  TopSearchUpsertParams,
  TopSearchQueryParams,
  TopSearchQueryResult,
} from '../../domain/ports/TopSearchPort';
import { TopSearch } from '../../domain/models/TopSearch';

function makeTopSearch(overrides: Partial<TopSearch> = {}): TopSearch {
  return {
    username: 'octocat',
    provider: 'github',
    hit: 5,
    avatarUrl: 'https://avatars.example.com/octocat',
    createdAt: 1700000000,
    updatedAt: 1700000100,
    ...overrides,
  };
}

class MockTopSearchPort implements TopSearchPort {
  public upsertCalls: TopSearchUpsertParams[] = [];
  public findResult: TopSearchQueryResult = { data: [], total: 0 };
  public upsertError: Error | null = null;
  public findError: Error | null = null;

  upsert(params: TopSearchUpsertParams): void {
    if (this.upsertError) throw this.upsertError;
    this.upsertCalls.push(params);
  }

  findTopSearches(_params: TopSearchQueryParams): TopSearchQueryResult {
    if (this.findError) throw this.findError;
    return this.findResult;
  }
}

describe('TopSearchService', () => {
  describe('record', () => {
    it('should call port.upsert with the correct params', () => {
      const port = new MockTopSearchPort();
      const service = new TopSearchService(port);

      service.record('octocat', 'github', 'https://avatar.png');

      expect(port.upsertCalls).toHaveLength(1);
      expect(port.upsertCalls[0]).toEqual({
        username: 'octocat',
        provider: 'github',
        avatarUrl: 'https://avatar.png',
      });
    });

    it('should normalize username to lowercase', () => {
      const port = new MockTopSearchPort();
      const service = new TopSearchService(port);

      service.record('Octocat', 'github', null);

      expect(port.upsertCalls[0]!.username).toBe('octocat');
    });

    it('should normalize username by trimming whitespace', () => {
      const port = new MockTopSearchPort();
      const service = new TopSearchService(port);

      service.record('  octocat  ', 'github', null);

      expect(port.upsertCalls[0]!.username).toBe('octocat');
    });

    it('should normalize mixed-case username with surrounding whitespace', () => {
      const port = new MockTopSearchPort();
      const service = new TopSearchService(port);

      service.record('  AIRBNB  ', 'github', null);

      expect(port.upsertCalls[0]!.username).toBe('airbnb');
    });

    it('should pass avatarUrl through to the port', () => {
      const port = new MockTopSearchPort();
      const service = new TopSearchService(port);

      service.record('octocat', 'github', 'https://specific-avatar.png');

      expect(port.upsertCalls[0]!.avatarUrl).toBe('https://specific-avatar.png');
    });

    it('should pass null avatarUrl through to the port', () => {
      const port = new MockTopSearchPort();
      const service = new TopSearchService(port);

      service.record('octocat', 'github', null);

      expect(port.upsertCalls[0]!.avatarUrl).toBeNull();
    });

    it('should not throw when port.upsert throws — error is swallowed', () => {
      const port = new MockTopSearchPort();
      port.upsertError = new Error('DB locked');
      const service = new TopSearchService(port);

      expect(() => service.record('octocat', 'github', null)).not.toThrow();
    });
  });

  describe('getTopSearches', () => {
    it('should return correct data and pagination shape', () => {
      const port = new MockTopSearchPort();
      port.findResult = {
        data: [makeTopSearch({ hit: 10 }), makeTopSearch({ username: 'airbnb', hit: 5 })],
        total: 2,
      };
      const service = new TopSearchService(port);

      const result = service.getTopSearches({ provider: 'github', limit: 10, offset: 0 });

      expect(result.ok).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.pagination).toEqual({ total: 2, count: 2, offset: 0, limit: 10 });
      expect(result.metadata?.generatedAt).toEqual(expect.any(String));
    });

    it('should convert unix epoch timestamps to ISO 8601 strings', () => {
      const port = new MockTopSearchPort();
      port.findResult = {
        data: [makeTopSearch({ createdAt: 1700000000, updatedAt: 1700000100 })],
        total: 1,
      };
      const service = new TopSearchService(port);

      const result = service.getTopSearches({ provider: 'github', limit: 10, offset: 0 });

      expect(result.data[0]!.createdAt).toBe(new Date(1700000000 * 1000).toISOString());
      expect(result.data[0]!.updatedAt).toBe(new Date(1700000100 * 1000).toISOString());
    });

    it('should reflect offset and limit in pagination', () => {
      const port = new MockTopSearchPort();
      port.findResult = { data: [makeTopSearch()], total: 50 };
      const service = new TopSearchService(port);

      const result = service.getTopSearches({ provider: 'github', limit: 5, offset: 10 });

      expect(result.pagination.offset).toBe(10);
      expect(result.pagination.limit).toBe(5);
      expect(result.pagination.total).toBe(50);
      expect(result.pagination.count).toBe(1);
    });

    it('should return empty result when port returns no data', () => {
      const port = new MockTopSearchPort();
      port.findResult = { data: [], total: 0 };
      const service = new TopSearchService(port);

      const result = service.getTopSearches({ provider: 'github', limit: 10, offset: 0 });

      expect(result.ok).toBe(true);
      expect(result.data).toHaveLength(0);
      expect(result.pagination.total).toBe(0);
      expect(result.pagination.count).toBe(0);
    });

    it('should return empty result and not throw when port.findTopSearches throws', () => {
      const port = new MockTopSearchPort();
      port.findError = new Error('DB read error');
      const service = new TopSearchService(port);

      let result: ReturnType<typeof service.getTopSearches> | undefined;
      expect(() => {
        result = service.getTopSearches({ provider: 'github', limit: 10, offset: 0 });
      }).not.toThrow();

      expect(result!.ok).toBe(true);
      expect(result!.data).toHaveLength(0);
      expect(result!.pagination.total).toBe(0);
      expect(result!.metadata?.generatedAt).toEqual(expect.any(String));
    });

    it('should preserve pagination params in empty error result', () => {
      const port = new MockTopSearchPort();
      port.findError = new Error('DB read error');
      const service = new TopSearchService(port);

      const result = service.getTopSearches({ provider: 'github', limit: 5, offset: 20 });

      expect(result.pagination.offset).toBe(20);
      expect(result.pagination.limit).toBe(5);
    });

    it('should return only one entry when limit=1', () => {
      const port = new MockTopSearchPort();
      port.findResult = {
        data: [makeTopSearch({ hit: 10 })], // port already applies limit — return 1 row
        total: 5,
      };
      const service = new TopSearchService(port);

      const result = service.getTopSearches({ provider: 'github', limit: 1, offset: 0 });

      expect(result.data).toHaveLength(1);
      expect(result.pagination.limit).toBe(1);
      expect(result.pagination.count).toBe(1);
    });

    it('should reflect offset=1 in pagination even when port skips top result', () => {
      const port = new MockTopSearchPort();
      // Simulates port returning the 2nd-place entry after offset=1
      port.findResult = {
        data: [makeTopSearch({ username: 'second', hit: 5 })],
        total: 3,
      };
      const service = new TopSearchService(port);

      const result = service.getTopSearches({ provider: 'github', limit: 10, offset: 1 });

      expect(result.pagination.offset).toBe(1);
      expect(result.data[0]!.username).toBe('second');
      expect(result.pagination.total).toBe(3);
      expect(result.pagination.count).toBe(1);
    });

    it('should map domain model fields to TopSearchEntry correctly', () => {
      const port = new MockTopSearchPort();
      port.findResult = {
        data: [
          makeTopSearch({
            username: 'airbnb',
            provider: 'github',
            hit: 42,
            avatarUrl: 'https://av.png',
          }),
        ],
        total: 1,
      };
      const service = new TopSearchService(port);

      const entry = service.getTopSearches({ provider: 'github', limit: 10, offset: 0 }).data[0]!;

      expect(entry.username).toBe('airbnb');
      expect(entry.provider).toBe('github');
      expect(entry.hit).toBe(42);
      expect(entry.avatarUrl).toBe('https://av.png');
    });
  });
});
