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
}
