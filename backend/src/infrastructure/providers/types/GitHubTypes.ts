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
 * Connection with total count
 */
export interface GitHubTotalCountConnection {
  totalCount: number;
}

/**
 * GitHub user or organization
 */
export interface GitHubUser {
  login: string;
  name?: string | null; // Display name (can be null or empty)
  id: string;
  avatarUrl: string;
  location?: string;
  websiteUrl?: string;
  email?: string; // Only for users
  isVerified?: boolean; // Only for organizations
  createdAt?: string; // ISO 8601 timestamp
  repositories: GitHubRepositoryConnection;
  followers?: GitHubTotalCountConnection; // Only for users
  following?: GitHubTotalCountConnection; // Only for users
  membersWithRole?: GitHubTotalCountConnection; // Only for organizations
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
