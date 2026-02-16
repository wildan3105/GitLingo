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

      expect(result.series).toHaveLength(3);
      expect(result.series[0]).toMatchObject({
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

      const forksEntry = result.series.find((s) => s.key === '__forks__');
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

      const unknownEntry = result.series.find((s) => s.key === 'Unknown');
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

      expect(result.series[0]?.key).toBe('JavaScript');
      expect(result.series[0]?.value).toBe(3);
      expect(result.series[1]?.key).toBe('TypeScript');
      expect(result.series[1]?.value).toBe(2);
      expect(result.series[2]?.key).toBe('Python');
      expect(result.series[2]?.value).toBe(1);
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

      const jsEntry = result.series.find((s) => s.key === 'JavaScript');
      expect(jsEntry?.color).toBe('#f1e05a'); // GitHub Linguist color

      const pyEntry = result.series.find((s) => s.key === 'Python');
      expect(pyEntry?.color).toBe('#3572A5');

      const unknownEntry = result.series.find((s) => s.key === 'UnknownLanguage');
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
      expect(result.metadata.limit).toBe(1);
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
  });
});
