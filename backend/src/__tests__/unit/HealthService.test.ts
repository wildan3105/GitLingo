/**
 * HealthService Unit Tests
 * Uses a mock HealthPort — no database involved.
 */

import { HealthService } from '../../application/services/HealthService';
import { HealthPort } from '../../domain/ports/HealthPort';

class MockHealthPort implements HealthPort {
  constructor(private readonly healthy: boolean) {}

  ping(): boolean {
    return this.healthy;
  }
}

describe('HealthService', () => {
  describe('check', () => {
    it('should return ok=true and database=ok when DB is healthy', () => {
      const service = new HealthService(new MockHealthPort(true));

      const result = service.check();

      expect(result.ok).toBe(true);
      expect(result.services.database).toBe('ok');
    });

    it('should return ok=false and database=error when DB is unhealthy', () => {
      const service = new HealthService(new MockHealthPort(false));

      const result = service.check();

      expect(result.ok).toBe(false);
      expect(result.services.database).toBe('error');
    });

    it('should always return a services.database field', () => {
      const service = new HealthService(new MockHealthPort(true));

      const result = service.check();

      expect(result.services).toHaveProperty('database');
    });
  });
});
