/**
 * Common Types
 * Shared type definitions used across the application
 */

/**
 * Supported version control providers
 */
export type Provider = 'github' | 'gitlab' | 'bitbucket';

/**
 * Environment modes
 */
export type Environment = 'development' | 'production' | 'test';

/**
 * Log levels
 */
export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';
