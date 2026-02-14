/**
 * API Integration Tests
 */

import request from 'supertest';
import nock from 'nock';
import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';

// Mock @octokit/graphql to avoid ES module issues
const mockGraphql = jest.fn() as jest.Mock & {
  defaults: jest.Mock;
};
(mockGraphql as any).defaults = jest.fn(() => mockGraphql);

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
    nock.cleanAll();
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
    it('should return language statistics for valid user', async () => {
      nock('https://api.github.com')
        .post('/graphql')
        .reply(200, {
          data: {
            user: {
              login: 'testuser',
              id: '123',
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
          },
        });

      const response = await request(app).get('/api/v1/search?username=testuser');

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        ok: true,
        provider: 'github',
        profile: {
          username: 'testuser',
          type: 'user',
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
          limit: 4,
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

    it('should return 404 for non-existent user', async () => {
      nock('https://api.github.com')
        .post('/graphql')
        .reply(200, {
          data: {
            user: null,
            organization: null,
          },
        });

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
      nock('https://api.github.com')
        .post('/graphql')
        .reply(403, {
          message: 'API rate limit exceeded',
        });

      const response = await request(app).get('/api/v1/search?username=testuser');

      expect(response.status).toBe(429);
      expect(response.body).toMatchObject({
        ok: false,
        error: {
          code: 'rate_limited',
        },
      });
    });

    it('should handle network errors gracefully', async () => {
      nock('https://api.github.com').post('/graphql').replyWithError('Network error');

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
