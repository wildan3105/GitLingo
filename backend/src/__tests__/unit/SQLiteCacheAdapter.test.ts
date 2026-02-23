/**
 * SQLiteCacheAdapter Unit Tests
 * Uses an in-memory SQLite database — no filesystem I/O, fully isolated.
 */

import Database from 'better-sqlite3';
import { createDatabase } from '../../infrastructure/persistence/database';
import { SQLiteCacheAdapter } from '../../infrastructure/persistence/SQLiteCacheAdapter';
import { CacheKey } from '../../domain/ports/CachePort';

const TTL_SECONDS = 3600; // 1 hour

function makeAdapter(): { adapter: SQLiteCacheAdapter; db: Database.Database } {
  const db = createDatabase(':memory:');
  const adapter = new SQLiteCacheAdapter(db, TTL_SECONDS);
  return { adapter, db };
}

const BASE_KEY: CacheKey = {
  provider: 'github',
  providerBaseUrl: 'https://github.com',
  username: 'octocat',
  schemaVersion: 'v1',
  optionsHash: 'default',
};

const PAYLOAD = JSON.stringify({ ok: true, provider: 'github', data: [] });

describe('SQLiteCacheAdapter', () => {
  describe('get', () => {
    it('should return null on an empty DB', () => {
      const { adapter, db } = makeAdapter();

      expect(adapter.get(BASE_KEY)).toBeNull();

      db.close();
    });

    it('should return a CacheEntry after upsert with cachedAt/cachedUntil as numbers (epoch seconds)', () => {
      const { adapter, db } = makeAdapter();

      adapter.upsert(BASE_KEY, PAYLOAD);
      const entry = adapter.get(BASE_KEY);

      expect(entry).not.toBeNull();
      expect(entry!.payloadJson).toBe(PAYLOAD);
      expect(typeof entry!.cachedAt).toBe('number');
      expect(typeof entry!.cachedUntil).toBe('number');
      expect(entry!.cachedAt).toBeGreaterThan(0);
      expect(entry!.cachedUntil - entry!.cachedAt).toBe(TTL_SECONDS);

      db.close();
    });

    it('should return null for a non-matching key', () => {
      const { adapter, db } = makeAdapter();

      adapter.upsert(BASE_KEY, PAYLOAD);

      const wrongKey: CacheKey = { ...BASE_KEY, username: 'torvalds' };
      expect(adapter.get(wrongKey)).toBeNull();

      db.close();
    });

    it('should be case-insensitive for username — "Octocat" and "octocat" resolve to the same entry', () => {
      const { adapter, db } = makeAdapter();

      adapter.upsert(BASE_KEY, PAYLOAD); // stored as "octocat"

      const upperKey: CacheKey = { ...BASE_KEY, username: 'Octocat' };
      const entry = adapter.get(upperKey);

      expect(entry).not.toBeNull();
      expect(entry!.username).toBe('octocat');

      db.close();
    });

    it('should strip trailing slash from providerBaseUrl — trailing-slash and no-slash keys resolve to the same entry', () => {
      const { adapter, db } = makeAdapter();

      adapter.upsert(BASE_KEY, PAYLOAD); // stored without trailing slash

      const slashKey: CacheKey = { ...BASE_KEY, providerBaseUrl: 'https://github.com/' };
      const entry = adapter.get(slashKey);

      expect(entry).not.toBeNull();
      expect(entry!.providerBaseUrl).toBe('https://github.com');

      db.close();
    });
  });

  describe('upsert', () => {
    it('should overwrite payload on a second upsert for the same key', () => {
      const { adapter, db } = makeAdapter();

      const firstPayload = JSON.stringify({ ok: true, data: ['first'] });
      const secondPayload = JSON.stringify({ ok: true, data: ['second'] });

      adapter.upsert(BASE_KEY, firstPayload);
      adapter.upsert(BASE_KEY, secondPayload);

      const entry = adapter.get(BASE_KEY);
      expect(entry!.payloadJson).toBe(secondPayload);

      db.close();
    });

    it('should normalize username to lowercase before storing', () => {
      const { adapter, db } = makeAdapter();

      const upperKey: CacheKey = { ...BASE_KEY, username: 'Octocat' };
      const stored = adapter.upsert(upperKey, PAYLOAD);

      expect(stored.username).toBe('octocat');

      // Confirm it's stored lowercase in the DB
      const row = db.prepare('SELECT username FROM cache WHERE username = ?').get('octocat') as
        | { username: string }
        | undefined;
      expect(row).toBeDefined();
      expect(row!.username).toBe('octocat');

      db.close();
    });

    it('should normalize providerBaseUrl by stripping trailing slash before storing', () => {
      const { adapter, db } = makeAdapter();

      const slashKey: CacheKey = { ...BASE_KEY, providerBaseUrl: 'https://github.com/' };
      const stored = adapter.upsert(slashKey, PAYLOAD);

      expect(stored.providerBaseUrl).toBe('https://github.com');

      const row = db
        .prepare('SELECT provider_base_url FROM cache WHERE provider_base_url = ?')
        .get('https://github.com') as { provider_base_url: string } | undefined;
      expect(row).toBeDefined();
      expect(row!.provider_base_url).toBe('https://github.com');

      db.close();
    });

    it('should return the stored entry with cachedUntil = cachedAt + TTL', () => {
      const { adapter, db } = makeAdapter();

      const stored = adapter.upsert(BASE_KEY, PAYLOAD);

      expect(stored.cachedUntil - stored.cachedAt).toBe(TTL_SECONDS);

      db.close();
    });
  });
});
