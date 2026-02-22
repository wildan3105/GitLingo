/**
 * ProviderHealthPort
 * Domain contract for checking reachability of an upstream provider (e.g. GitHub API).
 * Implemented by adapters that perform async, network-based checks.
 */

export interface ProviderHealthPort {
  /**
   * Asynchronously checks whether the upstream provider is reachable.
   * Returns 'ok' when the provider responds (any HTTP status counts as reachable).
   * Returns 'error' on network failure or timeout.
   * Implementations must never throw.
   */
  checkProvider(): Promise<'ok' | 'error'>;
}
