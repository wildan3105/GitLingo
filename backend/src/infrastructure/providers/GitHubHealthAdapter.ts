/**
 * GitHubHealthAdapter
 * Checks reachability of the GitHub API (or a GitHub Enterprise Server)
 * by issuing a HEAD request with a bounded timeout.
 *
 * Implements HealthPort.checkProvider() — never throws.
 * ping() is a required HealthPort method but not meaningful here; it always
 * returns true since async reachability is exposed via checkProvider().
 */

import { HealthPort } from '../../domain/ports/HealthPort';

const GITHUB_API_BASE = 'https://api.github.com';
const TIMEOUT_MS = 3000;

/**
 * Derive the API base URL from an optional GraphQL endpoint URL.
 * Falls back to standard GitHub API if the URL is absent or unparseable.
 */
function resolveBaseUrl(graphqlURL: string | undefined): string {
  if (graphqlURL === undefined || graphqlURL.trim() === '') return GITHUB_API_BASE;
  try {
    const { protocol, hostname, port } = new URL(graphqlURL);
    return `${protocol}//${hostname}${port ? `:${port}` : ''}`;
  } catch {
    return GITHUB_API_BASE;
  }
}

export class GitHubHealthAdapter implements HealthPort {
  private readonly baseUrl: string;

  constructor(graphqlURL?: string) {
    this.baseUrl = resolveBaseUrl(graphqlURL);
  }

  /**
   * Not used for remote connectivity — see checkProvider().
   * Required by HealthPort; always returns true.
   */
  ping(): boolean {
    return true;
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
