/**
 * Environment Configuration
 * Loads and validates environment variables
 */

import { Environment, LogLevel } from '../types/common';

interface Config {
  port: number;
  nodeEnv: Environment;
  githubToken: string | undefined;
  graphqlURL: string | undefined;
  logLevel: LogLevel;
  dbPath: string;
  allowedOrigins: string[];
  enableCache: boolean;
  cacheTtlHours: number;
  concurrencyLimit: number;
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

const CORS_DEFAULT_ORIGINS = ['http://localhost:5173'];

/**
 * Parse and validate ALLOWED_ORIGINS.
 * Exported for unit testing.
 *
 * - Comma-separated list of allowed origins, e.g. "https://app.example.com,https://staging.example.com"
 * - Unset / empty in production → console.warn (localhost default will block real users)
 * - Unset / empty in development → silently falls back to localhost:5173
 */
export function parseAllowedOrigins(
  rawValue: string | undefined,
  nodeEnv: string | undefined
): string[] {
  if (rawValue === undefined || rawValue.trim() === '') {
    if (nodeEnv === 'production') {
      console.warn(
        'ALLOWED_ORIGINS is not set in production. ' +
          'Defaulting to localhost origins, which will block all real users. ' +
          'Set ALLOWED_ORIGINS to your frontend domain(s).'
      );
    }
    return CORS_DEFAULT_ORIGINS;
  }

  return rawValue
    .split(',')
    .map((o) => o.trim())
    .filter((o) => o.length > 0);
}

const CACHE_TTL_DEFAULT_HOURS = 12;
const CACHE_TTL_MAX_HOURS = 24;

/**
 * Parse and validate CACHE_TTL_HOURS.
 * Exported for unit testing.
 *
 * - Invalid / non-positive → default (12h)
 * - Above maximum (24h)   → capped to 24h + console.warn
 * - Otherwise             → parsed value
 */
export function parseCacheTtlHours(rawValue: string | undefined): number {
  const val = Number(rawValue);

  if (!Number.isFinite(val) || val <= 0) {
    return CACHE_TTL_DEFAULT_HOURS;
  }

  if (val > CACHE_TTL_MAX_HOURS) {
    console.warn(
      `CACHE_TTL_HOURS=${val} exceeds the maximum of ${CACHE_TTL_MAX_HOURS}h. Capping to ${CACHE_TTL_MAX_HOURS}h.`
    );
    return CACHE_TTL_MAX_HOURS;
  }

  return val;
}

const CONCURRENCY_LIMIT_DEFAULT = 20;

/**
 * Parse and validate CONCURRENCY_LIMIT.
 * Exported for unit testing.
 *
 * - Unset / empty / non-positive / non-numeric → default (20)
 */
export function parseConcurrencyLimit(rawValue: string | undefined): number {
  if (rawValue === undefined || rawValue.trim() === '') {
    return CONCURRENCY_LIMIT_DEFAULT;
  }
  const val = Number(rawValue);
  if (!Number.isFinite(val) || val < 1) {
    console.warn(
      `Invalid CONCURRENCY_LIMIT: "${rawValue}". Must be a positive integer. Defaulting to ${CONCURRENCY_LIMIT_DEFAULT}.`
    );
    return CONCURRENCY_LIMIT_DEFAULT;
  }
  return Math.floor(val);
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
  allowedOrigins: parseAllowedOrigins(process.env.ALLOWED_ORIGINS, process.env.NODE_ENV),
  enableCache: process.env.ENABLE_CACHE === 'true',
  cacheTtlHours: parseCacheTtlHours(process.env.CACHE_TTL_HOURS),
  concurrencyLimit: parseConcurrencyLimit(process.env.CONCURRENCY_LIMIT),
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
