/**
 * TopSearch Integration Tests
 *
 * Tests:
 *   1. GET /api/v1/topsearch — the new leaderboard endpoint
 *   2. Recording side-effect: a successful GET /api/v1/search causes a row to
 *      appear in /api/v1/topsearch
 *
 * Uses an in-memory SQLite DB — no filesystem I/O, fully isolated between tests.
 */

import request from 'supertest';
import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import Database from 'better-sqlite3';

// Mock @octokit/graphql before importing adapters that use it
const mockGraphqlFn = jest.fn();
const mockGraphql: any = Object.assign(mockGraphqlFn, {
  defaults: jest.fn(() => mockGraphql),
});

jest.mock('@octokit/graphql', () => ({
  graphql: mockGraphql,
}));

import { createDatabase } from '../../infrastructure/persistence/database';
import { SQLiteTopSearchAdapter } from '../../infrastructure/persistence/SQLiteTopSearchAdapter';
import { SQLiteHealthAdapter } from '../../infrastructure/persistence/SQLiteHealthAdapter';
import { TopSearchService } from '../../application/services/TopSearchService';
import { HealthService } from '../../application/services/HealthService';
import { TopSearchController } from '../../interfaces/controllers/TopSearchController';
import { HealthController } from '../../interfaces/controllers/HealthController';
import { GitHubGraphQLAdapter } from '../../infrastructure/providers/GitHubGraphQLAdapter';
import { SearchService } from '../../application/services/SearchService';
import { SearchController } from '../../interfaces/controllers/SearchController';
import { createRoutes } from '../../interfaces/routes';
import { errorHandler } from '../../interfaces/middleware/errorHandler';

/**
 * Build a fully-wired Express app backed by the given in-memory DB.
 * Mirrors the DI wiring in index.ts but accepts a DB instance for test isolation.
 */
function createTestApp(db: Database.Database): Application {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  const topSearchAdapter = new SQLiteTopSearchAdapter(db);
  const topSearchService = new TopSearchService(topSearchAdapter);
  const topSearchController = new TopSearchController(topSearchService);

  const healthAdapter = new SQLiteHealthAdapter(db);
  const healthService = new HealthService(healthAdapter);
  const healthController = new HealthController(healthService);

  const githubAdapter = new GitHubGraphQLAdapter('test_token');
  const searchService = new SearchService(githubAdapter);
  const searchController = new SearchController(searchService, topSearchService);

  app.use(createRoutes(searchController, topSearchController, healthController));
  app.use(errorHandler);

  return app;
}

/** Minimal successful GitHub GraphQL response for a user.
 * Real GitHub API always returns a non-null avatarUrl, so we default to one here. */
function makeUserResponse(username: string, options: { avatarUrl?: string } = {}): object {
  return {
    user: {
      login: username,
      id: '1024',
      avatarUrl: options.avatarUrl ?? 'https://avatars.githubusercontent.com/u/1024?v=4',
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

describe('TopSearch Integration Tests', () => {
  let db: Database.Database;
  let app: Application;

  beforeEach(() => {
    db = createDatabase(':memory:');
    app = createTestApp(db);
    mockGraphqlFn.mockReset();
  });

  afterEach(() => {
    db.close();
    jest.clearAllMocks();
  });

  // ── GET /api/v1/topsearch ─────────────────────────────────────────────────

  describe('GET /api/v1/topsearch', () => {
    it('should return 200 with empty data and correct pagination shape when DB is empty', async () => {
      const res = await request(app).get('/api/v1/topsearch');

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: true,
        data: [],
        pagination: {
          total: 0,
          count: 0,
          offset: 0,
          limit: 10,
        },
      });
    });

    it('should return correct entries after manual upsert into DB', async () => {
      const adapter = new SQLiteTopSearchAdapter(db);
      adapter.upsert({ provider: 'github', username: 'torvalds', avatarUrl: 'https://av.png' });
      adapter.upsert({ provider: 'github', username: 'torvalds', avatarUrl: null });

      const res = await request(app).get('/api/v1/topsearch');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0]).toMatchObject({
        username: 'torvalds',
        provider: 'github',
        hit: 2,
        avatarUrl: 'https://av.png',
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
      });
    });

    it('should respect the limit query param', async () => {
      const adapter = new SQLiteTopSearchAdapter(db);
      adapter.upsert({ provider: 'github', username: 'a', avatarUrl: null });
      adapter.upsert({ provider: 'github', username: 'b', avatarUrl: null });
      adapter.upsert({ provider: 'github', username: 'c', avatarUrl: null });

      const res = await request(app).get('/api/v1/topsearch?limit=2');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.pagination).toMatchObject({ total: 3, limit: 2, offset: 0 });
    });

    it('should respect the offset query param', async () => {
      const adapter = new SQLiteTopSearchAdapter(db);
      // All hit=1, so tiebreak is username ASC → apple, banana, cherry
      adapter.upsert({ provider: 'github', username: 'apple', avatarUrl: null });
      adapter.upsert({ provider: 'github', username: 'banana', avatarUrl: null });
      adapter.upsert({ provider: 'github', username: 'cherry', avatarUrl: null });

      const res = await request(app).get('/api/v1/topsearch?offset=1');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.data[0].username).toBe('banana');
      expect(res.body.pagination).toMatchObject({ total: 3, offset: 1 });
    });

    it('should filter results by provider query param', async () => {
      const adapter = new SQLiteTopSearchAdapter(db);
      adapter.upsert({ provider: 'github', username: 'torvalds', avatarUrl: null });
      adapter.upsert({ provider: 'gitlab', username: 'torvalds', avatarUrl: null });

      const res = await request(app).get('/api/v1/topsearch?provider=github');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].provider).toBe('github');
      expect(res.body.pagination.total).toBe(1);
    });

    it('should return 400 for invalid limit (non-numeric string)', async () => {
      const res = await request(app).get('/api/v1/topsearch?limit=abc');

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({
        ok: false,
        error: { code: 'validation_error' },
      });
    });

    it('should return 400 for limit=0', async () => {
      const res = await request(app).get('/api/v1/topsearch?limit=0');

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({
        ok: false,
        error: { code: 'validation_error' },
      });
    });

    it('should return 400 for negative offset', async () => {
      const res = await request(app).get('/api/v1/topsearch?offset=-1');

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({
        ok: false,
        error: { code: 'validation_error' },
      });
    });

    it('should return 200 with empty result when DB has no records for the requested provider', async () => {
      const adapter = new SQLiteTopSearchAdapter(db);
      adapter.upsert({ provider: 'github', username: 'torvalds', avatarUrl: null });

      const res = await request(app).get('/api/v1/topsearch?provider=gitlab');

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: true,
        data: [],
        pagination: expect.objectContaining({ total: 0 }),
      });
    });
  });

  // ── Recording side-effect via GET /api/v1/search ─────────────────────────

  describe('Recording via GET /api/v1/search', () => {
    it('should appear in topsearch with hit=1 after one successful search', async () => {
      mockGraphqlFn.mockResolvedValueOnce(makeUserResponse('torvalds'));

      await request(app).get('/api/v1/search?username=torvalds');

      const res = await request(app).get('/api/v1/topsearch');
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0]).toMatchObject({ username: 'torvalds', hit: 1 });
    });

    it('should increment hit to 2 after two successful searches for the same username', async () => {
      mockGraphqlFn
        .mockResolvedValueOnce(makeUserResponse('torvalds'))
        .mockResolvedValueOnce(makeUserResponse('torvalds'));

      await request(app).get('/api/v1/search?username=torvalds');
      await request(app).get('/api/v1/search?username=torvalds');

      const res = await request(app).get('/api/v1/topsearch');
      expect(res.body.data[0]).toMatchObject({ username: 'torvalds', hit: 2 });
    });

    it('should normalize username to lowercase in topsearch', async () => {
      mockGraphqlFn.mockResolvedValueOnce(makeUserResponse('Torvalds'));

      await request(app).get('/api/v1/search?username=Torvalds');

      const res = await request(app).get('/api/v1/topsearch');
      expect(res.body.data[0].username).toBe('torvalds');
    });

    it('should NOT create a topsearch record when search returns user_not_found', async () => {
      const error: any = new Error('NOT_FOUND');
      error.errors = [
        { type: 'NOT_FOUND', path: ['user'], message: 'not found' },
        { type: 'NOT_FOUND', path: ['organization'], message: 'not found' },
      ];
      mockGraphqlFn.mockRejectedValueOnce(error);

      await request(app).get('/api/v1/search?username=nobody');

      const res = await request(app).get('/api/v1/topsearch');
      expect(res.body.data).toHaveLength(0);
    });

    it('should store avatarUrl from the search result in topsearch', async () => {
      const avatarUrl = 'https://avatars.githubusercontent.com/u/99999?v=4';
      mockGraphqlFn.mockResolvedValueOnce(makeUserResponse('torvalds', { avatarUrl }));

      await request(app).get('/api/v1/search?username=torvalds');

      const res = await request(app).get('/api/v1/topsearch');
      expect(res.body.data[0].avatarUrl).toBe(avatarUrl);
    });
  });

  // ── GET /health (with SQLite wired) ──────────────────────────────────────

  describe('GET /api/v1/health', () => {
    it('should return 200 with ok=true and services.database=ok when DB is healthy', async () => {
      const res = await request(app).get('/api/v1/health');

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: true,
        data: {
          uptime: expect.any(Number),
          timestamp: expect.any(String),
          services: {
            database: 'ok',
          },
        },
      });
    });

    it('should return ok=false and services.database=error when DB is closed', async () => {
      // Close the DB before the request to simulate an unhealthy connection
      db.close();

      const res = await request(app).get('/api/v1/health');

      expect(res.status).toBe(200);
      expect(res.body).toMatchObject({
        ok: false,
        data: {
          services: {
            database: 'error',
          },
        },
      });

      // Prevent afterEach from closing the already-closed DB
      db = createDatabase(':memory:');
    });
  });
});
