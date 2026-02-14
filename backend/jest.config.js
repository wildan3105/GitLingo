/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/__tests__/**',
    '!src/**/*.test.ts',
    '!src/**/manual-test.ts',
    '!src/index.ts', // Entry point, tested via integration tests
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    'GitHubAdapter.test.ts', // Skip due to ES module mocking issues
    'api.test.ts', // Skip due to ES module mocking issues
  ],
  coverageDirectory: 'coverage',
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],
  transformIgnorePatterns: ['node_modules/(?!(@octokit)/)'],
  verbose: true,
};
