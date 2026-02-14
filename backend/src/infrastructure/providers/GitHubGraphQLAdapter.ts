/**
 * GitHubGraphQLAdapter - Infrastructure Provider Implementation
 * Implements ProviderPort for GitHub using GraphQL API
 */

import { graphql } from '@octokit/graphql';
import { Repository } from '../../domain/models/Repository';
import { Profile } from '../../domain/models/Profile';
import { ProviderPort, AccountData } from '../../domain/ports/ProviderPort';
import { ProviderError } from '../errors/ProviderError';
import { GitHubUserQueryResponse, GitHubRepository } from './types/GitHubTypes';

export class GitHubGraphQLAdapter implements ProviderPort {
  private readonly graphqlClient: typeof graphql;

  constructor(token?: string) {
    this.graphqlClient =
      typeof token === 'string' && token.length > 0
        ? graphql.defaults({
            headers: {
              authorization: `token ${token}`,
            },
          })
        : graphql;
  }

  /**
   * Fetch all repositories and profile for a GitHub user or organization
   */
  public async fetchRepositories(username: string): Promise<AccountData> {
    try {
      const allRepos: GitHubRepository[] = [];
      let hasNextPage = true;
      let cursor: string | null = null;
      let accountProfile: Profile | null = null;

      // Paginate through all repositories
      while (hasNextPage) {
        const response = await this.fetchRepositoriesPage(username, cursor);

        // Check if user/org exists
        if (!response.user && !response.organization) {
          throw new ProviderError({
            code: 'USER_NOT_FOUND',
            message: `GitHub user or organization '${username}' not found`,
            details: { username },
          });
        }

        const account = response.user ?? response.organization;
        if (!account) {
          throw new ProviderError({
            code: 'PROVIDER_ERROR',
            message: 'Unexpected response format from GitHub',
          });
        }

        // Extract profile on first page
        if (!accountProfile) {
          accountProfile = {
            username: account.login,
            type: response.user ? 'user' : 'organization',
            providerUserId: account.id,
          };
        }

        const { nodes, pageInfo } = account.repositories;

        allRepos.push(...nodes);
        hasNextPage = pageInfo.hasNextPage;
        cursor = pageInfo.endCursor;
      }

      // Map GitHub repositories to domain models
      return {
        profile: accountProfile!,
        repositories: this.mapToDomainRepositories(allRepos),
      };
    } catch (error) {
      // Already a ProviderError, re-throw
      if (error instanceof ProviderError) {
        throw error;
      }

      // Handle GitHub-specific errors
      throw this.handleGraphQLError(error, username);
    }
  }

  /**
   * Get provider name
   */
  public getProviderName(): string {
    return 'github';
  }

  /**
   * Fetch a single page of repositories
   */
  private async fetchRepositoriesPage(
    username: string,
    cursor: string | null
  ): Promise<GitHubUserQueryResponse> {
    const query = `
      query($username: String!, $cursor: String) {
        user(login: $username) {
          login
          id
          repositories(first: 100, after: $cursor, ownerAffiliations: OWNER) {
            nodes {
              name
              primaryLanguage {
                name
              }
              isFork
            }
            pageInfo {
              hasNextPage
              endCursor
            }
            totalCount
          }
        }
        organization(login: $username) {
          login
          id
          repositories(first: 100, after: $cursor) {
            nodes {
              name
              primaryLanguage {
                name
              }
              isFork
            }
            pageInfo {
              hasNextPage
              endCursor
            }
            totalCount
          }
        }
      }
    `;

    try {
      return await this.graphqlClient<GitHubUserQueryResponse>(query, {
        username,
        cursor,
      });
    } catch (error) {
      // Handle partial errors: if we got data for user OR org, use it
      // GitHub returns errors when one of the queries fails (e.g., user exists but not org)
      const graphqlError = error as {
        errors?: Array<{ message: string }>;
        data?: GitHubUserQueryResponse;
      };

      // If we have data (either user or org), return it despite errors
      if (graphqlError.data !== null && typeof graphqlError.data === 'object') {
        const hasUserData =
          graphqlError.data.user !== null && typeof graphqlError.data.user === 'object';
        const hasOrgData =
          graphqlError.data.organization !== null &&
          typeof graphqlError.data.organization === 'object';

        if (hasUserData || hasOrgData) {
          return graphqlError.data;
        }
      }

      // No usable data, re-throw the error
      throw error;
    }
  }

  /**
   * Map GitHub repositories to domain models
   */
  private mapToDomainRepositories(githubRepos: GitHubRepository[]): Repository[] {
    return githubRepos.map((repo) => ({
      name: repo.name,
      language: repo.primaryLanguage?.name ?? null,
      isFork: repo.isFork,
    }));
  }

  /**
   * Handle GraphQL errors and convert to ProviderError
   */
  private handleGraphQLError(error: unknown, username: string): ProviderError {
    const err = error as Error & {
      errors?: Array<{ type?: string; message: string }>;
      status?: number;
    };

    // Check for GraphQL errors array with type field (structured errors)
    if (err.errors && Array.isArray(err.errors)) {
      // User not found: Check if all errors are NOT_FOUND type
      const allNotFound = err.errors.every((e) => e.type === 'NOT_FOUND');
      if (allNotFound && err.errors.length > 0) {
        return new ProviderError({
          code: 'USER_NOT_FOUND',
          message: `GitHub user or organization '${username}' not found`,
          details: { username },
          cause: err,
        });
      }

      // Rate limiting: Check for RATE_LIMITED type
      const hasRateLimit = err.errors.some(
        (e) => e.type === 'RATE_LIMITED' || e.message?.toLowerCase().includes('rate limit')
      );
      if (hasRateLimit) {
        return new ProviderError({
          code: 'RATE_LIMITED',
          message: 'GitHub API rate limit exceeded',
          retryAfter: 60,
          details: { username },
          cause: err,
        });
      }
    }

    // Fallback: HTTP status-based detection
    if (err.status === 403 || err.message?.toLowerCase().includes('rate limit')) {
      return new ProviderError({
        code: 'RATE_LIMITED',
        message: 'GitHub API rate limit exceeded',
        retryAfter: 60,
        details: { username },
        cause: err,
      });
    }

    if (err.status === 404) {
      return new ProviderError({
        code: 'USER_NOT_FOUND',
        message: `GitHub user or organization '${username}' not found`,
        details: { username },
        cause: err,
      });
    }

    // Network errors
    if (
      err.message?.toLowerCase().includes('network') ||
      err.message?.toLowerCase().includes('timeout') ||
      err.message?.toLowerCase().includes('econnrefused')
    ) {
      return new ProviderError({
        code: 'NETWORK_ERROR',
        message: 'Network error while connecting to GitHub API',
        details: { username },
        cause: err,
      });
    }

    // Generic provider error
    return new ProviderError({
      code: 'PROVIDER_ERROR',
      message: err.message ?? 'Unknown error occurred while fetching from GitHub',
      details: { username },
      cause: err,
    });
  }
}
