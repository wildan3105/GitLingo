/**
 * HealthService
 * Application service that aggregates health status across infrastructure dependencies.
 */

import { HealthPort } from '../../domain/ports/HealthPort';
import { ProviderHealthPort } from '../../domain/ports/ProviderHealthPort';

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
  private readonly providerPort: ProviderHealthPort | undefined;

  /**
   * @param healthPort   - Adapter for local infrastructure (e.g. SQLite)
   * @param providerPort - Optional adapter for upstream provider (e.g. GitHub)
   */
  constructor(healthPort: HealthPort, providerPort?: ProviderHealthPort) {
    this.healthPort = healthPort;
    this.providerPort = providerPort;
  }

  async check(): Promise<HealthCheckResult> {
    const services: ServiceHealthStatus = {
      database: this.healthPort.ping() ? 'ok' : 'error',
    };

    if (this.providerPort !== undefined) {
      services.github = await this.providerPort.checkProvider();
    }

    const allHealthy = (Object.values(services) as Array<'ok' | 'error'>).every((s) => s === 'ok');

    return { ok: allHealthy, services };
  }
}
