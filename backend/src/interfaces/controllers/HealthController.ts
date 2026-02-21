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

  private health(_req: Request, res: Response): void {
    const { ok, services } = this.healthService.check();
    res.status(200).json({
      ok,
      data: {
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        services,
      },
    });
  }
}
