/**
 * SearchService - Application Service
 * Orchestrates the language statistics search use case
 */

import { ProviderPort } from '../../domain/ports/ProviderPort';
import { Repository } from '../../domain/models/Repository';
import { LanguageStatistic } from '../../domain/models/LanguageStatistic';
import { Profile } from '../../domain/models/Profile';
import { getLanguageColor, FORK_COLOR } from '../../shared/constants/languageColors';
import { ProviderError } from '../../infrastructure/errors/ProviderError';
import { SearchResult } from '../types/SearchResult';
import { SearchError } from '../types/SearchError';

export class SearchService {
  private readonly provider: ProviderPort;

  constructor(provider: ProviderPort) {
    this.provider = provider;
  }

  /**
   * Search language statistics for a given username
   */
  public async searchLanguageStatistics(username: string): Promise<SearchResult | SearchError> {
    try {
      // 1. Fetch repositories from provider
      const repositories = await this.provider.fetchRepositories(username);

      // 2. Extract profile information
      const profile = this.extractProfile(username, repositories);

      // 3. Aggregate and count repositories by language
      const series = this.aggregateLanguageStatistics(repositories);

      // 4. Return successful result
      return {
        ok: true,
        provider: this.provider.getProviderName(),
        profile,
        series,
        metadata: {
          generatedAt: new Date().toISOString(),
          unit: 'repos',
          limit: repositories.length,
        },
      };
    } catch (error) {
      // Transform provider errors to search errors
      return this.handleError(error, username);
    }
  }

  /**
   * Extract profile information from repositories or username
   */
  private extractProfile(username: string, _repositories: Repository[]): Profile {
    // For now, we'll create a basic profile
    // In a real implementation, we might fetch this from the provider
    return {
      username,
      type: 'user', // Default to user; could be enhanced to detect organization
      providerUserId: username, // Provider-specific ID would come from API
    };
  }

  /**
   * Aggregate repositories by language and create statistics
   */
  private aggregateLanguageStatistics(repositories: Repository[]): LanguageStatistic[] {
    const languageMap = new Map<string, number>();
    let forkCount = 0;

    // Count repositories by language
    for (const repo of repositories) {
      // Count forks separately
      if (repo.isFork) {
        forkCount++;
        continue;
      }

      // Categorize by language (or "Unknown" if null)
      const language = repo.language ?? 'Unknown';
      const currentCount = languageMap.get(language) ?? 0;
      languageMap.set(language, currentCount + 1);
    }

    // Convert to LanguageStatistic array
    const series: LanguageStatistic[] = [];

    // Add language statistics
    for (const [language, count] of languageMap.entries()) {
      series.push({
        key: language,
        label: language,
        value: count,
        color: getLanguageColor(language),
      });
    }

    // Add forks as a special category if there are any
    if (forkCount > 0) {
      series.push({
        key: '__forks__',
        label: 'Forked repos',
        value: forkCount,
        color: FORK_COLOR,
      });
    }

    // Sort by count descending
    return series.sort((a, b) => b.value - a.value);
  }

  /**
   * Handle errors and transform to SearchError
   */
  private handleError(error: unknown, username: string): SearchError {
    const providerName = this.provider.getProviderName();
    const generatedAt = new Date().toISOString();

    // Handle ProviderError
    if (error instanceof ProviderError) {
      return {
        ok: false,
        provider: providerName,
        error: {
          code: error.code.toLowerCase(),
          message: error.message,
          details: error.details ?? { username },
        },
        meta: {
          generatedAt,
        },
      };
    }

    // Handle unknown errors
    const err = error as Error;
    return {
      ok: false,
      provider: providerName,
      error: {
        code: 'unknown_error',
        message: err.message ?? 'An unexpected error occurred',
        details: { username },
      },
      meta: {
        generatedAt,
      },
    };
  }
}
