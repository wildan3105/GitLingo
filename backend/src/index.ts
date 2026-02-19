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
import pino from 'pino';
import Database from 'better-sqlite3';

import { config } from './shared/config/env';
import { GitHubGraphQLAdapter } from './infrastructure/providers/GitHubGraphQLAdapter';
import { createDatabase } from './infrastructure/persistence/database';
import { SQLiteTopSearchAdapter } from './infrastructure/persistence/SQLiteTopSearchAdapter';
import { SearchService } from './application/services/SearchService';
import { TopSearchService } from './application/services/TopSearchService';
import { SearchController } from './interfaces/controllers/SearchController';
import { TopSearchController } from './interfaces/controllers/TopSearchController';
import { createRoutes } from './interfaces/routes';
import { createTopSearchRoutes } from './interfaces/routes/topSearchRoutes';
import { errorHandler } from './interfaces/middleware/errorHandler';

// Initialize logger
const logger = pino({ level: config.logLevel });

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

  // Persistence
  ensureDbDirectory(config.dbPath);
  const db = createDatabase(config.dbPath);
  const topSearchAdapter = new SQLiteTopSearchAdapter(db);
  const topSearchService = new TopSearchService(topSearchAdapter);
  const topSearchController = new TopSearchController(topSearchService);

  // Provider + search
  const githubAdapter = new GitHubGraphQLAdapter(config.githubToken, config.graphqlURL);
  const searchService = new SearchService(githubAdapter);
  const searchController = new SearchController(searchService, topSearchService);

  // Mount routes
  app.use(createRoutes(searchController));
  app.use('/api/v1', createTopSearchRoutes(topSearchController));

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
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

// Start the server
startServer();
