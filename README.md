# GitLingo

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![codecov](https://codecov.io/github/wildan3105/GitLingo/graph/badge.svg?token=f9E5pnHAm7)](https://codecov.io/github/wildan3105/GitLingo) 
[![CI Backend](https://github.com/wildan3105/GitLingo/actions/workflows/ci-backend.yml/badge.svg)](https://github.com/wildan3105/GitLingo/actions/workflows/ci-backend.yml)
[![CI Frontend](https://github.com/wildan3105/GitLingo/actions/workflows/ci-frontend.yml/badge.svg)](https://github.com/wildan3105/GitLingo/actions/workflows/ci-frontend.yml)
![Node.js](https://img.shields.io/badge/node-%3E%3D24.3.0-brightgreen)

> Visualize your GitHub programming language statistics with beautiful interactive charts

## Demo

![demo.gif]()

### Live Demo

Access the demo [here](https://gitlingo.app)

## Features

| | Feature | Description |
|---|---|---|
| 🔍 | **Username Search** | Search any public GitHub user or organization by username and instantly visualize their programming language distribution. |
| 🏢 | **Private GitHub Enterprise (GHE)** | Works with any self-hosted GHE instance — GitLingo auto-derives the correct profile URLs directly from the API response. (See [here](./backend/README.md) for details on setup) |
| 📊 | **Three Interactive Chart Types** | Switch between Bar, Pie, and Polar Area charts in one click without re-triggering the API or losing your filter state. |
| 🎯 | **Top-N Language Aggregation** | Slice results to Top 10, Top 25, or all detected languages, with overflow automatically folded into a unified "Others" slice. |
| 🔧 | **Fork & Unknown Language Filtering** | Toggle forked repos and repositories with no detected language independently, isolating only the signal that matters. |
| 📈 | **KPI Dashboard** | Four at-a-glance cards — total repositories, top language, unique language count, and language coverage percentage. |
| 🏆 | **Most Searched Leaderboard** | A live community top-9 of the most-searched users or organizations, displayed as clickable one-tap chips on the home screen. |
| 📥 | **PNG & CSV Export** | Download the active chart as a timestamped PNG or export the raw language breakdown as a standards-compliant CSV file. |
| 🔗 | **Shareable Deep Links** | Every search produces a bookmarkable URL (e.g. `/github/octocat`) that auto-executes the search on load. |
| ⚡ | **Server-Side Caching with Freshness Indicator** | Responses are cached server-side and the UI shows a live chip counting down exactly when the data will next refresh. |

## Tech Stack

### Backend
- **Runtime**: Node.js 24+ with TypeScript 5
- **Framework**: Express.js v5
- **Database**: SQLite via better-sqlite3
- **API Client**: @octokit/graphql (GitHub GraphQL API v4)
- **Validation**: Zod v4

### Frontend
- **Framework**: React 19 with TypeScript 5
- **Build Tool**: Vite 7
- **State Management**: TanStack Query v5
- **Charts**: Chart.js v4 with react-chartjs-2
- **Styling**: Tailwind CSS v3

## Quick Start

### Prerequisites

- **Node.js**: v24 or higher — or **Bun**: v1.3.9 or higher
- **GitHub Token**: Personal access token with `read:org, read:user, user:email` scopes
- **Git**: For cloning the repository

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/wildan3105/GitLingo.git
   cd GitLingo
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install   # or: bun install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install   # or: bun install
   ```

4. **Configure environment variables**

   **Backend** (`backend/.env`):
   ```env
   PORT=3001
   NODE_ENV=development
   GITHUB_TOKEN=your_github_personal_access_token
   ALLOWED_ORIGINS=http://localhost:5173
   ENABLE_CACHE=true
   CACHE_TTL_HOURS=12
   ```

   **Frontend** (`frontend/.env`):
   ```env
   VITE_API_BASE_URL=http://localhost:3001
   ```

### Running Locally

You need to run both servers simultaneously:

**Terminal 1 - Backend**:
```bash
cd backend
npm run dev   # or: bun run dev
```
Backend runs on http://localhost:3001

**Terminal 2 - Frontend**:
```bash
cd frontend
npm run dev   # or: bun run dev
```
Frontend runs on http://localhost:5173

### Testing

**Backend Tests**:
```bash
cd backend
npm test              # Run all tests
npm run test:watch   # Watch mode
npm run test:coverage # Coverage report
```

**Frontend Tests**:
```bash
cd frontend
npm test              # Run all tests
npm run test:watch   # Watch mode
npm run test:coverage # Coverage report
```

## Deployment

### Backend Deployment

**Docker**:
```bash
cd backend
docker build -t gitlingo-backend .
docker run -p 3001:3001 --env-file .env gitlingo-backend
```

**Environment Variables**: Ensure all variables from `.env.example` are set in your deployment platform.

### Frontend Deployment

**Build for Production**:
```bash
cd frontend
npm run build       # Creates dist/ folder
npm run preview     # Preview production build locally
```

**Environment Variables**: Set `VITE_API_BASE_URL` to your deployed backend URL.

## Architecture Highlights

### Backend (DDD Architecture)
- **Domain Layer** (`domain/`): Core entities and outbound port interfaces
- **Application Layer** (`application/`): Use cases, service orchestration, inbound ports
- **Infrastructure Layer** (`infrastructure/`): GitHub API provider, SQLite persistence, error handling
- **Interface Layer** (`interfaces/`): HTTP controllers, routes, middleware, request validation
- **Shared Layer** (`shared/`): Config, constants, shared types and utilities

### Frontend (Feature-Based Architecture)
- **App** (`app/`): Root providers and application entry point
- **Feature Modules** (`features/`): Self-contained features — `search`, `charts`, `export`
- **Services** (`services/`): API client and data-fetching layer
- **Contracts** (`contracts/`): API response types and type guards
- **Shared** (`shared/`): Reusable components, hooks, styles, and utilities

## Contributing

Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on how to contribute to this project.

## Similar Projects
- [github-readme-stats](https://github.com/anuraghazra/github-readme-stats) - A popular project that generates GitHub stats as images for README files.
- [github-user-language-breakdown](https://github.com/TraceLD/github-user-language-breakdown
) - A project that provides a breakdown of a GitHub user's languages in a simple format (but looks like the app is no longer maintained and has some issues with the GitHub API).
- [github-profile-languages](https://github.com/IonicaBizau/github-profile-languages) - A project that visualizes the programming languages used in a GitHub profile.

## License

MIT License - see [LICENSE](./LICENSE) file for details