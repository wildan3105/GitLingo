/**
 * Validation utilities for search feature
 */

/**
 * Validation result type
 */
export type ValidationResult = {
  /** Whether the input is valid */
  isValid: boolean
  /** Error message if validation failed */
  error?: string
}

/** GitHub's enforced maximum username length. */
const GITHUB_USERNAME_MAX_LENGTH = 39

/**
 * GitHub username validation regex
 * Rules:
 * - Must start and end with alphanumeric character
 * - Can contain hyphens in the middle (including consecutive hyphens)
 * - Maximum 39 characters (GitHub's actual limit)
 */
const USERNAME_REGEX = /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/

/**
 * Validates a GitHub username against GitHub's username rules
 *
 * @param username - The username to validate
 * @returns ValidationResult with isValid flag and optional error message
 *
 * @example
 * ```typescript
 * validateUsername('octocat')
 * // Returns: { isValid: true }
 *
 * validateUsername('')
 * // Returns: { isValid: false, error: 'Username is required' }
 *
 * validateUsername('invalid user')
 * // Returns: { isValid: false, error: 'Username can only contain alphanumeric characters and hyphens' }
 * ```
 */
export function validateUsername(username: string): ValidationResult {
  // Check if username is empty
  if (!username || username.trim() === '') {
    return { isValid: false, error: 'Username is required' }
  }

  // Check minimum length (at least 1 character)
  if (username.length < 1) {
    return { isValid: false, error: 'Username is too short' }
  }

  // Check maximum length (GitHub's limit is 39 characters)
  if (username.length > GITHUB_USERNAME_MAX_LENGTH) {
    return { isValid: false, error: 'Username must be 39 characters or less' }
  }

  // Check format using regex
  if (!USERNAME_REGEX.test(username)) {
    return {
      isValid: false,
      error: 'Username can only contain alphanumeric characters and hyphens',
    }
  }

  // All validations passed
  return { isValid: true }
}
