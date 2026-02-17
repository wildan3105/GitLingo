/**
 * API Integration Tests
 */

import request from 'supertest';
import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';

// Create a mock graphql function that can be controlled in tests
const mockGraphqlFn = jest.fn();
const mockGraphql: any = Object.assign(mockGraphqlFn, {
  defaults: jest.fn(() => mockGraphql),
});

jest.mock('@octokit/graphql', () => ({
  graphql: mockGraphql,
}));

import { GitHubGraphQLAdapter } from '../../infrastructure/providers/GitHubGraphQLAdapter';
import { SearchService } from '../../application/services/SearchService';
import { SearchController } from '../../interfaces/controllers/SearchController';
import { createRoutes } from '../../interfaces/routes';
import { errorHandler } from '../../interfaces/middleware/errorHandler';

function createTestApp(): Application {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  const githubAdapter = new GitHubGraphQLAdapter('test_token');
  const searchService = new SearchService(githubAdapter);
  const searchController = new SearchController(searchService);

  app.use(createRoutes(searchController));
  app.use(errorHandler);

  return app;
}

describe('API Integration Tests', () => {
  let app: Application;

  beforeEach(() => {
    app = createTestApp();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        status: 'ok',
        uptime: expect.any(Number),
        timestamp: expect.any(String),
      });
    });
  });

  describe('GET /api/v1/search', () => {
    it('should return language statistics for valid user with email (isVerified = true)', async () => {
      mockGraphqlFn.mockResolvedValueOnce({
        user: {
          login: 'testuser',
          id: '123',
          email: 'test@example.com',
          createdAt: '2020-01-15T10:30:00Z',
          repositories: {
            nodes: [
              { name: 'repo1', primaryLanguage: { name: 'JavaScript' }, isFork: false },
              { name: 'repo2', primaryLanguage: { name: 'JavaScript' }, isFork: false },
              { name: 'repo3', primaryLanguage: { name: 'Python' }, isFork: false },
              { name: 'fork1', primaryLanguage: { name: 'Ruby' }, isFork: true },
            ],
            pageInfo: { hasNextPage: false, endCursor: null },
            totalCount: 4,
          },
        },
        organization: null,
      });

      const response = await request(app).get('/api/v1/search?username=testuser');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        ok: true,
        provider: 'github',
        profile: {
          username: 'testuser',
          type: 'user',
          providerUserId: '123',
          isVerified: true,
          createdAt: '2020-01-15T10:30:00Z',
        },
        series: expect.arrayContaining([
          expect.objectContaining({
            key: 'JavaScript',
            label: 'JavaScript',
            value: 2,
            color: expect.any(String),
          }),
          expect.objectContaining({
            key: '__forks__',
            label: 'Forked repos',
            value: 1,
            color: '#ededed',
          }),
        ]),
        metadata: {
          generatedAt: expect.any(String),
          unit: 'repos',
        },
      });

      // Verify sorting (JavaScript should be first with 2 repos)
      expect(response.body.series[0].key).toBe('JavaScript');
      expect(response.body.series[0].value).toBe(2);
    });

    it('should return 400 for missing username', async () => {
      const response = await request(app).get('/api/v1/search');

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        ok: false,
        error: {
          code: 'validation_error',
          message: 'Invalid query parameters',
        },
      });
    });

    it('should return 400 for invalid username format', async () => {
      const response = await request(app).get('/api/v1/search?username=invalid@user');

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        ok: false,
        error: {
          code: 'validation_error',
          message: 'Invalid query parameters',
        },
      });
    });

    it('should return language statistics for user without email (isVerified = false)', async () => {
      mockGraphqlFn.mockResolvedValueOnce({
        user: {
          login: 'testuser',
          id: '123',
          email: null,
          repositories: {
            nodes: [
              { name: 'repo1', primaryLanguage: { name: 'JavaScript' }, isFork: false },
              { name: 'repo2', primaryLanguage: { name: 'Python' }, isFork: false },
            ],
            pageInfo: { hasNextPage: false, endCursor: null },
            totalCount: 2,
          },
        },
        organization: null,
      });

      const response = await request(app).get('/api/v1/search?username=testuser');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        ok: true,
        provider: 'github',
        profile: {
          username: 'testuser',
          type: 'user',
          providerUserId: '123',
          isVerified: false,
        },
      });
    });

    it('should return language statistics for user with empty email string (isVerified = false)', async () => {
      mockGraphqlFn.mockResolvedValueOnce({
        user: {
          login: 'testuser',
          id: '456',
          email: '',
          repositories: {
            nodes: [
              { name: 'repo1', primaryLanguage: { name: 'TypeScript' }, isFork: false },
              { name: 'repo2', primaryLanguage: { name: 'Go' }, isFork: false },
            ],
            pageInfo: { hasNextPage: false, endCursor: null },
            totalCount: 2,
          },
        },
        organization: null,
      });

      const response = await request(app).get('/api/v1/search?username=testuser');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        ok: true,
        provider: 'github',
        profile: {
          username: 'testuser',
          type: 'user',
          providerUserId: '456',
          isVerified: false,
        },
      });
    });

    it('should return language statistics for verified organization (github)', async () => {
      mockGraphqlFn.mockResolvedValueOnce({
        user: null,
        organization: {
          login: 'github',
          id: '789',
          isVerified: true,
          createdAt: '2008-04-10T02:30:00Z',
          repositories: {
            nodes: [
              { name: 'repo1', primaryLanguage: { name: 'TypeScript' }, isFork: false },
              { name: 'repo2', primaryLanguage: { name: 'Go' }, isFork: false },
            ],
            pageInfo: { hasNextPage: false, endCursor: null },
            totalCount: 2,
          },
        },
      });

      const response = await request(app).get('/api/v1/search?username=github');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        ok: true,
        provider: 'github',
        profile: {
          username: 'github',
          type: 'organization',
          providerUserId: '789',
          isVerified: true,
          createdAt: '2008-04-10T02:30:00Z',
        },
      });
    });

    it('should return language statistics for unverified organization (rakutentech)', async () => {
      mockGraphqlFn.mockResolvedValueOnce({
        user: null,
        organization: {
          login: 'rakutentech',
          id: '101112',
          isVerified: false,
          repositories: {
            nodes: [
              { name: 'repo1', primaryLanguage: { name: 'JavaScript' }, isFork: false },
              { name: 'repo2', primaryLanguage: { name: 'Swift' }, isFork: false },
            ],
            pageInfo: { hasNextPage: false, endCursor: null },
            totalCount: 2,
          },
        },
      });

      const response = await request(app).get('/api/v1/search?username=rakutentech');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        ok: true,
        provider: 'github',
        profile: {
          username: 'rakutentech',
          type: 'organization',
          providerUserId: '101112',
          isVerified: false,
        },
      });
    });

    it('should handle user without createdAt field (optional)', async () => {
      mockGraphqlFn.mockResolvedValueOnce({
        user: {
          login: 'testuser',
          id: '999',
          email: 'test@example.com',
          repositories: {
            nodes: [{ name: 'repo1', primaryLanguage: { name: 'C++' }, isFork: false }],
            pageInfo: { hasNextPage: false, endCursor: null },
            totalCount: 1,
          },
        },
        organization: null,
      });

      const response = await request(app).get('/api/v1/search?username=testuser');

      expect(response.status).toBe(200);
      expect(response.body.profile).toEqual({
        username: 'testuser',
        type: 'user',
        providerUserId: '999',
        isVerified: true,
      });
      expect(response.body.profile.createdAt).toBeUndefined();
    });

    it('should handle organization without createdAt field (optional)', async () => {
      mockGraphqlFn.mockResolvedValueOnce({
        user: null,
        organization: {
          login: 'testorg',
          id: '888',
          isVerified: false,
          repositories: {
            nodes: [{ name: 'repo1', primaryLanguage: { name: 'Scala' }, isFork: false }],
            pageInfo: { hasNextPage: false, endCursor: null },
            totalCount: 1,
          },
        },
      });

      const response = await request(app).get('/api/v1/search?username=testorg');

      expect(response.status).toBe(200);
      expect(response.body.profile).toEqual({
        username: 'testorg',
        type: 'organization',
        providerUserId: '888',
        isVerified: false,
      });
      expect(response.body.profile.createdAt).toBeUndefined();
    });

    it('should accept provider query parameter with default github', async () => {
      mockGraphqlFn.mockResolvedValueOnce({
        user: {
          login: 'testuser',
          id: '456',
          email: 'test@example.com',
          repositories: {
            nodes: [{ name: 'repo1', primaryLanguage: { name: 'Rust' }, isFork: false }],
            pageInfo: { hasNextPage: false, endCursor: null },
            totalCount: 1,
          },
        },
        organization: null,
      });

      // Test with explicit provider=github
      const response = await request(app).get('/api/v1/search?username=testuser&provider=github');

      expect(response.status).toBe(200);
      expect(response.body.provider).toBe('github');
    });

    it('should return 400 for invalid provider', async () => {
      const response = await request(app).get('/api/v1/search?username=testuser&provider=invalid');

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        ok: false,
        error: {
          code: 'validation_error',
          message: 'Invalid query parameters',
        },
      });
    });

    it('should return 501 for unimplemented provider (gitlab)', async () => {
      const response = await request(app).get('/api/v1/search?username=testuser&provider=gitlab');

      expect(response.status).toBe(501);
      expect(response.body).toMatchObject({
        ok: false,
        provider: 'gitlab',
        error: {
          code: 'not_implemented',
          message: expect.stringContaining('gitlab'),
          details: {
            provider: 'gitlab',
            supportedProviders: ['github'],
          },
        },
      });
    });

    it('should return 501 for unimplemented provider (bitbucket)', async () => {
      const response = await request(app).get(
        '/api/v1/search?username=testuser&provider=bitbucket'
      );

      expect(response.status).toBe(501);
      expect(response.body).toMatchObject({
        ok: false,
        provider: 'bitbucket',
        error: {
          code: 'not_implemented',
          message: expect.stringContaining('bitbucket'),
        },
      });
    });

    it('should return 404 for non-existent user', async () => {
      const error: any = new Error('GraphQL Error: NOT_FOUND');
      error.errors = [
        {
          type: 'NOT_FOUND',
          path: ['user'],
          message: "Could not resolve to a User with the login of 'nonexistent'.",
        },
        {
          type: 'NOT_FOUND',
          path: ['organization'],
          message: "Could not resolve to an Organization with the login of 'nonexistent'.",
        },
      ];
      mockGraphqlFn.mockRejectedValueOnce(error);

      const response = await request(app).get('/api/v1/search?username=nonexistent');

      expect(response.status).toBe(404);
      expect(response.body).toMatchObject({
        ok: false,
        error: {
          code: 'user_not_found',
        },
      });
    });

    it('should return 429 for rate limit exceeded', async () => {
      const error: any = new Error('API rate limit exceeded');
      error.status = 403;
      mockGraphqlFn.mockRejectedValueOnce(error);

      const response = await request(app).get('/api/v1/search?username=testuser');

      expect(response.status).toBe(429);
      expect(response.body).toMatchObject({
        ok: false,
        error: {
          code: 'rate_limited',
          retry_after_seconds: 60,
        },
      });
    });

    it('should handle network errors gracefully', async () => {
      const error = new Error('Network error');
      mockGraphqlFn.mockRejectedValueOnce(error);

      const response = await request(app).get('/api/v1/search?username=testuser');

      expect(response.status).toBe(503);
      expect(response.body).toMatchObject({
        ok: false,
        error: {
          code: 'network_error',
        },
      });
    });
  });
});
