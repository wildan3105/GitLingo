/**
 * HealthPort
 * Domain contract for checking liveness of infrastructure dependencies.
 */

export interface HealthPort {
  /**
   * Returns true if the underlying dependency is reachable, false otherwise.
   * Implementations must never throw.
   */
  ping(): boolean;

  /**
   * Asynchronously checks whether an upstream provider is reachable.
   * Optional — only adapters that support remote connectivity need implement this.
   * Implementations must never throw; return 'error' on any failure.
   */
  checkProvider?(): Promise<'ok' | 'error'>;
}
