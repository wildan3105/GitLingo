# GitLingo Backend

> DDD-based orchestration layer for version control statistics

## Overview

GitLingo Backend is a **Domain-Driven Design (DDD)** architecture-based API service that orchestrates data fetching from version control providers (initially GitHub) and delivers structured language statistics to the frontend.

### Key Principles

- **Maintainability**: Clear separation of concerns with ports/adapters pattern
- **Extensibility**: Provider-agnostic design (GitHub today, GitLab/Bitbucket tomorrow)
- **Testability**: Domain logic isolated from infrastructure concerns
- **Scalability**: Stateless, horizontally scalable architecture
- **Performance**: GraphQL-based efficient data fetching

## Tech Stack

### Core Dependencies

| Package | Purpose |
|---------|---------|
| **Express** | Web framework for HTTP API |
| **TypeScript** | Type-safe development |
| **Zod** | Runtime schema validation & type inference |
| **@octokit/graphql** | GitHub GraphQL API client |
| **Pino + Pino-HTTP** | High-performance structured logging |
| **Helmet** | Security headers middleware |
| **CORS** | Cross-origin resource sharing |
| **express-rate-limit** | Rate limiting protection |

### Development Dependencies

| Package | Purpose |
|---------|---------|
| **tsx** | Fast TypeScript execution for dev |
| **ESLint** | Code linting with TypeScript support |
| **Prettier** | Code formatting |
| **Supertest** | HTTP integration testing |
| **Nock** | HTTP request mocking |

## Project Structure

```
backend/
├── src/
│   ├── index.ts              # Application entry point
│   ├── domain/               # Domain models & business logic
│   ├── application/          # Use cases & application services
│   ├── infrastructure/       # External integrations (GitHub, HTTP, etc.)
│   ├── interfaces/           # HTTP controllers & DTOs
│   └── shared/               # Shared utilities & types
├── dist/                     # Compiled output (gitignored)
├── tests/                    # Test files (unit, integration)
├── tsconfig.json             # TypeScript configuration
├── package.json              # Dependencies & scripts
└── README.md                 # This file
```

## Getting Started

### Prerequisites

- **Node.js**: >= 20.0.0
- **npm**: >= 9.0.0

### Installation

```bash
# Install dependencies
npm install
```

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Server
PORT=3001
NODE_ENV=development

# GitHub (if using authenticated API)
GITHUB_TOKEN=your_github_token_here

# Logging
LOG_LEVEL=info
```

## Available Scripts

### Development

```bash
# Start development server with hot reload
npm run dev
```

### Building

```bash
# Compile TypeScript to JavaScript
npm run build

# Clean build artifacts
npm run clean
```

### Production

```bash
# Run compiled application
npm start
```

### Code Quality

```bash
# Run ESLint
npm run lint

# Fix ESLint issues automatically
npm run lint:fix

# Format code with Prettier
npm run format

# Check formatting without changes
npm run format:check

# Type-check without emitting files
npm run typecheck
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Architecture

### Domain-Driven Design (DDD)

The backend follows **Hexagonal Architecture** (Ports & Adapters):

```
┌─────────────────────────────────────────────┐
│           Interfaces (HTTP)                 │
│  ┌─────────────────────────────────────┐   │
│  │     Controllers & DTOs              │   │
│  └─────────────────────────────────────┘   │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│         Application Layer                   │
│  ┌─────────────────────────────────────┐   │
│  │  Use Cases & Services               │   │
│  └─────────────────────────────────────┘   │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│           Domain Layer                      │
│  ┌─────────────────────────────────────┐   │
│  │  Models, Entities, Value Objects    │   │
│  │  Business Logic (pure)              │   │
│  └─────────────────────────────────────┘   │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│      Infrastructure Layer                   │
│  ┌─────────────────────────────────────┐   │
│  │  GitHub GraphQL Adapter             │   │
│  │  HTTP Client, Logger, etc.          │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

**Key Concepts:**

- **Domain**: Pure business logic, no external dependencies
- **Application**: Orchestrates use cases, depends on domain
- **Infrastructure**: External concerns (APIs, DB, etc.)
- **Interfaces**: HTTP layer, maps requests/responses to domain

### Provider Abstraction

```typescript
// Port (interface)
interface ProviderPort {
  fetchRepositories(username: string): Promise<Repository[]>;
}

// Adapter (implementation)
class GitHubGraphQLAdapter implements ProviderPort {
  // GitHub-specific implementation
}
```

This allows seamless integration of GitLab, Bitbucket, or any future provider.

## API Endpoints

### `GET /api/v1/search`

Fetch language statistics for a given username.

**Query Parameters:**

| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `username` | string | Yes | - | GitHub username or organization |
| `provider` | string | No | `github` | VCS provider (`github`, `gitlab`, `bitbucket`) |

**Success Response (200):**

```json
{
  "ok": true,
  "provider": "github",
  "profile": {
    "username": "octocat",
    "type": "user",
    "providerUserId": "1"
  },
  "series": [
    { "key": "JavaScript", "label": "JavaScript", "value": 100, "color": "#f1e05a" },
    { "key": "Python", "label": "Python", "value": 10, "color": "#3572A5" }
  ],
  "metadata": {
    "generatedAt": "2026-02-14T02:10:00.000Z",
    "unit": "repos",
    "limit": 20
  }
}
```

**Error Response (4xx/5xx):**

```json
{
  "ok": false,
  "provider": "github",
  "error": {
    "code": "user_not_found",
    "message": "The specified user was not found.",
    "details": { "username": "octocat" }
  },
  "meta": {
    "generatedAt": "2026-02-14T02:10:00.000Z"
  }
}
```

## Development Workflow

1. **Make changes** in `src/`
2. **Run linting**: `npm run lint:fix`
3. **Format code**: `npm run format`
4. **Type-check**: `npm run typecheck`
5. **Test locally**: `npm run dev`
6. **Write tests** for new features
7. **Build**: `npm run build`
8. **Commit** (following conventional commits)

## Testing Strategy

### Unit Tests
- Test domain logic in isolation
- Mock external dependencies via ports
- Fast execution, high coverage

### Integration Tests
- Test API endpoints with Supertest
- Mock external HTTP calls with Nock
- Validate request/response contracts

### E2E Tests (optional)
- Full request flow including real provider calls
- Use test accounts or fixtures

## Performance Targets

| Account Size | Target Latency |
|--------------|----------------|
| Small (< 50 repos) | < 500ms |
| Large (> 50 repos) | < 1s |

## Security Considerations

- **Input Validation**: Zod schemas for all inputs
- **Rate Limiting**: Prevent abuse with express-rate-limit
- **Security Headers**: Helmet middleware for common protections
- **Secret Management**: Environment variables, never commit tokens
- **Error Sanitization**: No internal stack traces in production

## Future Enhancements

- [ ] Caching layer (Redis)
- [ ] GitLab provider support
- [ ] Bitbucket provider support
- [ ] Search persistence (top searches, trending)
- [ ] GraphQL API (in addition to REST)
- [ ] Metrics & monitoring (Prometheus)

## Contributing

1. Follow TypeScript strict mode
2. Maintain >80% test coverage
3. Use conventional commits
4. Run `npm run lint` and `npm run format` before committing
5. Keep DRY principles - flag repetition aggressively

## License

MIT
