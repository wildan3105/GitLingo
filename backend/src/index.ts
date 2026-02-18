/**
 * GitLingo Backend - Entry Point
 * DDD-based orchestration layer for version control statistics
 */

import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import pinoHttp from 'pino-http';
import pino from 'pino';

import { config } from './shared/config/env';
import { GitHubGraphQLAdapter } from './infrastructure/providers/GitHubGraphQLAdapter';
import { SearchService } from './application/services/SearchService';
import { SearchController } from './interfaces/controllers/SearchController';
import { createRoutes } from './interfaces/routes';
import { errorHandler } from './interfaces/middleware/errorHandler';

// Initialize logger
const logger = pino({ level: config.logLevel });

/**
 * Create and configure Express application
 */
function createApp(): Application {
  const app = express();

  // Security middleware
  app.use(helmet());

  // CORS middleware
  app.use(cors());

  // JSON body parser
  app.use(express.json());

  // Request logging
  app.use(
    pinoHttp({
      logger,
      autoLogging: true,
    })
  );

  // Dependency injection
  const githubAdapter = new GitHubGraphQLAdapter(config.githubToken, config.graphqlURL);
  const searchService = new SearchService(githubAdapter);
  const searchController = new SearchController(searchService);

  // Mount routes
  app.use(createRoutes(searchController));

  // Global error handler (must be last)
  app.use(errorHandler);

  return app;
}

/**
 * Start the server
 */
function startServer(): void {
  const app = createApp();

  const server = app.listen(config.port, () => {
    logger.info(
      {
        port: config.port,
        nodeEnv: config.nodeEnv,
        logLevel: config.logLevel,
      },
      '🚀 GitLingo Backend started'
    );
  });

  // Graceful shutdown
  const shutdown = (signal: string): void => {
    logger.info(`${signal} received, shutting down gracefully...`);

    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
      logger.error('Forcing shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

// Start the server
startServer();
