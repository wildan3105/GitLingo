/**
 * GitHubHealthAdapter
 * Checks reachability of the GitHub API (or a GitHub Enterprise Server)
 * by issuing a HEAD request with a bounded timeout.
 *
 * Implements ProviderHealthPort — never throws.
 */

import { ProviderHealthPort } from '../../domain/ports/ProviderHealthPort';
import { deriveProviderBaseUrl } from '../../shared/utils/providerUrl';

// deriveProviderBaseUrl defaults to https://github.com (the git host) when no URL is given.
// For health checks we want to ping the API endpoint directly.
const GITHUB_API_BASE = 'https://api.github.com';
const GITHUB_COM_BASE = 'https://github.com';
const TIMEOUT_MS = 3000;

export class GitHubHealthAdapter implements ProviderHealthPort {
  private readonly baseUrl: string;

  constructor(graphqlURL?: string) {
    const derived = deriveProviderBaseUrl(graphqlURL);
    // Map the github.com default → api.github.com; GHE URLs pass through unchanged.
    this.baseUrl = derived === GITHUB_COM_BASE ? GITHUB_API_BASE : derived;
  }

  /**
   * HEAD-pings the GitHub API base URL with a 3-second timeout.
   * Any HTTP response (including 401/403) means the server is reachable → 'ok'.
   * Network failure or timeout → 'error'.
   */
  async checkProvider(): Promise<'ok' | 'error'> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      await fetch(this.baseUrl, { method: 'HEAD', signal: controller.signal });
      return 'ok';
    } catch {
      return 'error';
    } finally {
      clearTimeout(timeout);
    }
  }
}
