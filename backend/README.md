# GitLingo Backend

Express + TypeScript backend API for GitLingo — fetches and aggregates GitHub language statistics using a Domain-Driven Design (DDD) architecture.

## Tech Stack

- **Express** - Web framework
- **TypeScript** - Type safety
- **Zod** - Schema validation
- **@octokit/graphql** - GitHub API client
- **better-sqlite3** - Persistent storage (topsearch leaderboard + result cache)
- **Pino** - Logging
- **Jest** - Testing

## Getting Started

### Prerequisites

- Node.js >=24.3.0
- No additional system dependencies — SQLite is bundled via `better-sqlite3`

### Installation

```bash
cd backend
npm install
```

### Development

```bash
# Start dev server with hot reload (http://localhost:3001)
npm run dev

# Run tests
npm test

# Type check
npm run typecheck

# Lint code
npm run lint

# Format code
npm run format
```

### Build

```bash
# Production build
npm run build

# Run production build
npm start
```

### Test the API

```bash
# Health check
curl http://localhost:3001/api/v1/health

# Language stats for a user
curl "http://localhost:3001/api/v1/search?username=octocat"

# Top searched users leaderboard
curl "http://localhost:3001/api/v1/topsearch"
```

## Project Structure

```
backend/
├── src/
│   ├── domain/           # Business logic & models
│   ├── application/      # Use cases & ports
│   ├── infrastructure/   # GitHub API + SQLite adapters
│   ├── interfaces/       # HTTP controllers, routes & validation
│   ├── shared/           # Utilities & config
│   └── __tests__/        # Unit and integration tests
├── data/                 # SQLite database (auto-created at runtime)
├── Dockerfile
└── package.json
```

## Testing

Uses Jest with supertest for integration tests:

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Code Style

- **Formatting**: Prettier
- **Linting**: ESLint with TypeScript rules
- **Type Safety**: TypeScript strict mode

## Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=3001
NODE_ENV=development
LOG_LEVEL=info

# GitHub Token (OPTIONAL - see note below)
GITHUB_TOKEN=your_token_here

# CORS - comma-separated list of allowed frontend origins
# Default: http://localhost:5173 (must be set explicitly in production)
# In production, use your actual app URL (e.g., https://gitlingo.app)

# SQLite database path (relative to project root)
DB_PATH=./data/gitlingo.db

# Result Caching (OPTIONAL)
ENABLE_CACHE=false
CACHE_TTL_HOURS=12

# Concurrency limit for simultaneous in-flight GitHub requests (OPTIONAL)
CONCURRENCY_LIMIT=20
```

### GitHub Token

**The API works without a token**, but with limited requests:
- **Without token**: 60 requests/hour
- **With token**: 5,000 requests/hour

[Get a token here](https://github.com/settings/tokens)

### GitHub Enterprise (GHE)

The backend supports self-hosted GitHub Enterprise instances. Add `GRAPHQL_URL` to your `.env`:

```env
GRAPHQL_URL=https://ghe.your-company.com/api
GITHUB_TOKEN=your_ghe_token_here
```

**Important:** Use the **full API URL**, including `/api`.

Key points:
- Match your token to your endpoint — GitHub.com tokens won't work with GHE URLs and vice versa
- URL format must be `https://your-ghe-instance/api/` (not just the hostname)

### Caching

Result caching is **opt-in** and disabled by default. Set `ENABLE_CACHE=true` to enable it. When enabled, results are stored in the local SQLite database and served from cache until the TTL expires (default 12 hours, maximum 24 hours).

| Situation | Response |
|---|---|
| Cache hit (TTL valid) | Returns cached result immediately — GitHub is not called |
| Cache miss or TTL expired | Fetches from GitHub, stores the result, returns it |
| GitHub error + expired cache | Serves the expired cached result as a fallback with a warning log |
| GitHub error + no cache | Returns the error response unchanged |

## Docker

```bash
# Build
docker build -t gitlingo-backend .

# Run
docker run -p 3001:3001 \
  -e GITHUB_TOKEN=your_token \
  gitlingo-backend
```

## License

MIT
