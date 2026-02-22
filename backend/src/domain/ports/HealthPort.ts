/**
 * HealthPort
 * Domain contract for checking liveness of local infrastructure dependencies.
 * Implemented by adapters that wrap synchronous, in-process checks (e.g. SQLite).
 */

export interface HealthPort {
  /**
   * Returns true if the underlying dependency is reachable, false otherwise.
   * Implementations must never throw.
   */
  ping(): boolean;
}
