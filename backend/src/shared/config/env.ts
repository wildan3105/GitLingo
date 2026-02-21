/**
 * Environment Configuration
 * Loads and validates environment variables
 */

import 'dotenv/config';
import { Environment, LogLevel } from '../types/common';

interface Config {
  port: number;
  nodeEnv: Environment;
  githubToken: string | undefined;
  graphqlURL: string | undefined;
  logLevel: LogLevel;
  dbPath: string;
  enableCache: boolean;
  cacheTtlHours: number;
}

/**
 * Parse and validate PORT
 */
function getPort(): number {
  const port = process.env.PORT;
  if (port === undefined || port === '') {
    return 3001; // Default port
  }

  const parsed = parseInt(port, 10);
  if (isNaN(parsed) || parsed < 1 || parsed > 65535) {
    throw new Error(`Invalid PORT: ${port}. Must be a number between 1 and 65535.`);
  }

  return parsed;
}

/**
 * Parse and validate NODE_ENV
 */
function getNodeEnv(): Environment {
  const env = process.env.NODE_ENV ?? 'development';

  if (env !== 'development' && env !== 'production' && env !== 'test') {
    console.warn(`Invalid NODE_ENV: ${env}. Defaulting to 'development'.`);
    return 'development';
  }

  return env;
}

/**
 * Parse and validate LOG_LEVEL
 */
function getLogLevel(): LogLevel {
  const level = process.env.LOG_LEVEL ?? 'info';

  const validLevels: LogLevel[] = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'];
  if (!validLevels.includes(level as LogLevel)) {
    console.warn(`Invalid LOG_LEVEL: ${level}. Defaulting to 'info'.`);
    return 'info';
  }

  return level as LogLevel;
}

/**
 * Load and export configuration
 */
export const config: Config = {
  port: getPort(),
  nodeEnv: getNodeEnv(),
  githubToken: process.env.GITHUB_TOKEN,
  graphqlURL: process.env.GRAPHQL_URL,
  logLevel: getLogLevel(),
  dbPath: process.env.DB_PATH ?? './data/gitlingo.db',
  enableCache: process.env.ENABLE_CACHE === 'true',
  cacheTtlHours: ((): number => {
    const val = Number(process.env.CACHE_TTL_HOURS);
    return Number.isFinite(val) && val > 0 ? val : 12;
  })(),
};

/**
 * Check if running in production
 */
export const isProduction = (): boolean => config.nodeEnv === 'production';

/**
 * Check if running in development
 */
export const isDevelopment = (): boolean => config.nodeEnv === 'development';

/**
 * Check if running in test
 */
export const isTest = (): boolean => config.nodeEnv === 'test';
