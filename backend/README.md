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

# GitHub Token (OPTIONAL but RECOMMENDED)
# See "GitHub Token & Rate Limits" section below
GITHUB_TOKEN=your_github_token_here

# Logging
LOG_LEVEL=info
```

### GitHub Token & Rate Limits

**IMPORTANT: The GitHub token is OPTIONAL but HIGHLY RECOMMENDED.**

#### Without Authentication (No Token)
- **Rate Limit**: 60 requests per hour per IP address
- **Use Case**: Testing, local development with limited queries
- The API will work, but you'll hit rate limits quickly

#### With Authentication (Token Provided)
- **Rate Limit**: 5,000 requests per hour
- **Use Case**: Production, heavy development, automated testing
- **83x more requests** compared to unauthenticated access

#### How to Get a GitHub Token

1. Go to GitHub Settings → [Developer Settings → Personal Access Tokens → Tokens (classic)](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Give it a descriptive name (e.g., "GitLingo Backend")
4. Select scopes:
   - ✅ `repo` (Full control of private repositories) - **Required** for public repo access
   - ✅ `read:org` (Read org and team membership) - **Optional** for organization stats
   - ✅ `read:user` (Read user profile data) - **Optional** for user stats
5. Click "Generate token"
6. Copy the token (starts with `ghp_...`)
7. Add to `.env` file: `GITHUB_TOKEN=ghp_...`

#### Testing Token Usage

To verify your token is being used:

```bash
# Start the server with debug logging
LOG_LEVEL=debug npm run dev

# Make a request and check the response headers
curl -i "http://localhost:3001/api/v1/search?username=octocat"
```

With a valid token, the server will authenticate all GitHub API requests automatically.

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

### Error Codes & HTTP Status Mapping

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| `validation_error` | 400 | Invalid query parameters (username format, etc.) |
| `user_not_found` | 404 | GitHub user or organization not found |
| `rate_limited` | 429 | GitHub API rate limit exceeded (see rate limits section) |
| `network_error` | 503 | Network connectivity issues with GitHub API |
| `provider_error` | 500 | General GitHub API error |
| `internal_server_error` | 500 | Unexpected server error |

### `GET /health`

Health check endpoint for monitoring and load balancers.

**Response (200):**

```json
{
  "status": "ok",
  "uptime": 123.456,
  "timestamp": "2026-02-14T02:10:00.000Z"
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
- **Rate Limiting**: Prevent abuse with express-rate-limit (100 req/15min per IP)
- **Security Headers**: Helmet middleware for common protections
- **Secret Management**: Environment variables, never commit tokens
- **Error Sanitization**: No internal stack traces in production
- **CORS**: Configured for cross-origin requests (adjust in production)

## Known Limitations & Important Notes

### Current Implementation

1. **GitHub Only**: Currently only supports GitHub. GitLab and Bitbucket are planned but not implemented.

2. **No Caching**: Every request fetches fresh data from GitHub API. Consider implementing Redis caching for production.

3. **No Pagination UI**: The API fetches all repositories for a user but doesn't expose pagination controls to frontend (yet).

4. **Basic Profile Info**: User profile information is minimal (username, type). Could be enhanced to fetch more details from GitHub.

5. **Fork Handling**: Forks are counted separately in a `__forks__` category. They are not included in language statistics.

6. **Language Detection**: Relies on GitHub's language detection. Repos without a detected language are categorized as "Unknown".

### Rate Limiting Behavior

- **Express Rate Limit**: 100 requests per 15 minutes per IP (application-level)
- **GitHub Rate Limit**: 60/hour (no token) or 5,000/hour (with token)
- **Important**: If you hit GitHub's rate limit, the API returns a `429` error with retry information

### Environment-Specific Behavior

- **Development**: Stack traces included in error responses
- **Production**: Stack traces hidden, minimal error messages
- **Logging**: Use `LOG_LEVEL=debug` for verbose logging during development

## Deployment

### Prerequisites

- Node.js 20+ installed
- GitHub Personal Access Token (recommended for production)
- Reverse proxy (nginx, Caddy) for HTTPS termination (recommended)

### Build for Production

```bash
# Install dependencies
npm ci --production=false

# Run linting and tests
npm run lint
npm run typecheck

# Build
npm run build

# Start production server
NODE_ENV=production npm start
```

### Docker Deployment (Recommended)

```bash
# Build Docker image
docker build -t gitlingo-backend .

# Run container
docker run -d \
  -p 3001:3001 \
  -e GITHUB_TOKEN=your_token_here \
  -e NODE_ENV=production \
  --name gitlingo-backend \
  gitlingo-backend
```

### Environment Variables for Production

```env
# Required
PORT=3001
NODE_ENV=production

# Highly Recommended
GITHUB_TOKEN=ghp_your_production_token

# Optional
LOG_LEVEL=info
```

### Monitoring & Health Checks

Use the `/health` endpoint for:
- Load balancer health checks
- Uptime monitoring (Uptime Robot, Pingdom, etc.)
- Kubernetes liveness/readiness probes

```bash
# Example health check
curl http://localhost:3001/health
```

### Reverse Proxy Example (nginx)

```nginx
server {
    listen 80;
    server_name api.gitlingo.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Troubleshooting

### Issue: "Rate limit exceeded" errors

**Solution**:
- Add a valid `GITHUB_TOKEN` to `.env`
- Check your token has the required scopes (`repo`, `read:org`)
- Wait for rate limit to reset (check `X-RateLimit-Reset` header)

### Issue: Server starts but requests timeout

**Solution**:
- Check if GitHub API is accessible: `curl https://api.github.com`
- Verify firewall/network settings
- Check server logs: `LOG_LEVEL=debug npm run dev`

### Issue: Validation errors for valid usernames

**Solution**:
- GitHub usernames can only contain alphanumeric characters and hyphens
- Maximum 39 characters
- Cannot start or end with a hyphen

### Issue: "Cannot find module" errors

**Solution**:
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run clean
npm run build
```

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
