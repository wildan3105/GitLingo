/**
 * Repository - Domain Model
 * Represents a version control repository from any provider
 */

export interface Repository {
  /**
   * Repository name
   */
  name: string;

  /**
   * Primary programming language of the repository
   * null if no language detected
   */
  language: string | null;

  /**
   * Whether this repository is a fork
   */
  isFork: boolean;
}
