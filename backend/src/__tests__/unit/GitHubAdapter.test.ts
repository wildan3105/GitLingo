/**
 * GitHubGraphQLAdapter Unit Tests
 */

import nock from 'nock';
import { ProviderError } from '../../infrastructure/errors/ProviderError';

// Mock @octokit/graphql to avoid ES module issues
const mockGraphql = jest.fn() as jest.Mock & {
  defaults: jest.Mock;
};
(mockGraphql as any).defaults = jest.fn(() => mockGraphql);

jest.mock('@octokit/graphql', () => ({
  graphql: mockGraphql,
}));

import { GitHubGraphQLAdapter } from '../../infrastructure/providers/GitHubGraphQLAdapter';

describe('GitHubGraphQLAdapter', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  describe('fetchRepositories', () => {
    it('should fetch repositories successfully', async () => {
      const adapter = new GitHubGraphQLAdapter('test_token');

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
                  { name: 'repo2', primaryLanguage: { name: 'Python' }, isFork: false },
                ],
                pageInfo: { hasNextPage: false, endCursor: null },
                totalCount: 2,
              },
            },
            organization: null,
          },
        });

      const repos = await adapter.fetchRepositories('testuser');

      expect(repos).toHaveLength(2);
      expect(repos[0]).toEqual({
        name: 'repo1',
        language: 'JavaScript',
        isFork: false,
      });
      expect(repos[1]).toEqual({
        name: 'repo2',
        language: 'Python',
        isFork: false,
      });
    });

    it('should handle repositories without language', async () => {
      const adapter = new GitHubGraphQLAdapter('test_token');

      nock('https://api.github.com')
        .post('/graphql')
        .reply(200, {
          data: {
            user: {
              login: 'testuser',
              id: '123',
              repositories: {
                nodes: [{ name: 'repo1', primaryLanguage: null, isFork: false }],
                pageInfo: { hasNextPage: false, endCursor: null },
                totalCount: 1,
              },
            },
            organization: null,
          },
        });

      const repos = await adapter.fetchRepositories('testuser');

      expect(repos).toHaveLength(1);
      expect(repos[0]?.language).toBeNull();
    });

    it('should handle pagination correctly', async () => {
      const adapter = new GitHubGraphQLAdapter('test_token');

      // First page
      nock('https://api.github.com')
        .post('/graphql')
        .reply(200, {
          data: {
            user: {
              login: 'testuser',
              id: '123',
              repositories: {
                nodes: [{ name: 'repo1', primaryLanguage: { name: 'JavaScript' }, isFork: false }],
                pageInfo: { hasNextPage: true, endCursor: 'cursor1' },
                totalCount: 2,
              },
            },
            organization: null,
          },
        });

      // Second page
      nock('https://api.github.com')
        .post('/graphql')
        .reply(200, {
          data: {
            user: {
              login: 'testuser',
              id: '123',
              repositories: {
                nodes: [{ name: 'repo2', primaryLanguage: { name: 'Python' }, isFork: false }],
                pageInfo: { hasNextPage: false, endCursor: null },
                totalCount: 2,
              },
            },
            organization: null,
          },
        });

      const repos = await adapter.fetchRepositories('testuser');

      expect(repos).toHaveLength(2);
      expect(repos[0]?.name).toBe('repo1');
      expect(repos[1]?.name).toBe('repo2');
    });

    it('should throw USER_NOT_FOUND error when user does not exist', async () => {
      const adapter = new GitHubGraphQLAdapter('test_token');

      nock('https://api.github.com')
        .post('/graphql')
        .reply(200, {
          data: {
            user: null,
            organization: null,
          },
        });

      await expect(adapter.fetchRepositories('nonexistent')).rejects.toThrow(ProviderError);
      await expect(adapter.fetchRepositories('nonexistent')).rejects.toMatchObject({
        code: 'USER_NOT_FOUND',
        message: expect.stringContaining('not found'),
      });
    });

    it('should throw RATE_LIMITED error on 403 status', async () => {
      const adapter = new GitHubGraphQLAdapter('test_token');

      nock('https://api.github.com')
        .post('/graphql')
        .reply(403, {
          message: 'API rate limit exceeded',
        });

      await expect(adapter.fetchRepositories('testuser')).rejects.toThrow(ProviderError);
      await expect(adapter.fetchRepositories('testuser')).rejects.toMatchObject({
        code: 'RATE_LIMITED',
        retryAfter: 60,
      });
    });

    it('should return provider name as github', () => {
      const adapter = new GitHubGraphQLAdapter();
      expect(adapter.getProviderName()).toBe('github');
    });
  });
});
