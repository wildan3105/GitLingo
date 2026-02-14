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

- Node.js 20+
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
    "type": "user"
  },
  "series": [
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
| `network_error` | 503 | Network issues |
| `provider_error` | 500 | GitHub API error |

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
