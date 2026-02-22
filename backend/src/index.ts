/**
 * GitLingo Backend - Entry Point
 * DDD-based orchestration layer for version control statistics
 */

import path from 'path';
import fs from 'fs';
import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import pinoHttp from 'pino-http';
import Database from 'better-sqlite3';

import { config } from './shared/config/env';
import { logger } from './shared/utils/logger';
import { requestContext } from './shared/utils/requestContext';
import { GitHubGraphQLAdapter } from './infrastructure/providers/GitHubGraphQLAdapter';
import { createDatabase } from './infrastructure/persistence/database';
import { SQLiteTopSearchAdapter } from './infrastructure/persistence/SQLiteTopSearchAdapter';
import { SQLiteHealthAdapter } from './infrastructure/persistence/SQLiteHealthAdapter';
import { GitHubHealthAdapter } from './infrastructure/providers/GitHubHealthAdapter';
import { deriveProviderBaseUrl } from './shared/utils/providerUrl';
import { SearchPort } from './application/ports/SearchPort';
import { SearchService } from './application/services/SearchService';
import { CachedSearchService } from './application/services/CachedSearchService';
import { TopSearchService } from './application/services/TopSearchService';
import { HealthService } from './application/services/HealthService';
import { SQLiteCacheAdapter } from './infrastructure/persistence/SQLiteCacheAdapter';
import { SearchController } from './interfaces/controllers/SearchController';
import { TopSearchController } from './interfaces/controllers/TopSearchController';
import { HealthController } from './interfaces/controllers/HealthController';
import { createRoutes } from './interfaces/routes';
import { errorHandler } from './interfaces/middleware/errorHandler';

const SECONDS_PER_HOUR = 3600;
const FORCE_SHUTDOWN_TIMEOUT_MS = 10_000;

/**
 * Ensure the directory for the SQLite file exists.
 * Skipped for ':memory:' (in-memory databases have no filesystem path).
 */
function ensureDbDirectory(dbPath: string): void {
  if (dbPath === ':memory:') return;
  const dir = path.dirname(path.resolve(dbPath));
  fs.mkdirSync(dir, { recursive: true });
}

/**
 * Create and configure Express application
 */
function createApp(): { app: Application; db: Database.Database } {
  const app = express();

  // Security middleware
  app.use(helmet());

  // CORS middleware
  app.use(
    cors({
      origin: config.allowedOrigins,
      methods: ['GET', 'HEAD', 'OPTIONS'], // to add more methods if needed
      credentials: true,
    })
  );

  // JSON body parser
  app.use(express.json());

  // Request logging
  app.use(
    pinoHttp({
      logger,
      autoLogging: true,
    })
  );

  // Bind req.log into AsyncLocalStorage so service-level loggers
  // automatically inherit the request's reqId (must be after pinoHttp)
  app.use((req, _res, next) => {
    requestContext.run(req.log, next);
  });

  // Persistence
  ensureDbDirectory(config.dbPath);
  const db = createDatabase(config.dbPath);
  const topSearchAdapter = new SQLiteTopSearchAdapter(db);
  const topSearchService = new TopSearchService(topSearchAdapter);
  const topSearchController = new TopSearchController(topSearchService);

  const healthAdapter = new SQLiteHealthAdapter(db);
  const githubHealthAdapter = new GitHubHealthAdapter(config.graphqlURL);
  const healthService = new HealthService(healthAdapter, githubHealthAdapter);
  const healthController = new HealthController(healthService);

  // Provider + search
  const githubAdapter = new GitHubGraphQLAdapter(config.githubToken, config.graphqlURL);
  let searchService: SearchPort = new SearchService(githubAdapter);

  if (config.enableCache) {
    const providerBaseUrl = deriveProviderBaseUrl(config.graphqlURL);
    const cacheAdapter = new SQLiteCacheAdapter(db, config.cacheTtlHours * SECONDS_PER_HOUR);
    searchService = new CachedSearchService(searchService, cacheAdapter, providerBaseUrl);
    logger.info({ cacheTtlHours: config.cacheTtlHours, providerBaseUrl }, 'Cache enabled');
  }

  const searchController = new SearchController(searchService, topSearchService);

  // Mount routes
  app.use(createRoutes(searchController, topSearchController, healthController));

  // Global error handler (must be last)
  app.use(errorHandler);

  return { app, db };
}

/**
 * Start the server
 */
function startServer(): void {
  const { app, db } = createApp();

  const server = app.listen(config.port, () => {
    logger.info(
      {
        port: config.port,
        nodeEnv: config.nodeEnv,
        logLevel: config.logLevel,
        dbPath: config.dbPath,
      },
      '🚀 GitLingo Backend started'
    );
  });

  // Graceful shutdown
  const shutdown = (signal: string): void => {
    logger.info(`${signal} received, shutting down gracefully...`);

    server.close(() => {
      db.close();
      logger.info('Server closed');
      process.exit(0);
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
      logger.error('Forcing shutdown after timeout');
      process.exit(1);
    }, FORCE_SHUTDOWN_TIMEOUT_MS);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

// Start the server
startServer();
