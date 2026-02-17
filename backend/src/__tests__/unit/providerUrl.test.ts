/**
 * Tests for Provider URL Utilities
 */

import { extractProviderBaseUrl } from '../../shared/utils/providerUrl';

describe('extractProviderBaseUrl', () => {
  describe('GitHub.com cases', () => {
    it('should return https://github.com for standard GitHub avatar URL', () => {
      const avatarUrl = 'https://avatars.githubusercontent.com/u/698437?v=4';
      expect(extractProviderBaseUrl(avatarUrl)).toBe('https://github.com');
    });

    it('should return https://github.com for GitHub avatar URL without query params', () => {
      const avatarUrl = 'https://avatars.githubusercontent.com/u/16';
      expect(extractProviderBaseUrl(avatarUrl)).toBe('https://github.com');
    });

    it('should return https://github.com for GitHub avatar URL with different user ID', () => {
      const avatarUrl = 'https://avatars.githubusercontent.com/u/123456789?v=4';
      expect(extractProviderBaseUrl(avatarUrl)).toBe('https://github.com');
    });
  });

  describe('GitHub Enterprise (GHE) cases', () => {
    it('should extract provider base URL from GHE avatar URL', () => {
      const avatarUrl = 'https://avatars.ghe.your-company.com/u/16';
      expect(extractProviderBaseUrl(avatarUrl)).toBe('https://ghe.your-company.com');
    });

    it('should extract provider base URL from GHE avatar URL with query params', () => {
      const avatarUrl = 'https://avatars.ghe.company.com/u/123?v=4&size=large';
      expect(extractProviderBaseUrl(avatarUrl)).toBe('https://ghe.company.com');
    });

    it('should handle GHE with different subdomain patterns', () => {
      const avatarUrl = 'https://avatars.github.enterprise.org/u/456';
      expect(extractProviderBaseUrl(avatarUrl)).toBe('https://github.enterprise.org');
    });

    it('should handle GHE with simple two-part domain', () => {
      const avatarUrl = 'https://avatars.github.local/u/789';
      expect(extractProviderBaseUrl(avatarUrl)).toBe('https://github.local');
    });

    it('should handle GHE with http protocol', () => {
      const avatarUrl = 'http://avatars.ghe.internal.com/u/999';
      expect(extractProviderBaseUrl(avatarUrl)).toBe('http://ghe.internal.com');
    });
  });

  describe('Edge cases and fallbacks', () => {
    it('should return default URL for undefined avatar URL', () => {
      expect(extractProviderBaseUrl(undefined)).toBe('https://github.com');
    });

    it('should return default URL for empty string avatar URL', () => {
      expect(extractProviderBaseUrl('')).toBe('https://github.com');
    });

    it('should return default URL for whitespace-only avatar URL', () => {
      expect(extractProviderBaseUrl('   ')).toBe('https://github.com');
    });

    it('should return default URL for invalid URL format', () => {
      const invalidUrl = 'not-a-valid-url';
      expect(extractProviderBaseUrl(invalidUrl)).toBe('https://github.com');
    });

    it('should return default URL for malformed URL', () => {
      const malformedUrl = 'https://';
      expect(extractProviderBaseUrl(malformedUrl)).toBe('https://github.com');
    });

    it('should return default URL for URL without hostname', () => {
      const invalidUrl = '/u/123456';
      expect(extractProviderBaseUrl(invalidUrl)).toBe('https://github.com');
    });

    it('should return default URL for avatar URL without "avatars." prefix', () => {
      const nonAvatarUrl = 'https://github.com/u/123';
      expect(extractProviderBaseUrl(nonAvatarUrl)).toBe('https://github.com');
    });

    it('should return default URL for avatars URL with invalid pattern (single domain part)', () => {
      // avatars.localhost would become just "localhost" which is invalid
      const invalidPattern = 'https://avatars.localhost/u/123';
      expect(extractProviderBaseUrl(invalidPattern)).toBe('https://github.com');
    });

    it('should handle avatars URL with port number', () => {
      const urlWithPort = 'https://avatars.ghe.company.com:8443/u/123';
      expect(extractProviderBaseUrl(urlWithPort)).toBe('https://ghe.company.com:8443');
    });

    it('should handle avatars URL with authentication', () => {
      const urlWithAuth = 'https://user:pass@avatars.ghe.company.com/u/123';
      expect(extractProviderBaseUrl(urlWithAuth)).toBe('https://ghe.company.com');
    });

    it('should handle avatars URL with fragment', () => {
      const urlWithFragment = 'https://avatars.ghe.company.com/u/123#section';
      expect(extractProviderBaseUrl(urlWithFragment)).toBe('https://ghe.company.com');
    });
  });

  describe('Real-world examples', () => {
    it('should handle Airbnb organization avatar URL', () => {
      const avatarUrl = 'https://avatars.githubusercontent.com/u/698437?v=4';
      expect(extractProviderBaseUrl(avatarUrl)).toBe('https://github.com');
    });

    it('should handle Rakuten GHE avatar URL', () => {
      const avatarUrl = 'https://avatars.ghe.your-company.com/u/16';
      expect(extractProviderBaseUrl(avatarUrl)).toBe('https://ghe.your-company.com');
    });

    it('should handle enterprise with complex subdomain', () => {
      const avatarUrl = 'https://avatars.github.enterprise.company.co.uk/u/42';
      expect(extractProviderBaseUrl(avatarUrl)).toBe('https://github.enterprise.company.co.uk');
    });
  });
});
