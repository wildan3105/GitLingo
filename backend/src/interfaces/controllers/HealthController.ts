/**
 * HealthController
 * Handles HTTP requests for GET /health
 */

import { Request, Response, Router } from 'express';
import { HealthService } from '../../application/services/HealthService';

export class HealthController {
  private readonly router: Router;
  private readonly healthService: HealthService;

  constructor(healthService: HealthService) {
    this.healthService = healthService;
    this.router = Router();
    this.router.get('/health', this.health.bind(this));
  }

  getRouter(): Router {
    return this.router;
  }

  private async health(_req: Request, res: Response): Promise<void> {
    try {
      const { ok, services } = await this.healthService.check();
      res.status(200).json({
        ok,
        data: {
          uptime: process.uptime(),
          timestamp: new Date().toISOString(),
          services,
        },
      });
    } catch {
      res.status(500).json({ ok: false, error: 'Health check failed' });
    }
  }
}
