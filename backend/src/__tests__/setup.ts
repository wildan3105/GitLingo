/**
 * Jest Test Setup
 * Runs before all tests
 */

// Mock environment variables for tests
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.LOG_LEVEL = 'fatal'; // Suppress logs during tests (fatal is valid)
process.env.GITHUB_TOKEN = 'test_token_123';

// Set longer timeout for integration tests with external APIs
jest.setTimeout(10000);
