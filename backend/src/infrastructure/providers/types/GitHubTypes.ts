/**
 * GitHubTypes - Infrastructure Types
 * GitHub GraphQL API response types
 * These types are GitHub-specific and should not leak to domain layer
 */

/**
 * GitHub language information
 */
export interface GitHubLanguage {
  name: string;
  color?: string;
}

/**
 * GitHub repository from GraphQL API
 */
export interface GitHubRepository {
  name: string;
  primaryLanguage: GitHubLanguage | null;
  isFork: boolean;
}

/**
 * Pagination info for cursor-based pagination
 */
export interface GitHubPageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}

/**
 * Repository connection with pagination
 */
export interface GitHubRepositoryConnection {
  nodes: GitHubRepository[];
  pageInfo: GitHubPageInfo;
  totalCount: number;
}

/**
 * GitHub user or organization
 */
export interface GitHubUser {
  login: string;
  id: string;
  avatarUrl: string;
  repositories: GitHubRepositoryConnection;
}

/**
 * GraphQL query response for user repositories
 */
export interface GitHubUserQueryResponse {
  user: GitHubUser | null;
  organization: GitHubUser | null;
}

/**
 * GitHub rate limit info
 */
export interface GitHubRateLimit {
  limit: number;
  remaining: number;
  resetAt: string;
}

/**
 * GitHub GraphQL error
 */
export interface GitHubGraphQLError {
  type?: string;
  message: string;
  path?: string[];
  locations?: Array<{ line: number; column: number }>;
}
