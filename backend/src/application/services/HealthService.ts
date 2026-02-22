/**
 * HealthService
 * Application service that aggregates health status across infrastructure dependencies.
 */

import { HealthPort } from '../../domain/ports/HealthPort';

export interface ServiceHealthStatus {
  database: 'ok' | 'error';
  github?: 'ok' | 'error';
}

export interface HealthCheckResult {
  /** true when all services are healthy, false when any are not */
  ok: boolean;
  services: ServiceHealthStatus;
}

export class HealthService {
  private readonly healthPort: HealthPort;
  private readonly providerPort: HealthPort | undefined;

  /**
   * @param healthPort   - Adapter for local infrastructure (e.g. SQLite)
   * @param providerPort - Optional adapter for upstream provider (e.g. GitHub).
   *                       Must implement checkProvider() to be useful here.
   */
  constructor(healthPort: HealthPort, providerPort?: HealthPort) {
    this.healthPort = healthPort;
    this.providerPort = providerPort;
  }

  async check(): Promise<HealthCheckResult> {
    const services: ServiceHealthStatus = {
      database: this.healthPort.ping() ? 'ok' : 'error',
    };

    if (typeof this.providerPort?.checkProvider === 'function') {
      services.github = await this.providerPort.checkProvider();
    }

    const allHealthy = (Object.values(services) as string[]).every((s) => s === 'ok');

    return { ok: allHealthy, services };
  }
}
