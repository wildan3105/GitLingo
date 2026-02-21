/**
 * Cache Integration Tests
 * Verifies end-to-end cache behavior through the full request path:
 * routing → controller → CachedSearchService → SQLiteCacheAdapter → in-memory SQLite.
 *
 * GitHub API is mocked; no real network calls are made.
 */

import request from 'supertest';
import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import Database from 'better-sqlite3';

// Create mock graphql function before any imports that reference @octokit/graphql
const mockGraphqlFn = jest.fn();
const mockGraphql: any = Object.assign(mockGraphqlFn, {
  defaults: jest.fn(() => mockGraphql),
});

jest.mock('@octokit/graphql', () => ({
  graphql: mockGraphql,
}));

import { GitHubGraphQLAdapter } from '../../infrastructure/providers/GitHubGraphQLAdapter';
import { SearchService } from '../../application/services/SearchService';
import { CachedSearchService } from '../../application/services/CachedSearchService';
import { SQLiteCacheAdapter } from '../../infrastructure/persistence/SQLiteCacheAdapter';
import { createDatabase } from '../../infrastructure/persistence/database';
import { SearchController } from '../../interfaces/controllers/SearchController';
import { createRoutes } from '../../interfaces/routes';
import { errorHandler } from '../../interfaces/middleware/errorHandler';

const PROVIDER_BASE_URL = 'https://github.com';
const TTL_SECONDS = 3600;

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------

/** Minimal GitHub GraphQL response shape that produces a valid SearchResult */
function makeMockGitHubResponse(login = 'testuser') {
  return {
    user: {
      login,
      id: '123',
      email: 'test@example.com',
      repositories: {
        nodes: [{ name: 'repo1', primaryLanguage: { name: 'JavaScript' }, isFork: false }],
        pageInfo: { hasNextPage: false, endCursor: null },
        totalCount: 1,
      },
    },
    organization: null,
  };
}

/** Simulated rate-limit error from GitHub GraphQL */
function makeRateLimitError() {
  const error: any = new Error('API rate limit exceeded');
  error.status = 403;
  return error;
}

/**
 * Payload shape stored by CachedSearchService.upsert — metadata excluded.
 * Must include providerBaseUrl since the real adapter derives it from the avatar URL.
 */
const CACHED_PAYLOAD = JSON.stringify({
  ok: true,
  provider: 'github',
  profile: {
    username: 'testuser',
    type: 'user',
    providerUserId: '123',
    isVerified: true,
    providerBaseUrl: PROVIDER_BASE_URL,
  },
  data: [{ key: 'JavaScript', label: 'JavaScript', value: 1, color: '#f1e05a' }],
});

/**
 * Insert a cache row directly into the DB, bypassing the SQLiteCacheAdapter.
 * Returns the epoch-second timestamps used so tests can assert on them.
 */
function insertCacheRow(
  db: Database.Database,
  opts: { username?: string; expired?: boolean } = {}
): { cachedAt: number; cachedUntil: number } {
  const now = Math.floor(Date.now() / 1000);
  const username = (opts.username ?? 'testuser').toLowerCase();
  const cachedAt = now - 3600; // stored 1 hour ago
  const cachedUntil = opts.expired ? now - 1 : now + TTL_SECONDS;

  db.prepare(
    `INSERT INTO cache
       (provider, provider_base_url, username, schema_version, options_hash,
        payload_json, cached_at, cached_until, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    'github',
    PROVIDER_BASE_URL,
    username,
    'v1',
    'default',
    CACHED_PAYLOAD,
    cachedAt,
    cachedUntil,
    cachedAt
  );

  return { cachedAt, cachedUntil };
}

/** Create a test app wired with CachedSearchService + real in-memory SQLite. */
function createCachedTestApp(db: Database.Database, ttlSeconds = TTL_SECONDS): Application {
  const app = express();
  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  const githubAdapter = new GitHubGraphQLAdapter('test_token');
  const searchService = new SearchService(githubAdapter);
  const cacheAdapter = new SQLiteCacheAdapter(db, ttlSeconds);
  const cachedService = new CachedSearchService(searchService, cacheAdapter, PROVIDER_BASE_URL);
  const controller = new SearchController(cachedService as unknown as SearchService);

  app.use(createRoutes(controller));
  app.use(errorHandler);

  return app;
}

/** Create a test app with a plain SearchService (no cache). */
function createUncachedTestApp(): Application {
  const app = express();
  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  const githubAdapter = new GitHubGraphQLAdapter('test_token');
  const searchService = new SearchService(githubAdapter);
  const controller = new SearchController(searchService);

  app.use(createRoutes(controller));
  app.use(errorHandler);

  return app;
}

// --------------------------------------------------------------------------
// Tests
// --------------------------------------------------------------------------

describe('Cache Integration Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('cache disabled', () => {
    it('should call GitHub on every request and return no cachedAt/cachedUntil', async () => {
      const app = createUncachedTestApp();

      mockGraphqlFn
        .mockResolvedValueOnce(makeMockGitHubResponse())
        .mockResolvedValueOnce(makeMockGitHubResponse());

      await request(app).get('/api/v1/search?username=testuser');
      const response = await request(app).get('/api/v1/search?username=testuser');

      expect(mockGraphqlFn).toHaveBeenCalledTimes(2);
      expect(response.status).toBe(200);
      expect(response.body.metadata).not.toHaveProperty('cachedAt');
      expect(response.body.metadata).not.toHaveProperty('cachedUntil');
    });
  });

  describe('first request (cache enabled, cold)', () => {
    it('should call GitHub once and return cachedAt/cachedUntil in response metadata', async () => {
      const db = createDatabase(':memory:');
      const app = createCachedTestApp(db);

      mockGraphqlFn.mockResolvedValueOnce(makeMockGitHubResponse());

      const response = await request(app).get('/api/v1/search?username=testuser');

      expect(response.status).toBe(200);
      expect(mockGraphqlFn).toHaveBeenCalledTimes(1);
      expect(response.body.metadata).toHaveProperty('cachedAt');
      expect(response.body.metadata).toHaveProperty('cachedUntil');
      // Sanity check: both values are ISO-8601 strings
      expect(response.body.metadata.cachedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(response.body.metadata.cachedUntil).toMatch(/^\d{4}-\d{2}-\d{2}T/);

      db.close();
    });
  });

  describe('second request (cache enabled, warm, TTL valid)', () => {
    it('should NOT call GitHub again and return the same cachedAt/cachedUntil', async () => {
      const db = createDatabase(':memory:');
      const app = createCachedTestApp(db);

      // Only one mock response — the second request must serve from cache
      mockGraphqlFn.mockResolvedValueOnce(makeMockGitHubResponse());

      const first = await request(app).get('/api/v1/search?username=testuser');
      const second = await request(app).get('/api/v1/search?username=testuser');

      expect(first.status).toBe(200);
      expect(second.status).toBe(200);
      expect(mockGraphqlFn).toHaveBeenCalledTimes(1); // only on cold miss
      expect(second.body.metadata.cachedAt).toBe(first.body.metadata.cachedAt);
      expect(second.body.metadata.cachedUntil).toBe(first.body.metadata.cachedUntil);

      db.close();
    });
  });

  describe('request after TTL expired', () => {
    it('should call GitHub again and return new cachedAt/cachedUntil', async () => {
      const db = createDatabase(':memory:');
      const { cachedAt: oldCachedAt } = insertCacheRow(db, { expired: true });
      const app = createCachedTestApp(db);

      mockGraphqlFn.mockResolvedValueOnce(makeMockGitHubResponse());

      const response = await request(app).get('/api/v1/search?username=testuser');

      expect(response.status).toBe(200);
      expect(mockGraphqlFn).toHaveBeenCalledTimes(1);
      expect(response.body.metadata).toHaveProperty('cachedAt');
      expect(response.body.metadata).toHaveProperty('cachedUntil');

      // The new cachedAt must be more recent than the old expired one
      const newCachedAtSeconds = new Date(response.body.metadata.cachedAt).getTime() / 1000;
      expect(newCachedAtSeconds).toBeGreaterThan(oldCachedAt);

      db.close();
    });
  });

  describe('GitHub error + valid cache', () => {
    it('should serve the cached result without calling GitHub', async () => {
      const db = createDatabase(':memory:');
      insertCacheRow(db); // valid (non-expired) entry
      const app = createCachedTestApp(db);

      // No mock setup — GitHub must NOT be called for a valid cache hit
      const response = await request(app).get('/api/v1/search?username=testuser');

      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(mockGraphqlFn).not.toHaveBeenCalled();
      expect(response.body.metadata).toHaveProperty('cachedAt');
      expect(response.body.metadata).toHaveProperty('cachedUntil');

      db.close();
    });
  });

  describe('GitHub error + expired cache', () => {
    it('should serve the expired cache entry and preserve its cachedAt/cachedUntil', async () => {
      const db = createDatabase(':memory:');
      const { cachedAt, cachedUntil } = insertCacheRow(db, { expired: true });
      const app = createCachedTestApp(db);

      mockGraphqlFn.mockRejectedValueOnce(makeRateLimitError());

      const response = await request(app).get('/api/v1/search?username=testuser');

      // Must serve the stale cached result, not the GitHub error
      expect(response.status).toBe(200);
      expect(response.body.ok).toBe(true);
      expect(response.body.metadata.cachedAt).toBe(new Date(cachedAt * 1000).toISOString());
      expect(response.body.metadata.cachedUntil).toBe(new Date(cachedUntil * 1000).toISOString());

      db.close();
    });
  });

  describe('GitHub error + no cache', () => {
    it('should return an error response with no cachedAt/cachedUntil', async () => {
      const db = createDatabase(':memory:');
      const app = createCachedTestApp(db);

      mockGraphqlFn.mockRejectedValueOnce(makeRateLimitError());

      const response = await request(app).get('/api/v1/search?username=testuser');

      expect(response.status).toBe(403);
      expect(response.body.ok).toBe(false);
      // Error response uses SearchError shape (no `metadata` key)
      expect(response.body.metadata).toBeUndefined();

      db.close();
    });
  });

  describe('generatedAt on cache hit', () => {
    it('should equal cachedAt when serving from a valid cache entry', async () => {
      const db = createDatabase(':memory:');
      insertCacheRow(db); // valid (non-expired) entry
      const app = createCachedTestApp(db);

      const response = await request(app).get('/api/v1/search?username=testuser');

      expect(response.status).toBe(200);
      expect(response.body.metadata.generatedAt).toBe(response.body.metadata.cachedAt);

      db.close();
    });
  });

  describe('generatedAt on cache miss', () => {
    it('should be the time of the fresh fetch and differ from cachedAt', async () => {
      const db = createDatabase(':memory:');
      const app = createCachedTestApp(db);

      mockGraphqlFn.mockResolvedValueOnce(makeMockGitHubResponse());

      const response = await request(app).get('/api/v1/search?username=testuser');

      expect(response.status).toBe(200);
      expect(response.body.metadata).toHaveProperty('generatedAt');
      expect(response.body.metadata).toHaveProperty('cachedAt');
      // generatedAt has millisecond precision ("...T10:30:45.123Z")
      // cachedAt is stored as epoch-seconds and always ends in ".000Z"
      // → they must differ (unless the request happens at exactly :000ms — virtually impossible)
      expect(response.body.metadata.generatedAt).not.toBe(response.body.metadata.cachedAt);

      db.close();
    });
  });
});
