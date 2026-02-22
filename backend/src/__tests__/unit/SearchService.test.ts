/**
 * SearchService Unit Tests
 */

import { SearchService } from '../../application/services/SearchService';
import { ProviderPort, AccountData } from '../../domain/ports/ProviderPort';
import { Repository } from '../../domain/models/Repository';
import { ProviderError } from '../../infrastructure/errors/ProviderError';

// Mock provider
class MockProvider implements ProviderPort {
  constructor(private mockRepos: Repository[] = []) {}

  async fetchRepositories(username: string): Promise<AccountData> {
    return {
      profile: {
        username,
        type: 'user',
        providerUserId: 'mock-id-123',
        isVerified: true,
      },
      repositories: this.mockRepos,
    };
  }

  getProviderName(): string {
    return 'mock-provider';
  }
}

describe('SearchService', () => {
  describe('searchLanguageStatistics', () => {
    it('should aggregate repositories by language correctly', async () => {
      const mockRepos: Repository[] = [
        { name: 'repo1', language: 'JavaScript', isFork: false },
        { name: 'repo2', language: 'JavaScript', isFork: false },
        { name: 'repo3', language: 'Python', isFork: false },
        { name: 'repo4', language: 'TypeScript', isFork: false },
      ];

      const provider = new MockProvider(mockRepos);
      const service = new SearchService(provider);

      const result = await service.searchLanguageStatistics('testuser');

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.data).toHaveLength(3);
      expect(result.data[0]).toMatchObject({
        key: 'JavaScript',
        label: 'JavaScript',
        value: 2,
      });
    });

    it('should categorize forks separately', async () => {
      const mockRepos: Repository[] = [
        { name: 'repo1', language: 'JavaScript', isFork: false },
        { name: 'fork1', language: 'JavaScript', isFork: true },
        { name: 'fork2', language: 'Python', isFork: true },
      ];

      const provider = new MockProvider(mockRepos);
      const service = new SearchService(provider);

      const result = await service.searchLanguageStatistics('testuser');

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      const forksEntry = result.data.find((s) => s.key === '__forks__');
      expect(forksEntry).toBeDefined();
      expect(forksEntry?.value).toBe(2);
      expect(forksEntry?.label).toBe('Forked repos');
      expect(forksEntry?.color).toBe('#ededed');
    });

    it('should handle repos without language as "Unknown"', async () => {
      const mockRepos: Repository[] = [
        { name: 'repo1', language: null, isFork: false },
        { name: 'repo2', language: null, isFork: false },
        { name: 'repo3', language: 'JavaScript', isFork: false },
      ];

      const provider = new MockProvider(mockRepos);
      const service = new SearchService(provider);

      const result = await service.searchLanguageStatistics('testuser');

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      const unknownEntry = result.data.find((s) => s.key === 'Unknown');
      expect(unknownEntry).toBeDefined();
      expect(unknownEntry?.value).toBe(2);
    });

    it('should sort results by count descending', async () => {
      const mockRepos: Repository[] = [
        { name: 'repo1', language: 'Python', isFork: false },
        { name: 'repo2', language: 'JavaScript', isFork: false },
        { name: 'repo3', language: 'JavaScript', isFork: false },
        { name: 'repo4', language: 'JavaScript', isFork: false },
        { name: 'repo5', language: 'TypeScript', isFork: false },
        { name: 'repo6', language: 'TypeScript', isFork: false },
      ];

      const provider = new MockProvider(mockRepos);
      const service = new SearchService(provider);

      const result = await service.searchLanguageStatistics('testuser');

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.data[0]?.key).toBe('JavaScript');
      expect(result.data[0]?.value).toBe(3);
      expect(result.data[1]?.key).toBe('TypeScript');
      expect(result.data[1]?.value).toBe(2);
      expect(result.data[2]?.key).toBe('Python');
      expect(result.data[2]?.value).toBe(1);
    });

    it('should apply correct language colors', async () => {
      const mockRepos: Repository[] = [
        { name: 'repo1', language: 'JavaScript', isFork: false },
        { name: 'repo2', language: 'Python', isFork: false },
        { name: 'repo3', language: 'UnknownLanguage', isFork: false },
      ];

      const provider = new MockProvider(mockRepos);
      const service = new SearchService(provider);

      const result = await service.searchLanguageStatistics('testuser');

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      const jsEntry = result.data.find((s) => s.key === 'JavaScript');
      expect(jsEntry?.color).toBe('#f1e05a'); // GitHub Linguist color

      const pyEntry = result.data.find((s) => s.key === 'Python');
      expect(pyEntry?.color).toBe('#3572A5');

      const unknownEntry = result.data.find((s) => s.key === 'UnknownLanguage');
      expect(unknownEntry?.color).toBe('#cccccc'); // Default color
    });

    it('should include metadata in response', async () => {
      const mockRepos: Repository[] = [{ name: 'repo1', language: 'JavaScript', isFork: false }];

      const provider = new MockProvider(mockRepos);
      const service = new SearchService(provider);

      const result = await service.searchLanguageStatistics('testuser');

      expect(result.ok).toBe(true);
      if (!result.ok) return;

      expect(result.metadata).toBeDefined();
      expect(result.metadata.unit).toBe('repos');
      expect(result.metadata.generatedAt).toBeDefined();
      expect(new Date(result.metadata.generatedAt).getTime()).toBeGreaterThan(0);
    });

    it('should transform ProviderError to SearchError', async () => {
      class FailingProvider implements ProviderPort {
        async fetchRepositories(_username: string): Promise<AccountData> {
          throw new ProviderError({
            code: 'USER_NOT_FOUND',
            message: 'User not found',
            details: { username: 'testuser' },
          });
        }

        getProviderName(): string {
          return 'failing-provider';
        }
      }

      const provider = new FailingProvider();
      const service = new SearchService(provider);

      const result = await service.searchLanguageStatistics('testuser');

      expect(result.ok).toBe(false);
      if (result.ok) return;

      expect(result.error.code).toBe('user_not_found');
      expect(result.error.message).toBe('User not found');
      expect(result.provider).toBe('failing-provider');
    });

    it('should not include actualError in details when ProviderError has no cause', async () => {
      class FailingProvider implements ProviderPort {
        async fetchRepositories(_username: string): Promise<AccountData> {
          throw new ProviderError({
            code: 'USER_NOT_FOUND',
            message: 'User not found',
            details: { username: 'testuser' },
          });
        }

        getProviderName(): string {
          return 'failing-provider';
        }
      }

      const provider = new FailingProvider();
      const service = new SearchService(provider);

      const result = await service.searchLanguageStatistics('testuser');

      expect(result.ok).toBe(false);
      if (result.ok) return;

      expect(result.error.details).not.toHaveProperty('actualError');
      expect(result.error.details).toMatchObject({ username: 'testuser' });
    });

    it('should include actualError with message and status when cause has HTTP error', async () => {
      class FailingProvider implements ProviderPort {
        async fetchRepositories(_username: string): Promise<AccountData> {
          const cause = Object.assign(new Error('Bad credentials'), { status: 401 });
          throw new ProviderError({
            code: 'PROVIDER_ERROR',
            message: 'The provided token is invalid.',
            details: { username: 'testuser' },
            cause,
          });
        }

        getProviderName(): string {
          return 'failing-provider';
        }
      }

      const provider = new FailingProvider();
      const service = new SearchService(provider);

      const result = await service.searchLanguageStatistics('testuser');

      expect(result.ok).toBe(false);
      if (result.ok) return;

      expect(result.error.details).toMatchObject({
        username: 'testuser',
        actualError: {
          message: 'Bad credentials',
          status: 401,
        },
      });
      expect(
        (result.error.details?.actualError as Record<string, unknown>)?.errors
      ).toBeUndefined();
    });

    it('should include actualError with message and errors when cause has GraphQL errors', async () => {
      class FailingProvider implements ProviderPort {
        async fetchRepositories(_username: string): Promise<AccountData> {
          const cause = Object.assign(new Error('GraphQL error'), {
            errors: [{ type: 'INSUFFICIENT_SCOPES', message: 'Token lacks required scopes.' }],
          });
          throw new ProviderError({
            code: 'PROVIDER_ERROR',
            message: 'The provided token does not have the required permissions.',
            details: { username: 'testuser' },
            cause,
          });
        }

        getProviderName(): string {
          return 'failing-provider';
        }
      }

      const provider = new FailingProvider();
      const service = new SearchService(provider);

      const result = await service.searchLanguageStatistics('testuser');

      expect(result.ok).toBe(false);
      if (result.ok) return;

      expect(result.error.details).toMatchObject({
        username: 'testuser',
        actualError: {
          message: 'GraphQL error',
          errors: [{ type: 'INSUFFICIENT_SCOPES', message: 'Token lacks required scopes.' }],
        },
      });
      expect(
        (result.error.details?.actualError as Record<string, unknown>)?.status
      ).toBeUndefined();
    });

    it('should include actualError with only message when cause has no errors or status', async () => {
      class FailingProvider implements ProviderPort {
        async fetchRepositories(_username: string): Promise<AccountData> {
          const cause = new Error('Network connection refused');
          throw new ProviderError({
            code: 'NETWORK_ERROR',
            message: 'Network error while connecting to GitHub API',
            details: { username: 'testuser' },
            cause,
          });
        }

        getProviderName(): string {
          return 'failing-provider';
        }
      }

      const provider = new FailingProvider();
      const service = new SearchService(provider);

      const result = await service.searchLanguageStatistics('testuser');

      expect(result.ok).toBe(false);
      if (result.ok) return;

      expect(result.error.details).toMatchObject({
        username: 'testuser',
        actualError: {
          message: 'Network connection refused',
        },
      });
      expect(
        (result.error.details?.actualError as Record<string, unknown>)?.errors
      ).toBeUndefined();
      expect(
        (result.error.details?.actualError as Record<string, unknown>)?.status
      ).toBeUndefined();
    });
  });

  describe('concurrency cap', () => {
    class SlowProvider implements ProviderPort {
      private resolve!: () => void;
      readonly promise: Promise<void> = new Promise((r) => {
        this.resolve = r;
      });

      async fetchRepositories(username: string): Promise<AccountData> {
        await this.promise;
        return {
          profile: { username, type: 'user', providerUserId: 'id', isVerified: false },
          repositories: [],
        };
      }

      getProviderName(): string {
        return 'slow-provider';
      }

      unblock(): void {
        this.resolve();
      }
    }

    it('should reject when active requests reach the concurrency limit', async () => {
      const provider = new SlowProvider();
      const service = new SearchService(provider, 2);

      // Start 2 requests — fills the cap
      const p1 = service.searchLanguageStatistics('user1');
      const p2 = service.searchLanguageStatistics('user2');

      // 3rd request should be rejected immediately
      const result = await service.searchLanguageStatistics('user3');

      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.error.code).toBe('rate_limited');
      expect(result.error.message).toMatch(/too many concurrent/i);

      provider.unblock();
      await Promise.all([p1, p2]);
    });

    it('should allow new requests after in-flight ones complete', async () => {
      const provider = new SlowProvider();
      const service = new SearchService(provider, 1);

      // Fill the cap
      const p1 = service.searchLanguageStatistics('user1');

      // Rejected while cap is full
      const rejected = await service.searchLanguageStatistics('user2');
      expect(rejected.ok).toBe(false);

      // Drain the cap
      provider.unblock();
      await p1;

      // Now a new request should succeed
      const next = await service.searchLanguageStatistics('user3');
      expect(next.ok).toBe(true);
    });

    it('should release the slot even when the provider throws', async () => {
      class ThrowingProvider implements ProviderPort {
        async fetchRepositories(): Promise<AccountData> {
          throw new Error('Provider exploded');
        }
        getProviderName(): string {
          return 'throwing-provider';
        }
      }

      const service = new SearchService(new ThrowingProvider(), 1);

      // First call fails but slot must be released
      const first = await service.searchLanguageStatistics('user1');
      expect(first.ok).toBe(false);

      // Second call should not be rejected by the concurrency cap
      const second = await service.searchLanguageStatistics('user2');
      expect(second.ok).toBe(false);
      if (second.ok) return;
      // Should be an unknown_error, not rate_limited
      expect(second.error.code).not.toBe('rate_limited');
    });

    it('should use a default concurrency limit of 20', async () => {
      const provider = new SlowProvider();
      const service = new SearchService(provider); // default limit

      // Start 20 requests — should all be accepted
      const requests = Array.from({ length: 20 }, (_, i) =>
        service.searchLanguageStatistics(`user${i}`)
      );

      // 21st should be rejected
      const rejected = await service.searchLanguageStatistics('user20');
      expect(rejected.ok).toBe(false);
      if (rejected.ok) return;
      expect(rejected.error.code).toBe('rate_limited');

      provider.unblock();
      await Promise.all(requests);
    });
  });
});
