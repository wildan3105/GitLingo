# GitLingo Backend

> API service that fetches and aggregates GitHub language statistics

## What is this?

A TypeScript backend API that:
- Fetches repositories from GitHub GraphQL API
- Aggregates language statistics (how many repos per language)
- Returns chart-ready data for visualization
- Built with Domain-Driven Design (DDD) architecture

## Quick Start

### Prerequisites

- Node.js >=24.3.0
- GitHub Personal Access Token (optional but recommended)

### Installation

```bash
# Install dependencies
npm install

# Create .env file (required for npm run dev)
cp .env.example .env
# Edit .env to add your GitHub token and any other settings
```

### Run Locally

```bash
# Development (with hot reload)
npm run dev

# Server starts at http://localhost:3001
```

### Test the API

```bash
# Health check
curl http://localhost:3001/api/v1/health

# Get language stats for a user
curl "http://localhost:3001/api/v1/search?username=octocat"

# Get top searched users leaderboard
curl "http://localhost:3001/api/v1/topsearch"
```

## Environment Variables

Create a `.env` file:

```env
PORT=3001
NODE_ENV=development
LOG_LEVEL=info

# GitHub Token (OPTIONAL - see note below)
GITHUB_TOKEN=your_token_here

# CORS — comma-separated list of allowed frontend origins
# Default: http://localhost:5173  (must be set explicitly in production)
ALLOWED_ORIGINS=http://localhost:5173

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

[Get a token here](https://github.com/settings/tokens) (select `repo` scope)

## Using with GitHub Enterprise (GHE)

The backend supports **self-hosted GitHub Enterprise** instances. Configure it by adding the `GRAPHQL_URL` environment variable.

### Configuration

Add to your `.env`:

```env
# GitHub Enterprise Configuration
GRAPHQL_URL=https://ghe.your-company.com/api
GITHUB_TOKEN=your_ghe_token_here
```

**Important:** Use the **full API URL**, including `/api`.

### Examples

#### GitHub.com (Default)
```env
# No GRAPHQL_URL needed - defaults to api.github.com
GITHUB_TOKEN=ghp_GitHubPersonalAccessToken
```

#### GitHub Enterprise
```env
GRAPHQL_URL=https://ghe.your-company.com/api
GITHUB_TOKEN=ghp_EnterpriseAccessToken
```

### Key Points

- **Match your token to your endpoint**: Use GitHub tokens with GitHub.com, GHE tokens with GHE URLs
- **Tokens are environment-specific**: A GitHub.com token won't work with GHE and vice versa
- **URL format matters**: Must be `https://your-ghe-instance/api/` (not just the hostname)

### Testing Your GHE Setup

```bash
# Start the server
npm run dev

# Test with a GHE user (replace with actual username)
curl "http://localhost:3001/api/v1/search?username=your-ghe-username"
```

## Caching

Result caching is **opt-in** and disabled by default.

### Enabling the cache

Set `ENABLE_CACHE=true` in your `.env`:

```env
ENABLE_CACHE=true
CACHE_TTL_HOURS=12   # optional — default is 12 hours, maximum is 24 hours
```

When enabled, results are stored in the local SQLite database. Subsequent requests for the same username skip the GitHub API call entirely and are served from the cache until the TTL expires.

### Behavior

| Situation | Response |
|---|---|
| Cache hit (TTL valid) | Returns cached result immediately — GitHub is not called |
| Cache miss or TTL expired | Fetches from GitHub, stores the result, returns it |
| GitHub error + expired cache | Serves the expired cached result as a fallback with a warning log |
| GitHub error + no cache | Returns the error response unchanged |

### Response fields

When a result comes from cache, the `metadata` object includes two additional fields:

```json
"metadata": {
  "generatedAt": "2026-02-19T01:16:28.000Z",
  "unit": "repos",
  "cachedAt":    "2026-02-19T01:16:28.000Z",
  "cachedUntil": "2026-02-19T13:16:28.000Z"
}
```

- `generatedAt` equals `cachedAt` on a cache hit; on a miss it reflects the time of the live GitHub fetch.
- `cachedAt` and `cachedUntil` are absent when the cache is disabled or the result is a live fetch error.

---

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Run production build
npm test             # Run tests
npm run lint         # Check code quality
```

## API Endpoints

All endpoints are prefixed with `/api/v1`. Every response has an `ok` boolean at the top level — check this first before reading `data`.

---

### `GET /api/v1/health`

Application health check. Always returns HTTP 200 — inspect `ok` and `data.services` to determine actual health.

**Response — healthy:**
```json
{
  "ok": true,
  "data": {
    "uptime": 2008.08,
    "timestamp": "2026-02-19T01:16:28.050Z",
    "services": {
      "database": "ok",
      "github": "ok"
    }
  }
}
```

**Response — degraded (e.g. DB unreachable):**
```json
{
  "ok": false,
  "data": {
    "uptime": 2008.08,
    "timestamp": "2026-02-19T01:16:28.050Z",
    "services": {
      "database": "error",
      "github": "ok"
    }
  }
}
```

| Field | Type | Description |
|---|---|---|
| `ok` | `boolean` | `true` when all services are healthy |
| `data.uptime` | `number` | Process uptime in seconds |
| `data.timestamp` | `string` | ISO 8601 timestamp of the check |
| `data.services.database` | `"ok" \| "error"` | SQLite connection status |
| `data.services.github` | `"ok" \| "error"` | GitHub API reachability (optional — only present when a provider health check is configured) |

---

### `GET /api/v1/search`

Fetch language statistics for a GitHub user or organization.

**Query Parameters:**

| Parameter | Required | Default | Constraints | Description |
|---|---|---|---|---|
| `username` | ✅ | — | 1–39 chars, letters/numbers/hyphens only | GitHub username or org name |
| `provider` | ❌ | `github` | `github`, `gitlab`, `bitbucket` | VCS provider (only `github` is active) |

**Success Response (HTTP 200):**
```json
{
  "ok": true,
  "provider": "github",
  "profile": {
    "username": "octocat",
    "name": "The Octocat",
    "type": "user",
    "providerUserId": "1024",
    "avatarUrl": "https://avatars.githubusercontent.com/u/1024?v=4",
    "providerBaseUrl": "https://github.com",
    "isVerified": true,
    "createdAt": "2011-09-03T15:26:12Z",
    "location": "Portland, OR",
    "websiteUrl": "https://www.linuxfoundation.org",
    "statistics": {
      "followers": 231000,
      "following": 0
    }
  },
  "data": [
    { "key": "C",          "label": "C",          "value": 6,  "color": "#555555" },
    { "key": "Shell",      "label": "Shell",       "value": 2,  "color": "#89e051" },
    { "key": "__forks__",  "label": "Forked repos","value": 3,  "color": "#ededed" }
  ],
  "metadata": {
    "generatedAt": "2026-02-19T01:16:28.050Z",
    "unit": "repos",
    "cachedAt": "2026-02-19T01:16:28.000Z",
    "cachedUntil": "2026-02-19T13:16:28.000Z"
  }
}
```

**Profile fields:**

| Field | Type | Always present | Description |
|---|---|---|---|
| `username` | `string` | ✅ | Login handle |
| `name` | `string` | ❌ | Display name (omitted if null/blank) |
| `type` | `"user" \| "organization"` | ✅ | Account type |
| `providerUserId` | `string` | ✅ | Provider's internal ID |
| `avatarUrl` | `string` | ❌ | Profile avatar URL |
| `providerBaseUrl` | `string` | ❌ | Base URL of the provider instance (e.g. `https://github.com` or a GHE URL) |
| `isVerified` | `boolean` | ✅ | Users: has a public email. Orgs: GitHub-verified badge |
| `createdAt` | `string` | ❌ | ISO 8601 account creation date |
| `location` | `string` | ❌ | Self-reported location |
| `websiteUrl` | `string` | ❌ | Profile website |
| `statistics` | `object` | ❌ | See below |

**`statistics` field** (omitted if data is unavailable):

| Account type | Fields |
|---|---|
| `user` | `{ followers: number, following: number }` |
| `organization` | `{ members: number }` |

**Data array fields:**

| Field | Type | Description |
|---|---|---|
| `key` | `string` | Language identifier, or `"__forks__"` for the forks bucket |
| `label` | `string` | Human-readable label (e.g. `"JavaScript"`, `"Forked repos"`) |
| `value` | `number` | Number of repositories |
| `color` | `string` | Hex color for charts (e.g. `"#f1e05a"`) |

> **Ordering:** sorted by `value` descending. The `__forks__` entry is sorted like any other item and may appear anywhere in the list.

**Metadata fields:**

| Field | Type | Always present | Description |
|---|---|---|---|
| `generatedAt` | `string` | ✅ | ISO 8601 timestamp. On a cache hit: equals `cachedAt`. On a miss: time of the live GitHub fetch. |
| `unit` | `string` | ✅ | Unit for `data[].value` — always `"repos"` |
| `cachedAt` | `string` | ❌ | ISO 8601 timestamp of when the result was cached. Present only when `ENABLE_CACHE=true` and the result was stored/retrieved from cache. |
| `cachedUntil` | `string` | ❌ | ISO 8601 timestamp of when the cache entry expires. Present only when `ENABLE_CACHE=true` and the result was stored/retrieved from cache. |

**Error Response:**
```json
{
  "ok": false,
  "provider": "github",
  "error": {
    "code": "user_not_found",
    "message": "GitHub user or organization 'nobody' not found",
    "details": {},
    "retryAfterSeconds": 60
  },
  "metadata": {
    "generatedAt": "2026-02-19T01:16:28.050Z"
  }
}
```

> `details` and `retryAfterSeconds` are only present on relevant error codes (see table below).

---

### `GET /api/v1/topsearch`

Paginated leaderboard of the most-searched usernames. A record is created (or its hit count incremented) automatically each time a successful search is performed.

**Query Parameters:**

| Parameter | Required | Default | Constraints | Description |
|---|---|---|---|---|
| `provider` | ❌ | `github` | `github`, `gitlab`, `bitbucket` | Filter by provider |
| `limit` | ❌ | `10` | Integer, 1–100 | Max entries to return |
| `offset` | ❌ | `0` | Integer ≥ 0 | Number of entries to skip |

**Success Response (HTTP 200):**
```json
{
  "ok": true,
  "data": [
    {
      "username": "octocat",
      "provider": "github",
      "hit": 42,
      "avatarUrl": "https://avatars.githubusercontent.com/u/1024?v=4",
      "createdAt": "2026-02-01T10:00:00.000Z",
      "updatedAt": "2026-02-19T01:16:28.000Z"
    }
  ],
  "pagination": {
    "total": 150,
    "count": 10,
    "offset": 0,
    "limit": 10
  }
}
```

**Data entry fields:**

| Field | Type | Description |
|---|---|---|
| `username` | `string` | Normalized (lowercase) username |
| `provider` | `string` | Provider the search was made against |
| `hit` | `number` | Total number of times this username has been searched |
| `avatarUrl` | `string \| null` | Avatar from the last successful search (may be `null`) |
| `createdAt` | `string` | ISO 8601 — when this username was first searched |
| `updatedAt` | `string` | ISO 8601 — when the hit count was last incremented |

**Pagination fields:**

| Field | Type | Description |
|---|---|---|
| `total` | `number` | Total records matching the provider filter |
| `count` | `number` | Records in this response page |
| `offset` | `number` | Offset used in this query |
| `limit` | `number` | Limit used in this query |

> **Ordering:** by `hit` descending, then `username` ascending for ties.

> **Always returns HTTP 200**, even when the DB is empty or a DB error occurs — errors return an empty `data: []` with `total: 0`.

---

## Error Codes

| Code | HTTP Status | Endpoint | Description |
|---|---|---|---|
| `validation_error` | 400 | all | Missing/invalid query parameters |
| `user_not_found` | 404 | `/search` | Username doesn't exist on the provider |
| `invalid_token` | 401 | `/search` | Token is missing or invalid |
| `insufficient_scopes` | 403 | `/search` | Token lacks required OAuth scopes |
| `rate_limited` | 403 | `/search` | GitHub rate limit hit — check `retryAfterSeconds` |
| `not_implemented` | 501 | `/search` | Provider exists but isn't supported yet (e.g. `gitlab`) |
| `network_error` | 503 | `/search` | Could not reach the provider |
| `timeout` | 504 | `/search` | Request to provider timed out |

**Rate limit response example:**
```json
{
  "ok": false,
  "provider": "github",
  "error": {
    "code": "rate_limited",
    "message": "GitHub API rate limit exceeded. Please wait before retrying.",
    "retryAfterSeconds": 187
  },
  "metadata": { "generatedAt": "2026-02-19T01:16:28.050Z" }
}
```

**Validation error response example:**
```json
{
  "ok": false,
  "provider": "unknown",
  "error": {
    "code": "validation_error",
    "message": "Invalid query parameters",
    "details": {
      "errors": [
        { "field": "username", "message": "Username is required" }
      ]
    }
  },
  "metadata": { "generatedAt": "2026-02-19T01:16:28.050Z" }
}
```

## Fork Handling

**Important:** This API handles forked repositories differently from GitHub's REST API.

### How It Works

**Forked repositories are counted separately**, not included in language statistics:

```json
{
  "data": [
    { "key": "Go", "value": 15 },           // Non-forked repos only
    { "key": "__forks__", "value": 9 }      // All forks counted here
  ]
}
```

### Why?

This design provides **more accurate statistics** about a user's original work:
- Language counts reflect **repos the user created/owns**
- Forks are tracked separately to show contribution activity
- Prevents inflated statistics from forked repositories

## Docker

```bash
# Build
docker build -t gitlingo-backend .

# Run
docker run -p 3001:3001 \
  -e GITHUB_TOKEN=your_token \
  gitlingo-backend
```

## Project Structure

```
backend/
├── src/
│   ├── domain/           # Business logic & models
│   ├── application/      # Use cases
│   ├── infrastructure/   # GitHub API integration
│   ├── interfaces/       # HTTP controllers & routes
│   ├── shared/           # Utilities & config
│   └── __tests__/        # Unit and integration tests
├── data/                 # SQLite database (auto-created at runtime)
├── Dockerfile
└── package.json
```

## Tech Stack

- **Express** - Web framework
- **TypeScript** - Type safety
- **Zod** - Schema validation
- **@octokit/graphql** - GitHub API client
- **better-sqlite3** - Persistent storage (topsearch leaderboard + result cache)
- **Pino** - Logging
- **Jest** - Testing

## License

MIT
