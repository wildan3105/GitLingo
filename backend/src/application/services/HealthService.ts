/**
 * HealthService
 * Application service that aggregates health status across infrastructure dependencies.
 */

import { HealthPort } from '../../domain/ports/HealthPort';

export interface ServiceHealthStatus {
  database: 'ok' | 'error';
}

export interface HealthCheckResult {
  /** true when all services are healthy, false when any are not */
  ok: boolean;
  services: ServiceHealthStatus;
}

export class HealthService {
  private readonly healthPort: HealthPort;

  constructor(healthPort: HealthPort) {
    this.healthPort = healthPort;
  }

  check(): HealthCheckResult {
    const services: ServiceHealthStatus = {
      database: this.healthPort.ping() ? 'ok' : 'error',
    };

    const allHealthy = (Object.values(services) as string[]).every((s) => s === 'ok');

    return { ok: allHealthy, services };
  }
}
