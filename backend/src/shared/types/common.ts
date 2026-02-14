import { Providers } from '../constants/providers';

/**
 * Common Types
 * Shared type definitions used across the application
 */

/**
 * Supported version control providers
 */
export type Provider = Providers.GITHUB | Providers.GITLAB | Providers.BITBUCKET;

/**
 * Environment modes
 */
export type Environment = 'development' | 'production' | 'test';

/**
 * Log levels
 */
export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
