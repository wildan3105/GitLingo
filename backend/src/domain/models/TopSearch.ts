/**
 * TopSearch - Domain Model
 * Represents a single entry in the top search leaderboard
 */

export interface TopSearch {
  /**
   * Normalized (lowercase) GitHub username or organization name
   */
  username: string;

  /**
   * Provider name (e.g., "github")
   */
  provider: string;

  /**
   * Number of times this account has been searched
   */
  hit: number;

  /**
   * Avatar URL of the account, or null if unavailable
   */
  avatarUrl: string | null;

  /**
   * Unix epoch timestamp (seconds) when this record was first created
   */
  createdAt: number;

  /**
   * Unix epoch timestamp (seconds) when this record was last updated
   */
  updatedAt: number;
}
