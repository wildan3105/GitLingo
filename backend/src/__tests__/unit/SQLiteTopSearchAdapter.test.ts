/**
 * SQLiteTopSearchAdapter Unit Tests
 * Uses an in-memory SQLite database — no filesystem I/O, fully isolated.
 */

import { createDatabase } from '../../infrastructure/persistence/database';
import { SQLiteTopSearchAdapter } from '../../infrastructure/persistence/SQLiteTopSearchAdapter';
import Database from 'better-sqlite3';

function makeAdapter(): { adapter: SQLiteTopSearchAdapter; db: Database.Database } {
  const db = createDatabase(':memory:');
  const adapter = new SQLiteTopSearchAdapter(db);
  return { adapter, db };
}

describe('SQLiteTopSearchAdapter', () => {
  describe('upsert', () => {
    it('should insert a new record with hit = 1', () => {
      const { adapter, db } = makeAdapter();

      adapter.upsert({
        provider: 'github',
        username: 'octocat',
        avatarUrl: 'https://example.com/avatar.png',
      });

      const row = db.prepare('SELECT * FROM topsearch WHERE username = ?').get('octocat') as any;
      expect(row.hit).toBe(1);
      expect(row.username).toBe('octocat');
      expect(row.provider).toBe('github');
      expect(row.avatar_url).toBe('https://example.com/avatar.png');
      db.close();
    });

    it('should increment hit by 1 on subsequent upserts', () => {
      const { adapter, db } = makeAdapter();

      adapter.upsert({ provider: 'github', username: 'octocat', avatarUrl: null });
      adapter.upsert({ provider: 'github', username: 'octocat', avatarUrl: null });
      adapter.upsert({ provider: 'github', username: 'octocat', avatarUrl: null });

      const row = db.prepare('SELECT hit FROM topsearch WHERE username = ?').get('octocat') as any;
      expect(row.hit).toBe(3);
      db.close();
    });

    it('should update avatar_url when a new non-null value is provided', () => {
      const { adapter, db } = makeAdapter();

      adapter.upsert({ provider: 'github', username: 'octocat', avatarUrl: 'https://old.png' });
      adapter.upsert({ provider: 'github', username: 'octocat', avatarUrl: 'https://new.png' });

      const row = db
        .prepare('SELECT avatar_url FROM topsearch WHERE username = ?')
        .get('octocat') as any;
      expect(row.avatar_url).toBe('https://new.png');
      db.close();
    });

    it('should keep existing avatar_url when new value is null (COALESCE)', () => {
      const { adapter, db } = makeAdapter();

      adapter.upsert({ provider: 'github', username: 'octocat', avatarUrl: 'https://keep.png' });
      adapter.upsert({ provider: 'github', username: 'octocat', avatarUrl: null });

      const row = db
        .prepare('SELECT avatar_url FROM topsearch WHERE username = ?')
        .get('octocat') as any;
      expect(row.avatar_url).toBe('https://keep.png');
      db.close();
    });

    it('should insert with null avatar_url when first upsert has no avatar', () => {
      const { adapter, db } = makeAdapter();

      adapter.upsert({ provider: 'github', username: 'octocat', avatarUrl: null });

      const row = db
        .prepare('SELECT avatar_url FROM topsearch WHERE username = ?')
        .get('octocat') as any;
      expect(row.avatar_url).toBeNull();
      db.close();
    });

    it('should update updated_at on each upsert', () => {
      const { adapter, db } = makeAdapter();

      adapter.upsert({ provider: 'github', username: 'octocat', avatarUrl: null });
      const before = (
        db.prepare('SELECT updated_at FROM topsearch WHERE username = ?').get('octocat') as any
      ).updated_at;

      // Ensure at least 1 second passes so unixepoch() changes
      jest.useFakeTimers();
      jest.advanceTimersByTime(1100);
      jest.useRealTimers();

      adapter.upsert({ provider: 'github', username: 'octocat', avatarUrl: null });
      const after = (
        db.prepare('SELECT updated_at FROM topsearch WHERE username = ?').get('octocat') as any
      ).updated_at;

      expect(after).toBeGreaterThanOrEqual(before);
      db.close();
    });

    it('should treat the same username under different providers as separate records', () => {
      const { adapter, db } = makeAdapter();

      adapter.upsert({ provider: 'github', username: 'octocat', avatarUrl: null });
      adapter.upsert({ provider: 'gitlab', username: 'octocat', avatarUrl: null });

      const count = (
        db.prepare('SELECT COUNT(*) AS c FROM topsearch WHERE username = ?').get('octocat') as any
      ).c;
      expect(count).toBe(2);
      db.close();
    });
  });

  describe('findTopSearches', () => {
    it('should return records ordered by hit DESC', () => {
      const { adapter, db } = makeAdapter();

      adapter.upsert({ provider: 'github', username: 'airbnb', avatarUrl: null });
      adapter.upsert({ provider: 'github', username: 'google', avatarUrl: null });
      adapter.upsert({ provider: 'github', username: 'google', avatarUrl: null });
      adapter.upsert({ provider: 'github', username: 'google', avatarUrl: null });
      adapter.upsert({ provider: 'github', username: 'microsoft', avatarUrl: null });
      adapter.upsert({ provider: 'github', username: 'microsoft', avatarUrl: null });

      const result = adapter.findTopSearches({ provider: 'github', limit: 10, offset: 0 });

      expect(result.data[0]!.username).toBe('google');
      expect(result.data[0]!.hit).toBe(3);
      expect(result.data[1]!.username).toBe('microsoft');
      expect(result.data[1]!.hit).toBe(2);
      expect(result.data[2]!.username).toBe('airbnb');
      expect(result.data[2]!.hit).toBe(1);
      db.close();
    });

    it('should respect the limit parameter', () => {
      const { adapter, db } = makeAdapter();

      adapter.upsert({ provider: 'github', username: 'a', avatarUrl: null });
      adapter.upsert({ provider: 'github', username: 'b', avatarUrl: null });
      adapter.upsert({ provider: 'github', username: 'c', avatarUrl: null });

      const result = adapter.findTopSearches({ provider: 'github', limit: 2, offset: 0 });

      expect(result.data).toHaveLength(2);
      db.close();
    });

    it('should respect the offset parameter', () => {
      const { adapter, db } = makeAdapter();

      adapter.upsert({ provider: 'github', username: 'first', avatarUrl: null });
      adapter.upsert({ provider: 'github', username: 'second', avatarUrl: null });
      adapter.upsert({ provider: 'github', username: 'third', avatarUrl: null });

      const result = adapter.findTopSearches({ provider: 'github', limit: 10, offset: 1 });

      // All have hit=1, so ordered alphabetically by username ASC as tiebreak
      expect(result.data).toHaveLength(2);
      expect(result.data[0]!.username).toBe('second');
      expect(result.data[1]!.username).toBe('third');
      db.close();
    });

    it('should return the correct total count', () => {
      const { adapter, db } = makeAdapter();

      adapter.upsert({ provider: 'github', username: 'a', avatarUrl: null });
      adapter.upsert({ provider: 'github', username: 'b', avatarUrl: null });
      adapter.upsert({ provider: 'github', username: 'c', avatarUrl: null });

      const result = adapter.findTopSearches({ provider: 'github', limit: 1, offset: 0 });

      expect(result.total).toBe(3);
      expect(result.data).toHaveLength(1);
      db.close();
    });

    it('should filter by provider', () => {
      const { adapter, db } = makeAdapter();

      adapter.upsert({ provider: 'github', username: 'octocat', avatarUrl: null });
      adapter.upsert({ provider: 'gitlab', username: 'octocat', avatarUrl: null });

      const result = adapter.findTopSearches({ provider: 'github', limit: 10, offset: 0 });

      expect(result.data).toHaveLength(1);
      expect(result.data[0]!.provider).toBe('github');
      expect(result.total).toBe(1);
      db.close();
    });

    it('should return empty data and total=0 when no records match provider', () => {
      const { adapter, db } = makeAdapter();

      adapter.upsert({ provider: 'github', username: 'octocat', avatarUrl: null });

      const result = adapter.findTopSearches({ provider: 'gitlab', limit: 10, offset: 0 });

      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
      db.close();
    });

    it('should map DB rows to TopSearch domain model with camelCase fields', () => {
      const { adapter, db } = makeAdapter();

      adapter.upsert({ provider: 'github', username: 'octocat', avatarUrl: 'https://avatar.png' });

      const result = adapter.findTopSearches({ provider: 'github', limit: 10, offset: 0 });
      const entry = result.data[0]!;

      expect(entry).toMatchObject({
        username: 'octocat',
        provider: 'github',
        hit: 1,
        avatarUrl: 'https://avatar.png',
      });
      expect(typeof entry.createdAt).toBe('number');
      expect(typeof entry.updatedAt).toBe('number');
      expect(entry.createdAt).toBeGreaterThan(0);
      db.close();
    });

    it('should return empty data when offset exceeds total records', () => {
      const { adapter, db } = makeAdapter();

      adapter.upsert({ provider: 'github', username: 'octocat', avatarUrl: null });

      const result = adapter.findTopSearches({ provider: 'github', limit: 10, offset: 100 });

      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(1); // total is still the full count
      db.close();
    });

    it('should order tied hit counts by username ASC as tiebreaker', () => {
      const { adapter, db } = makeAdapter();

      // All three have hit=1; tiebreaker is username ASC
      adapter.upsert({ provider: 'github', username: 'zebra', avatarUrl: null });
      adapter.upsert({ provider: 'github', username: 'apple', avatarUrl: null });
      adapter.upsert({ provider: 'github', username: 'mango', avatarUrl: null });

      const result = adapter.findTopSearches({ provider: 'github', limit: 10, offset: 0 });

      expect(result.data[0]!.username).toBe('apple');
      expect(result.data[1]!.username).toBe('mango');
      expect(result.data[2]!.username).toBe('zebra');
      db.close();
    });
  });
});
