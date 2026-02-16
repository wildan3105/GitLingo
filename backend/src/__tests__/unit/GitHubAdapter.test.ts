/**
 * GitHubGraphQLAdapter Unit Tests
 */

import { ProviderError } from '../../infrastructure/errors/ProviderError';

// Create a mock graphql function that can be controlled in tests
const mockGraphqlFn = jest.fn();
const mockGraphql: any = Object.assign(mockGraphqlFn, {
  defaults: jest.fn(() => mockGraphql),
});

jest.mock('@octokit/graphql', () => ({
  graphql: mockGraphql,
}));

import { GitHubGraphQLAdapter } from '../../infrastructure/providers/GitHubGraphQLAdapter';

describe('GitHubGraphQLAdapter', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchRepositories', () => {
    it('should fetch repositories successfully for user with email', async () => {
      const adapter = new GitHubGraphQLAdapter('test_token');

      mockGraphqlFn.mockResolvedValueOnce({
        user: {
          login: 'testuser',
          id: '123',
          email: 'test@example.com',
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

      const result = await adapter.fetchRepositories('testuser');

      expect(result.profile).toEqual({
        username: 'testuser',
        type: 'user',
        providerUserId: '123',
        isVerified: true,
      });
      expect(result.repositories).toHaveLength(2);
      expect(result.repositories[0]).toEqual({
        name: 'repo1',
        language: 'JavaScript',
        isFork: false,
      });
      expect(result.repositories[1]).toEqual({
        name: 'repo2',
        language: 'Python',
        isFork: false,
      });
    });

    it('should handle user without email (isVerified = false)', async () => {
      const adapter = new GitHubGraphQLAdapter('test_token');

      mockGraphqlFn.mockResolvedValueOnce({
        user: {
          login: 'testuser',
          id: '123',
          email: null,
          repositories: {
            nodes: [{ name: 'repo1', primaryLanguage: { name: 'JavaScript' }, isFork: false }],
            pageInfo: { hasNextPage: false, endCursor: null },
            totalCount: 1,
          },
        },
        organization: null,
      });

      const result = await adapter.fetchRepositories('testuser');

      expect(result.profile).toEqual({
        username: 'testuser',
        type: 'user',
        providerUserId: '123',
        isVerified: false,
      });
    });

    it('should handle user with empty email string (isVerified = false)', async () => {
      const adapter = new GitHubGraphQLAdapter('test_token');

      mockGraphqlFn.mockResolvedValueOnce({
        user: {
          login: 'testuser',
          id: '123',
          email: '',
          repositories: {
            nodes: [{ name: 'repo1', primaryLanguage: { name: 'JavaScript' }, isFork: false }],
            pageInfo: { hasNextPage: false, endCursor: null },
            totalCount: 1,
          },
        },
        organization: null,
      });

      const result = await adapter.fetchRepositories('testuser');

      expect(result.profile).toEqual({
        username: 'testuser',
        type: 'user',
        providerUserId: '123',
        isVerified: false,
      });
    });

    it('should handle user with whitespace-only email (isVerified = false)', async () => {
      const adapter = new GitHubGraphQLAdapter('test_token');

      mockGraphqlFn.mockResolvedValueOnce({
        user: {
          login: 'testuser',
          id: '123',
          email: '   ',
          repositories: {
            nodes: [{ name: 'repo1', primaryLanguage: { name: 'JavaScript' }, isFork: false }],
            pageInfo: { hasNextPage: false, endCursor: null },
            totalCount: 1,
          },
        },
        organization: null,
      });

      const result = await adapter.fetchRepositories('testuser');

      expect(result.profile).toEqual({
        username: 'testuser',
        type: 'user',
        providerUserId: '123',
        isVerified: false,
      });
    });

    it('should handle repositories without language', async () => {
      const adapter = new GitHubGraphQLAdapter('test_token');

      mockGraphqlFn.mockResolvedValueOnce({
        user: {
          login: 'testuser',
          id: '123',
          email: 'test@example.com',
          repositories: {
            nodes: [{ name: 'repo1', primaryLanguage: null, isFork: false }],
            pageInfo: { hasNextPage: false, endCursor: null },
            totalCount: 1,
          },
        },
        organization: null,
      });

      const result = await adapter.fetchRepositories('testuser');

      expect(result.repositories).toHaveLength(1);
      expect(result.repositories[0]?.language).toBeNull();
    });

    it('should handle pagination correctly', async () => {
      const adapter = new GitHubGraphQLAdapter('test_token');

      // First page
      mockGraphqlFn.mockResolvedValueOnce({
        user: {
          login: 'testuser',
          id: '123',
          email: 'test@example.com',
          repositories: {
            nodes: [{ name: 'repo1', primaryLanguage: { name: 'JavaScript' }, isFork: false }],
            pageInfo: { hasNextPage: true, endCursor: 'cursor1' },
            totalCount: 2,
          },
        },
        organization: null,
      });

      // Second page
      mockGraphqlFn.mockResolvedValueOnce({
        user: {
          login: 'testuser',
          id: '123',
          email: 'test@example.com',
          repositories: {
            nodes: [{ name: 'repo2', primaryLanguage: { name: 'Python' }, isFork: false }],
            pageInfo: { hasNextPage: false, endCursor: null },
            totalCount: 2,
          },
        },
        organization: null,
      });

      const result = await adapter.fetchRepositories('testuser');

      expect(result.repositories).toHaveLength(2);
      expect(result.repositories[0]?.name).toBe('repo1');
      expect(result.repositories[1]?.name).toBe('repo2');
    });

    it('should throw USER_NOT_FOUND error when user does not exist', async () => {
      const adapter = new GitHubGraphQLAdapter('test_token');

      // Mock the exact structure that @octokit/graphql throws for NOT_FOUND
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

      mockGraphqlFn.mockRejectedValue(error); // Use mockRejectedValue instead of Once

      await expect(adapter.fetchRepositories('nonexistent')).rejects.toThrow(ProviderError);
      await expect(adapter.fetchRepositories('nonexistent')).rejects.toMatchObject({
        code: 'USER_NOT_FOUND',
        message: expect.stringContaining('not found'),
      });
    });

    it('should throw RATE_LIMITED error on 403 status', async () => {
      const adapter = new GitHubGraphQLAdapter('test_token');

      const error: any = new Error('API rate limit exceeded');
      error.status = 403;

      mockGraphqlFn.mockRejectedValue(error); // Use mockRejectedValue instead of Once

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

    it('should handle verified organization (github)', async () => {
      const adapter = new GitHubGraphQLAdapter('test_token');

      mockGraphqlFn.mockResolvedValueOnce({
        user: null,
        organization: {
          login: 'github',
          id: '456',
          isVerified: true,
          repositories: {
            nodes: [{ name: 'repo1', primaryLanguage: { name: 'Go' }, isFork: false }],
            pageInfo: { hasNextPage: false, endCursor: null },
            totalCount: 1,
          },
        },
      });

      const result = await adapter.fetchRepositories('github');

      expect(result.profile).toEqual({
        username: 'github',
        type: 'organization',
        providerUserId: '456',
        isVerified: true,
      });
      expect(result.repositories).toHaveLength(1);
    });

    it('should handle unverified organization (rakutentech)', async () => {
      const adapter = new GitHubGraphQLAdapter('test_token');

      mockGraphqlFn.mockResolvedValueOnce({
        user: null,
        organization: {
          login: 'rakutentech',
          id: '789',
          isVerified: false,
          repositories: {
            nodes: [{ name: 'repo1', primaryLanguage: { name: 'JavaScript' }, isFork: false }],
            pageInfo: { hasNextPage: false, endCursor: null },
            totalCount: 1,
          },
        },
      });

      const result = await adapter.fetchRepositories('rakutentech');

      expect(result.profile).toEqual({
        username: 'rakutentech',
        type: 'organization',
        providerUserId: '789',
        isVerified: false,
      });
      expect(result.repositories).toHaveLength(1);
    });

    it('should handle organization without isVerified field (default to false)', async () => {
      const adapter = new GitHubGraphQLAdapter('test_token');

      mockGraphqlFn.mockResolvedValueOnce({
        user: null,
        organization: {
          login: 'testorg',
          id: '456',
          repositories: {
            nodes: [{ name: 'repo1', primaryLanguage: { name: 'Go' }, isFork: false }],
            pageInfo: { hasNextPage: false, endCursor: null },
            totalCount: 1,
          },
        },
      });

      const result = await adapter.fetchRepositories('testorg');

      expect(result.profile).toEqual({
        username: 'testorg',
        type: 'organization',
        providerUserId: '456',
        isVerified: false,
      });
      expect(result.repositories).toHaveLength(1);
    });
  });
});
