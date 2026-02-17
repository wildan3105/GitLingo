/**
 * Profile - Domain Model
 * Represents a user or organization profile from a VCS provider
 */

export interface Profile {
  /**
   * Username or organization name
   */
  username: string;

  /**
   * Optional display name for the profile
   * Can be null or empty string from provider
   */
  name?: string;

  /**
   * Account type
   */
  type: 'user' | 'organization';

  /**
   * Provider-specific user ID
   */
  providerUserId: string;

  /**
   * Optional avatar URL for the profile
   */
  avatarUrl?: string;

  /**
   * Optional website URL for the profile
   */
  websiteUrl?: string;

  /**
   * Optional location for the profile
   */
  location?: string;

  /**
   * Verification status
   * - For users: true if email exists (truthy value)
   * - For organizations: based on GitHub's isVerified field
   */
  isVerified: boolean;

  /**
   * Account creation timestamp from provider
   * ISO 8601 format string (as-is from provider)
   */
  createdAt?: string;

  /**
   * Provider base URL (e.g., 'https://github.com' or 'https://ghe.company.com')
   * Derived from avatarUrl to support "Open Github" button in frontend
   */
  providerBaseUrl?: string;

  /**
   * Optional statistics based on account type
   * - For users: followers and following counts
   * - For organizations: members count
   */
  statistics?:
    | {
        followers?: number;
        following?: number;
      }
    | {
        members?: number;
      };
}
