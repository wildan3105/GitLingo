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
          createdAt: '2020-01-15T10:30:00Z',
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
        createdAt: '2020-01-15T10:30:00Z',
        providerBaseUrl: 'https://github.com',
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
        providerBaseUrl: 'https://github.com',
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
        providerBaseUrl: 'https://github.com',
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
        providerBaseUrl: 'https://github.com',
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

    it('should throw RATE_LIMITED error on 403 status with fallback retryAfter when no header', async () => {
      const adapter = new GitHubGraphQLAdapter('test_token');

      const error: any = new Error('API rate limit exceeded');
      error.status = 403;
      // no response.headers set — should fall back to 60

      mockGraphqlFn.mockRejectedValue(error);

      await expect(adapter.fetchRepositories('testuser')).rejects.toThrow(ProviderError);
      await expect(adapter.fetchRepositories('testuser')).rejects.toMatchObject({
        code: 'RATE_LIMITED',
        retryAfter: 60,
      });
    });

    it('should compute retryAfter from x-ratelimit-reset header on 403 status', async () => {
      const adapter = new GitHubGraphQLAdapter('test_token');

      const resetAt = Math.floor(Date.now() / 1000) + 300; // 300 seconds from now
      const error: any = new Error('API rate limit exceeded');
      error.status = 403;
      error.response = { headers: { 'x-ratelimit-reset': String(resetAt) } };

      mockGraphqlFn.mockRejectedValue(error);

      const thrown = await adapter.fetchRepositories('testuser').catch((e) => e);
      expect(thrown).toBeInstanceOf(ProviderError);
      expect(thrown.code).toBe('RATE_LIMITED');
      // Allow ±2s tolerance for test execution time
      expect(thrown.retryAfter).toBeGreaterThanOrEqual(298);
      expect(thrown.retryAfter).toBeLessThanOrEqual(300);
    });

    it('should return retryAfter of 0 when x-ratelimit-reset is in the past', async () => {
      const adapter = new GitHubGraphQLAdapter('test_token');

      const resetAt = Math.floor(Date.now() / 1000) - 10; // 10 seconds ago
      const error: any = new Error('API rate limit exceeded');
      error.status = 403;
      error.response = { headers: { 'x-ratelimit-reset': String(resetAt) } };

      mockGraphqlFn.mockRejectedValue(error);

      const thrown = await adapter.fetchRepositories('testuser').catch((e) => e);
      expect(thrown).toBeInstanceOf(ProviderError);
      expect(thrown.code).toBe('RATE_LIMITED');
      expect(thrown.retryAfter).toBe(0);
    });

    it('should compute retryAfter from x-ratelimit-reset header on GraphQL RATE_LIMITED error', async () => {
      const adapter = new GitHubGraphQLAdapter('test_token');

      const resetAt = Math.floor(Date.now() / 1000) + 120; // 120 seconds from now
      const error: any = new Error('rate limit exceeded');
      error.errors = [{ type: 'RATE_LIMITED', message: 'rate limit exceeded' }];
      error.response = { headers: { 'x-ratelimit-reset': String(resetAt) } };

      mockGraphqlFn.mockRejectedValue(error);

      const thrown = await adapter.fetchRepositories('testuser').catch((e) => e);
      expect(thrown).toBeInstanceOf(ProviderError);
      expect(thrown.code).toBe('RATE_LIMITED');
      expect(thrown.retryAfter).toBeGreaterThanOrEqual(118);
      expect(thrown.retryAfter).toBeLessThanOrEqual(120);
    });

    it('should throw INVALID_TOKEN error on 401 status', async () => {
      const adapter = new GitHubGraphQLAdapter('test_token');

      const error: any = new Error('Bad credentials');
      error.status = 401;

      mockGraphqlFn.mockRejectedValue(error);

      await expect(adapter.fetchRepositories('testuser')).rejects.toThrow(ProviderError);
      await expect(adapter.fetchRepositories('testuser')).rejects.toMatchObject({
        code: 'INVALID_TOKEN',
        message: 'The provided token is invalid. Please check your token and try again.',
      });
    });

    it('should throw INVALID_TOKEN error when message contains "bad credentials"', async () => {
      const adapter = new GitHubGraphQLAdapter('test_token');

      const error: any = new Error('Bad credentials');

      mockGraphqlFn.mockRejectedValue(error);

      await expect(adapter.fetchRepositories('testuser')).rejects.toThrow(ProviderError);
      await expect(adapter.fetchRepositories('testuser')).rejects.toMatchObject({
        code: 'INVALID_TOKEN',
        message: 'The provided token is invalid. Please check your token and try again.',
      });
    });

    it('should throw INSUFFICIENT_SCOPES error when GraphQL errors contain INSUFFICIENT_SCOPES type', async () => {
      const adapter = new GitHubGraphQLAdapter('test_token');

      const error: any = new Error('Request failed due to following response errors');
      error.errors = [
        {
          type: 'INSUFFICIENT_SCOPES',
          locations: [{ line: 9, column: 5 }],
          message:
            "Your token has not been granted the required scopes. The 'email' field requires ['user:email', 'read:user'].",
        },
        {
          type: 'INSUFFICIENT_SCOPES',
          locations: [{ line: 20, column: 5 }],
          message:
            "Your token has not been granted the required scopes. The 'login' field requires ['read:org'].",
        },
      ];

      mockGraphqlFn.mockRejectedValue(error);

      await expect(adapter.fetchRepositories('testuser')).rejects.toThrow(ProviderError);
      await expect(adapter.fetchRepositories('testuser')).rejects.toMatchObject({
        code: 'INSUFFICIENT_SCOPES',
        message:
          "The provided token does not have the required permissions. Please check your token's scopes and try again.",
      });
    });

    it('should throw INSUFFICIENT_SCOPES even when partial data is returned alongside the error', async () => {
      const adapter = new GitHubGraphQLAdapter('test_token');

      // Simulate @octokit/graphql throwing with both data and errors
      const error: any = new Error('Request failed due to following response errors');
      error.errors = [
        {
          type: 'INSUFFICIENT_SCOPES',
          message: 'Your token has not been granted the required scopes.',
        },
      ];
      error.data = {
        user: {
          login: 'testuser',
          id: '123',
          repositories: {
            nodes: [{ name: 'repo1', primaryLanguage: { name: 'JavaScript' }, isFork: false }],
            pageInfo: { hasNextPage: false, endCursor: null },
            totalCount: 1,
          },
        },
        organization: null,
      };

      mockGraphqlFn.mockRejectedValue(error);

      await expect(adapter.fetchRepositories('testuser')).rejects.toMatchObject({
        code: 'INSUFFICIENT_SCOPES',
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
          createdAt: '2008-04-10T02:30:00Z',
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
        createdAt: '2008-04-10T02:30:00Z',
        providerBaseUrl: 'https://github.com',
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
        providerBaseUrl: 'https://github.com',
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
        providerBaseUrl: 'https://github.com',
      });
      expect(result.repositories).toHaveLength(1);
    });

    it('should handle user without createdAt field (optional field)', async () => {
      const adapter = new GitHubGraphQLAdapter('test_token');

      mockGraphqlFn.mockResolvedValueOnce({
        user: {
          login: 'testuser',
          id: '999',
          email: 'test@example.com',
          repositories: {
            nodes: [{ name: 'repo1', primaryLanguage: { name: 'Ruby' }, isFork: false }],
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
        providerUserId: '999',
        isVerified: true,
        providerBaseUrl: 'https://github.com',
      });
      expect(result.profile.createdAt).toBeUndefined();
    });

    it('should handle organization without createdAt field (optional field)', async () => {
      const adapter = new GitHubGraphQLAdapter('test_token');

      mockGraphqlFn.mockResolvedValueOnce({
        user: null,
        organization: {
          login: 'testorg',
          id: '888',
          isVerified: true,
          repositories: {
            nodes: [{ name: 'repo1', primaryLanguage: { name: 'Rust' }, isFork: false }],
            pageInfo: { hasNextPage: false, endCursor: null },
            totalCount: 1,
          },
        },
      });

      const result = await adapter.fetchRepositories('testorg');

      expect(result.profile).toEqual({
        username: 'testorg',
        type: 'organization',
        providerUserId: '888',
        isVerified: true,
        providerBaseUrl: 'https://github.com',
      });
      expect(result.profile.createdAt).toBeUndefined();
    });

    it('should extract providerBaseUrl from GitHub.com avatar URL', async () => {
      const adapter = new GitHubGraphQLAdapter('test_token');

      mockGraphqlFn.mockResolvedValueOnce({
        user: {
          login: 'airbnb',
          id: '698437',
          email: 'opensource@airbnb.com',
          avatarUrl: 'https://avatars.githubusercontent.com/u/698437?v=4',
          repositories: {
            nodes: [{ name: 'javascript', primaryLanguage: { name: 'JavaScript' }, isFork: false }],
            pageInfo: { hasNextPage: false, endCursor: null },
            totalCount: 1,
          },
        },
        organization: null,
      });

      const result = await adapter.fetchRepositories('airbnb');

      expect(result.profile.avatarUrl).toBe('https://avatars.githubusercontent.com/u/698437?v=4');
      expect(result.profile.providerBaseUrl).toBe('https://github.com');
    });

    it('should extract providerBaseUrl from GHE avatar URL', async () => {
      const adapter = new GitHubGraphQLAdapter('test_token', 'https://ghe.your-company.com/api');

      mockGraphqlFn.mockResolvedValueOnce({
        user: {
          login: 'boheng-cao',
          id: '16',
          email: 'boheng.cao@company.com',
          avatarUrl: 'https://avatars.ghe.your-company.com/u/16',
          repositories: {
            nodes: [{ name: 'internal-tool', primaryLanguage: { name: 'Java' }, isFork: false }],
            pageInfo: { hasNextPage: false, endCursor: null },
            totalCount: 1,
          },
        },
        organization: null,
      });

      const result = await adapter.fetchRepositories('boheng-cao');

      expect(result.profile.avatarUrl).toBe('https://avatars.ghe.your-company.com/u/16');
      expect(result.profile.providerBaseUrl).toBe('https://ghe.your-company.com');
    });

    it('should default to https://github.com when avatarUrl is missing', async () => {
      const adapter = new GitHubGraphQLAdapter('test_token');

      mockGraphqlFn.mockResolvedValueOnce({
        user: {
          login: 'testuser',
          id: '999',
          email: 'test@example.com',
          // avatarUrl is missing
          repositories: {
            nodes: [{ name: 'repo1', primaryLanguage: { name: 'Python' }, isFork: false }],
            pageInfo: { hasNextPage: false, endCursor: null },
            totalCount: 1,
          },
        },
        organization: null,
      });

      const result = await adapter.fetchRepositories('testuser');

      expect(result.profile.avatarUrl).toBeUndefined();
      expect(result.profile.providerBaseUrl).toBe('https://github.com');
    });

    it('should extract providerBaseUrl for organization from GHE', async () => {
      const adapter = new GitHubGraphQLAdapter('test_token', 'https://ghe.company.com/api');

      mockGraphqlFn.mockResolvedValueOnce({
        user: null,
        organization: {
          login: 'engineering',
          id: '12345',
          isVerified: true,
          avatarUrl: 'https://avatars.ghe.company.com/u/12345?v=4',
          repositories: {
            nodes: [{ name: 'backend', primaryLanguage: { name: 'Go' }, isFork: false }],
            pageInfo: { hasNextPage: false, endCursor: null },
            totalCount: 1,
          },
        },
      });

      const result = await adapter.fetchRepositories('engineering');

      expect(result.profile.avatarUrl).toBe('https://avatars.ghe.company.com/u/12345?v=4');
      expect(result.profile.providerBaseUrl).toBe('https://ghe.company.com');
    });

    it('should include statistics for user with followers and following', async () => {
      const adapter = new GitHubGraphQLAdapter('test_token');

      mockGraphqlFn.mockResolvedValueOnce({
        user: {
          login: 'octocat',
          id: '583231',
          email: 'octocat@github.com',
          followers: {
            totalCount: 21841,
          },
          following: {
            totalCount: 9,
          },
          repositories: {
            nodes: [{ name: 'repo1', primaryLanguage: { name: 'JavaScript' }, isFork: false }],
            pageInfo: { hasNextPage: false, endCursor: null },
            totalCount: 1,
          },
        },
        organization: null,
      });

      const result = await adapter.fetchRepositories('octocat');

      expect(result.profile).toEqual({
        username: 'octocat',
        type: 'user',
        providerUserId: '583231',
        isVerified: true,
        providerBaseUrl: 'https://github.com',
        statistics: {
          followers: 21841,
          following: 9,
        },
      });
    });

    it('should not include statistics for user when followers and following are missing', async () => {
      const adapter = new GitHubGraphQLAdapter('test_token');

      mockGraphqlFn.mockResolvedValueOnce({
        user: {
          login: 'testuser',
          id: '123',
          email: 'test@example.com',
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
        isVerified: true,
        providerBaseUrl: 'https://github.com',
      });
      expect(result.profile.statistics).toBeUndefined();
    });

    it('should include only followers in statistics when following is missing', async () => {
      const adapter = new GitHubGraphQLAdapter('test_token');

      mockGraphqlFn.mockResolvedValueOnce({
        user: {
          login: 'testuser',
          id: '123',
          email: 'test@example.com',
          followers: {
            totalCount: 100,
          },
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
        isVerified: true,
        providerBaseUrl: 'https://github.com',
        statistics: {
          followers: 100,
        },
      });
    });

    it('should include only following in statistics when followers is missing', async () => {
      const adapter = new GitHubGraphQLAdapter('test_token');

      mockGraphqlFn.mockResolvedValueOnce({
        user: {
          login: 'testuser',
          id: '123',
          email: 'test@example.com',
          following: {
            totalCount: 50,
          },
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
        isVerified: true,
        providerBaseUrl: 'https://github.com',
        statistics: {
          following: 50,
        },
      });
    });

    it('should include statistics for organization with members', async () => {
      const adapter = new GitHubGraphQLAdapter('test_token');

      mockGraphqlFn.mockResolvedValueOnce({
        user: null,
        organization: {
          login: 'rakutentech',
          id: '1415441',
          isVerified: false,
          membersWithRole: {
            totalCount: 18,
          },
          repositories: {
            nodes: [{ name: 'repo1', primaryLanguage: { name: 'Go' }, isFork: false }],
            pageInfo: { hasNextPage: false, endCursor: null },
            totalCount: 1,
          },
        },
      });

      const result = await adapter.fetchRepositories('rakutentech');

      expect(result.profile).toEqual({
        username: 'rakutentech',
        type: 'organization',
        providerUserId: '1415441',
        isVerified: false,
        providerBaseUrl: 'https://github.com',
        statistics: {
          members: 18,
        },
      });
    });

    it('should not include statistics for organization when members is missing', async () => {
      const adapter = new GitHubGraphQLAdapter('test_token');

      mockGraphqlFn.mockResolvedValueOnce({
        user: null,
        organization: {
          login: 'testorg',
          id: '456',
          isVerified: true,
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
        isVerified: true,
        providerBaseUrl: 'https://github.com',
      });
      expect(result.profile.statistics).toBeUndefined();
    });

    it('should handle user with zero followers and following', async () => {
      const adapter = new GitHubGraphQLAdapter('test_token');

      mockGraphqlFn.mockResolvedValueOnce({
        user: {
          login: 'newuser',
          id: '999',
          email: 'new@example.com',
          followers: {
            totalCount: 0,
          },
          following: {
            totalCount: 0,
          },
          repositories: {
            nodes: [{ name: 'repo1', primaryLanguage: { name: 'JavaScript' }, isFork: false }],
            pageInfo: { hasNextPage: false, endCursor: null },
            totalCount: 1,
          },
        },
        organization: null,
      });

      const result = await adapter.fetchRepositories('newuser');

      expect(result.profile).toEqual({
        username: 'newuser',
        type: 'user',
        providerUserId: '999',
        isVerified: true,
        providerBaseUrl: 'https://github.com',
        statistics: {
          followers: 0,
          following: 0,
        },
      });
    });

    it('should handle organization with zero members', async () => {
      const adapter = new GitHubGraphQLAdapter('test_token');

      mockGraphqlFn.mockResolvedValueOnce({
        user: null,
        organization: {
          login: 'emptyorg',
          id: '888',
          isVerified: false,
          membersWithRole: {
            totalCount: 0,
          },
          repositories: {
            nodes: [{ name: 'repo1', primaryLanguage: { name: 'Go' }, isFork: false }],
            pageInfo: { hasNextPage: false, endCursor: null },
            totalCount: 1,
          },
        },
      });

      const result = await adapter.fetchRepositories('emptyorg');

      expect(result.profile).toEqual({
        username: 'emptyorg',
        type: 'organization',
        providerUserId: '888',
        isVerified: false,
        providerBaseUrl: 'https://github.com',
        statistics: {
          members: 0,
        },
      });
    });

    it('should include name field for user with valid name', async () => {
      const adapter = new GitHubGraphQLAdapter('test_token');

      mockGraphqlFn.mockResolvedValueOnce({
        user: {
          login: 'torvalds',
          name: 'Linus Torvalds',
          id: '1024',
          email: 'torvalds@linux.com',
          repositories: {
            nodes: [{ name: 'repo1', primaryLanguage: { name: 'C' }, isFork: false }],
            pageInfo: { hasNextPage: false, endCursor: null },
            totalCount: 1,
          },
        },
        organization: null,
      });

      const result = await adapter.fetchRepositories('torvalds');

      expect(result.profile.name).toBe('Linus Torvalds');
      expect(result.profile.username).toBe('torvalds');
    });

    it('should not include name field for user when name is null', async () => {
      const adapter = new GitHubGraphQLAdapter('test_token');

      mockGraphqlFn.mockResolvedValueOnce({
        user: {
          login: 'testuser',
          name: null,
          id: '123',
          email: 'test@example.com',
          repositories: {
            nodes: [{ name: 'repo1', primaryLanguage: { name: 'JavaScript' }, isFork: false }],
            pageInfo: { hasNextPage: false, endCursor: null },
            totalCount: 1,
          },
        },
        organization: null,
      });

      const result = await adapter.fetchRepositories('testuser');

      expect(result.profile).not.toHaveProperty('name');
      expect(result.profile.username).toBe('testuser');
    });

    it('should not include name field for user when name is undefined', async () => {
      const adapter = new GitHubGraphQLAdapter('test_token');

      mockGraphqlFn.mockResolvedValueOnce({
        user: {
          login: 'testuser',
          id: '123',
          email: 'test@example.com',
          repositories: {
            nodes: [{ name: 'repo1', primaryLanguage: { name: 'JavaScript' }, isFork: false }],
            pageInfo: { hasNextPage: false, endCursor: null },
            totalCount: 1,
          },
        },
        organization: null,
      });

      const result = await adapter.fetchRepositories('testuser');

      expect(result.profile).not.toHaveProperty('name');
      expect(result.profile.username).toBe('testuser');
    });

    it('should not include name field for user when name is empty string', async () => {
      const adapter = new GitHubGraphQLAdapter('test_token');

      mockGraphqlFn.mockResolvedValueOnce({
        user: {
          login: 'testuser',
          name: '',
          id: '123',
          email: 'test@example.com',
          repositories: {
            nodes: [{ name: 'repo1', primaryLanguage: { name: 'JavaScript' }, isFork: false }],
            pageInfo: { hasNextPage: false, endCursor: null },
            totalCount: 1,
          },
        },
        organization: null,
      });

      const result = await adapter.fetchRepositories('testuser');

      expect(result.profile).not.toHaveProperty('name');
      expect(result.profile.username).toBe('testuser');
    });

    it('should not include name field for user when name is whitespace-only', async () => {
      const adapter = new GitHubGraphQLAdapter('test_token');

      mockGraphqlFn.mockResolvedValueOnce({
        user: {
          login: 'testuser',
          name: '   ',
          id: '123',
          email: 'test@example.com',
          repositories: {
            nodes: [{ name: 'repo1', primaryLanguage: { name: 'JavaScript' }, isFork: false }],
            pageInfo: { hasNextPage: false, endCursor: null },
            totalCount: 1,
          },
        },
        organization: null,
      });

      const result = await adapter.fetchRepositories('testuser');

      expect(result.profile).not.toHaveProperty('name');
      expect(result.profile.username).toBe('testuser');
    });

    it('should include name field for organization with valid name', async () => {
      const adapter = new GitHubGraphQLAdapter('test_token');

      mockGraphqlFn.mockResolvedValueOnce({
        user: null,
        organization: {
          login: 'github',
          name: 'GitHub',
          id: '9919',
          isVerified: true,
          repositories: {
            nodes: [{ name: 'repo1', primaryLanguage: { name: 'Go' }, isFork: false }],
            pageInfo: { hasNextPage: false, endCursor: null },
            totalCount: 1,
          },
        },
      });

      const result = await adapter.fetchRepositories('github');

      expect(result.profile.name).toBe('GitHub');
      expect(result.profile.username).toBe('github');
    });

    it('should not include name field for organization when name is null', async () => {
      const adapter = new GitHubGraphQLAdapter('test_token');

      mockGraphqlFn.mockResolvedValueOnce({
        user: null,
        organization: {
          login: 'testorg',
          name: null,
          id: '456',
          isVerified: false,
          repositories: {
            nodes: [{ name: 'repo1', primaryLanguage: { name: 'Go' }, isFork: false }],
            pageInfo: { hasNextPage: false, endCursor: null },
            totalCount: 1,
          },
        },
      });

      const result = await adapter.fetchRepositories('testorg');

      expect(result.profile).not.toHaveProperty('name');
      expect(result.profile.username).toBe('testorg');
    });

    it('should not include name field for organization when name is empty string', async () => {
      const adapter = new GitHubGraphQLAdapter('test_token');

      mockGraphqlFn.mockResolvedValueOnce({
        user: null,
        organization: {
          login: 'testorg',
          name: '',
          id: '456',
          isVerified: false,
          repositories: {
            nodes: [{ name: 'repo1', primaryLanguage: { name: 'Go' }, isFork: false }],
            pageInfo: { hasNextPage: false, endCursor: null },
            totalCount: 1,
          },
        },
      });

      const result = await adapter.fetchRepositories('testorg');

      expect(result.profile).not.toHaveProperty('name');
      expect(result.profile.username).toBe('testorg');
    });

    it('should not include name field for organization when name is whitespace-only', async () => {
      const adapter = new GitHubGraphQLAdapter('test_token');

      mockGraphqlFn.mockResolvedValueOnce({
        user: null,
        organization: {
          login: 'testorg',
          name: '   ',
          id: '456',
          isVerified: false,
          repositories: {
            nodes: [{ name: 'repo1', primaryLanguage: { name: 'Go' }, isFork: false }],
            pageInfo: { hasNextPage: false, endCursor: null },
            totalCount: 1,
          },
        },
      });

      const result = await adapter.fetchRepositories('testorg');

      expect(result.profile).not.toHaveProperty('name');
      expect(result.profile.username).toBe('testorg');
    });
  });

  describe('Decision Matrix Tests', () => {
    describe('Scenario 1: No token + No URL → GitHub public API (low rate)', () => {
      it('should use default GitHub endpoint without authentication', async () => {
        const adapter = new GitHubGraphQLAdapter();

        mockGraphqlFn.mockResolvedValueOnce({
          user: {
            login: 'abc',
            id: '123',
            repositories: {
              nodes: [{ name: 'repo1', primaryLanguage: { name: 'JavaScript' }, isFork: false }],
              pageInfo: { hasNextPage: false, endCursor: null },
              totalCount: 1,
            },
          },
          organization: null,
        });

        const result = await adapter.fetchRepositories('abc');

        expect(result.profile.username).toBe('abc');
        expect(mockGraphql.defaults).not.toHaveBeenCalled();
      });
    });

    describe('Scenario 2: GitHub token + No URL → GitHub API (high rate)', () => {
      it('should use GitHub API with authentication', async () => {
        const githubToken = 'ghp_GitHubPersonalToken123';
        const adapter = new GitHubGraphQLAdapter(githubToken);

        mockGraphqlFn.mockResolvedValueOnce({
          user: {
            login: 'abc',
            id: '456',
            email: 'user@example.com',
            repositories: {
              nodes: [{ name: 'repo1', primaryLanguage: { name: 'TypeScript' }, isFork: false }],
              pageInfo: { hasNextPage: false, endCursor: null },
              totalCount: 1,
            },
          },
          organization: null,
        });

        const result = await adapter.fetchRepositories('abc');

        expect(result.profile.username).toBe('abc');
        expect(mockGraphql.defaults).toHaveBeenCalledWith({
          headers: {
            authorization: `token ${githubToken}`,
          },
        });
      });
    });

    describe('Scenario 3: GitHub token + GHE URL → Bad credentials', () => {
      it('should fail with bad credentials when using GitHub token with GHE endpoint', async () => {
        const githubToken = 'ghp_GitHubPersonalToken123';
        const gheURL = 'https://ghe.company.com/api';
        const adapter = new GitHubGraphQLAdapter(githubToken, gheURL);

        const error: any = new Error('Bad credentials');
        error.errors = [{ type: 'UNAUTHORIZED', message: 'Bad credentials' }];
        mockGraphqlFn.mockRejectedValue(error);

        await expect(adapter.fetchRepositories('boheng-cao')).rejects.toThrow(ProviderError);
      });
    });

    describe('Scenario 4: No token + GHE URL → GHE public API (low rate)', () => {
      it('should use GHE endpoint without authentication', async () => {
        const gheURL = 'https://ghe.your-company.com/api';
        const adapter = new GitHubGraphQLAdapter(undefined, gheURL);

        mockGraphqlFn.mockResolvedValueOnce({
          user: {
            login: 'boheng-cao',
            id: '789',
            repositories: {
              nodes: [{ name: 'ghe-repo', primaryLanguage: { name: 'Go' }, isFork: false }],
              pageInfo: { hasNextPage: false, endCursor: null },
              totalCount: 1,
            },
          },
          organization: null,
        });

        const result = await adapter.fetchRepositories('boheng-cao');

        expect(result.profile.username).toBe('boheng-cao');
        expect(mockGraphql.defaults).toHaveBeenCalledWith({
          baseUrl: gheURL,
        });
      });
    });

    describe('Scenario 5: GHE token + GHE URL → GHE API (high rate)', () => {
      it('should use GHE endpoint with authentication', async () => {
        const gheToken = 'ghp_GheEnterpriseToken456';
        const gheURL = 'https://ghe.your-company.com/api';
        const adapter = new GitHubGraphQLAdapter(gheToken, gheURL);

        mockGraphqlFn.mockResolvedValueOnce({
          user: {
            login: 'boheng-cao',
            id: '101112',
            email: 'boheng.cao@company.com',
            repositories: {
              nodes: [
                { name: 'enterprise-repo', primaryLanguage: { name: 'Java' }, isFork: false },
              ],
              pageInfo: { hasNextPage: false, endCursor: null },
              totalCount: 1,
            },
          },
          organization: null,
        });

        const result = await adapter.fetchRepositories('boheng-cao');

        expect(result.profile.username).toBe('boheng-cao');
        expect(result.profile.isVerified).toBe(true);
        expect(mockGraphql.defaults).toHaveBeenCalledTimes(2);
      });
    });

    describe('Scenario 6: GHE token + No URL → Bad credentials', () => {
      it('should fail with bad credentials when using GHE token with GitHub endpoint', async () => {
        const gheToken = 'ghp_GheEnterpriseToken456';
        const adapter = new GitHubGraphQLAdapter(gheToken);

        const error: any = new Error('Bad credentials');
        error.errors = [{ type: 'UNAUTHORIZED', message: 'Bad credentials' }];
        mockGraphqlFn.mockRejectedValue(error);

        await expect(adapter.fetchRepositories('abc')).rejects.toThrow(ProviderError);
      });
    });
  });
});
