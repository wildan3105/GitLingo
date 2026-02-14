/**
 * ProviderPort - Domain Port
 * Interface for version control provider adapters (GitHub, GitLab, Bitbucket, etc.)
 * Implements Hexagonal Architecture / Ports & Adapters pattern
 */

import { Repository } from '../models/Repository';

export interface ProviderPort {
  /**
   * Fetch all repositories for a given username or organization
   * @param username - The username or organization name
   * @returns Promise resolving to array of repositories
   * @throws ProviderError on failures (user not found, rate limit, network error, etc.)
   */
  fetchRepositories(username: string): Promise<Repository[]>;

  /**
   * Get the provider name (e.g., "github", "gitlab", "bitbucket")
   * @returns Provider name as lowercase string
   */
  getProviderName(): string;
}
