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

- Node.js 24+
- GitHub Personal Access Token (optional but recommended)

### Installation

```bash
# Install dependencies
npm install

# Create .env file (optional)
cp .env.example .env
# Add your GitHub token to .env for higher rate limits
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
curl http://localhost:3001/health

# Get language stats for a user
curl "http://localhost:3001/api/v1/search?username=octocat"
```

## Environment Variables

Create a `.env` file:

```env
PORT=3001
NODE_ENV=development
LOG_LEVEL=info

# GitHub Token (OPTIONAL - see note below)
GITHUB_TOKEN=your_token_here
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
GRAPHQL_URL=https://ghe.rakuten-it.com/api
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

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Run production build
npm test             # Run tests
npm run lint         # Check code quality
```

## API Endpoints

### `GET /health`

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "uptime": 123.45,
  "timestamp": "2026-02-14T..."
}
```

### `GET /api/v1/search?username=<username>`

Get language statistics for a GitHub user.

**Query Parameters:**
- `username` (required): GitHub username or organization

**Success Response:**
```json
{
  "ok": true,
  "provider": "github",
  "profile": {
    "username": "octocat",
    "type": "user",
    "avatarUrl": "https://avatars.githubusercontent.com/u/583231?v=4",
    "websiteUrl": "https://github.com/octocat"
  },
  "data": [
    {
      "key": "JavaScript",
      "label": "JavaScript",
      "value": 10,
      "color": "#f1e05a"
    }
  ],
  "metadata": {
    "generatedAt": "2026-02-14T...",
    "unit": "repos",
    "limit": 10
  }
}
```

**Error Response:**
```json
{
  "ok": false,
  "error": {
    "code": "user_not_found",
    "message": "User not found"
  }
}
```

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `validation_error` | 400 | Invalid query parameters |
| `user_not_found` | 404 | GitHub user not found |
| `rate_limited` | 429 | API rate limit exceeded |
| `timeout` | 504 | Request timeout (>90s) |
| `network_error` | 503 | Network issues |
| `provider_error` | 500 | GitHub API error |

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
│   └── shared/          # Utilities & config
├── Dockerfile
└── package.json
```

## Tech Stack

- **Express** - Web framework
- **TypeScript** - Type safety
- **Zod** - Schema validation
- **@octokit/graphql** - GitHub API client
- **Pino** - Logging
- **Jest** - Testing

## License

MIT
