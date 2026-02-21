/**
 * ProviderPort - Domain Port
 * Interface for version control provider adapters (GitHub, GitLab, Bitbucket, etc.)
 * Implements Hexagonal Architecture / Ports & Adapters pattern
 */

import { Repository } from '../models/Repository';
import { Profile } from '../models/Profile';

export interface AccountData {
  /**
   * Account profile information
   */
  profile: Profile;

  /**
   * List of repositories
   */
  repositories: Repository[];
}

export interface ProviderPort {
  /**
   * Fetch all repositories and profile for a given username or organization
   * @param username - The username or organization name
   * @returns Promise resolving to account data (profile + repositories)
   * @throws ProviderError on failures (user not found, rate limit, network error, etc.)
   */
  fetchRepositories(username: string): Promise<AccountData>;

  /**
   * Get the provider name (e.g., "github", "gitlab", "bitbucket")
   * @returns Provider name as lowercase string
   */
  getProviderName(): string;
}
