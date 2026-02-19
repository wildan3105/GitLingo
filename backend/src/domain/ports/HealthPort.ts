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
}
