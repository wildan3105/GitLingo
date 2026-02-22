/**
 * HealthService Unit Tests
 * Uses mock HealthPort implementations — no database or network involved.
 */

import { HealthService } from '../../application/services/HealthService';
import { HealthPort } from '../../domain/ports/HealthPort';

class MockDbPort implements HealthPort {
  constructor(private readonly healthy: boolean) {}
  ping(): boolean {
    return this.healthy;
  }
}

class MockProviderPort implements HealthPort {
  constructor(private readonly result: 'ok' | 'error') {}
  ping(): boolean {
    return true;
  }
  async checkProvider(): Promise<'ok' | 'error'> {
    return this.result;
  }
}

describe('HealthService', () => {
  describe('check — database only (no provider port)', () => {
    it('should return ok=true and database=ok when DB is healthy', async () => {
      const service = new HealthService(new MockDbPort(true));

      const result = await service.check();

      expect(result.ok).toBe(true);
      expect(result.services.database).toBe('ok');
    });

    it('should return ok=false and database=error when DB is unhealthy', async () => {
      const service = new HealthService(new MockDbPort(false));

      const result = await service.check();

      expect(result.ok).toBe(false);
      expect(result.services.database).toBe('error');
    });

    it('should always return a services.database field', async () => {
      const service = new HealthService(new MockDbPort(true));

      const result = await service.check();

      expect(result.services).toHaveProperty('database');
    });

    it('should not include services.github when no provider port is given', async () => {
      const service = new HealthService(new MockDbPort(true));

      const result = await service.check();

      expect(result.services).not.toHaveProperty('github');
    });
  });

  describe('check — with provider port', () => {
    it('should include services.github=ok when provider is reachable', async () => {
      const service = new HealthService(new MockDbPort(true), new MockProviderPort('ok'));

      const result = await service.check();

      expect(result.ok).toBe(true);
      expect(result.services.github).toBe('ok');
    });

    it('should include services.github=error when provider is unreachable', async () => {
      const service = new HealthService(new MockDbPort(true), new MockProviderPort('error'));

      const result = await service.check();

      expect(result.ok).toBe(false);
      expect(result.services.github).toBe('error');
    });

    it('should return ok=false when DB is healthy but GitHub is unreachable', async () => {
      const service = new HealthService(new MockDbPort(true), new MockProviderPort('error'));

      const result = await service.check();

      expect(result.ok).toBe(false);
      expect(result.services.database).toBe('ok');
      expect(result.services.github).toBe('error');
    });

    it('should return ok=false when both DB and GitHub are unhealthy', async () => {
      const service = new HealthService(new MockDbPort(false), new MockProviderPort('error'));

      const result = await service.check();

      expect(result.ok).toBe(false);
      expect(result.services.database).toBe('error');
      expect(result.services.github).toBe('error');
    });

    it('should not call checkProvider on a port that does not implement it', async () => {
      // MockDbPort has no checkProvider — passing it as providerPort should not fail
      const service = new HealthService(new MockDbPort(true), new MockDbPort(true));

      const result = await service.check();

      // No checkProvider on the port → github key absent → ok determined by database only
      expect(result.services).not.toHaveProperty('github');
      expect(result.ok).toBe(true);
    });
  });
});
