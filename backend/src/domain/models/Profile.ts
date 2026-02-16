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
}
