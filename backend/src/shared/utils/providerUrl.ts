/**
 * Provider URL Utilities
 * Functions to extract and derive provider URLs from various sources
 */

/**
 * Extract provider base URL from avatar URL
 *
 * @param avatarUrl - The avatar URL from the provider API
 * @returns The base URL of the provider (e.g., 'https://github.com' or 'https://ghe.company.com')
 *
 * @example
 * extractProviderBaseUrl('https://avatars.githubusercontent.com/u/698437?v=4')
 * // Returns: 'https://github.com'
 *
 * @example
 * extractProviderBaseUrl('https://avatars.ghe.your-company.com/u/16')
 * // Returns: 'https://ghe.your-company.com'
 */
export function extractProviderBaseUrl(avatarUrl: string | undefined): string {
  const DEFAULT_BASE_URL = 'https://github.com';

  // Return default if no avatar URL provided
  if (avatarUrl === undefined || avatarUrl.trim() === '') {
    return DEFAULT_BASE_URL;
  }

  try {
    const url = new URL(avatarUrl);
    const hostname = url.hostname;

    // GitHub.com case: avatars.githubusercontent.com
    if (hostname === 'avatars.githubusercontent.com') {
      return DEFAULT_BASE_URL;
    }

    // GHE case: avatars.{subdomain}.{domain} → {subdomain}.{domain}
    // Pattern: avatars.ghe.company.com → ghe.company.com
    if (hostname.startsWith('avatars.')) {
      const providerHostname = hostname.replace(/^avatars\./, '');

      // Validate that we have a valid hostname after removal
      if (providerHostname && providerHostname.includes('.')) {
        // Include port if present
        const port = url.port ? `:${url.port}` : '';
        return `${url.protocol}//${providerHostname}${port}`;
      }
    }

    // Fallback: return default if we can't determine the pattern
    return DEFAULT_BASE_URL;
  } catch {
    // Invalid URL format, return default
    return DEFAULT_BASE_URL;
  }
}
