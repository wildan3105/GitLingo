# GitLingo

> Visualize your GitHub programming language statistics with beautiful interactive charts

GitLingo is a full-stack web application that analyzes GitHub user repositories and visualizes their programming language distribution through interactive charts. Built with modern web technologies and following domain-driven design principles.

![GitLingo Screenshot](./docs/screenshots/current-state.png)

## Features

- **GitHub User Search** - Search any GitHub username or organization
- **Multiple Chart Types** - Visualize data with Bar, Pie, Doughnut, and Radar charts
- **Interactive Visualizations** - Built with Chart.js for smooth, responsive charts
- **Share Results** - Share your language stats on X (Twitter) and Facebook
- **Download Charts** - Export your charts as PNG images
- **Error Handling** - Comprehensive error handling with user-friendly messages
- **Rate Limit Handling** - Automatic retry with countdown for GitHub API rate limits
- **Responsive Design** - Works seamlessly on desktop and mobile devices
- **Accessibility** - WCAG 2.1 Level AA compliant

## Tech Stack

### Backend
- **Runtime**: Node.js 22+ (Bun supported)
- **Framework**: Express.js with TypeScript
- **Architecture**: Domain-Driven Design (DDD)
- **API**: GitHub GraphQL API v4
- **Validation**: Zod for runtime type checking
- **Testing**: Jest with 100% coverage

### Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **State Management**: TanStack Query v5 (React Query)
- **Charts**: Chart.js with react-chartjs-2
- **Styling**: Tailwind CSS v3
- **Testing**: Vitest + React Testing Library
- **Accessibility**: WCAG 2.1 Level AA

## Project Structure

```
github-langs/                # Root (monorepo)
├── backend/                 # Express.js API server
│   ├── src/
│   │   ├── application/    # Use cases and orchestration
│   │   ├── domain/         # Business logic and entities
│   │   ├── infrastructure/ # External services (GitHub API)
│   │   └── interfaces/     # HTTP controllers and routes
│   └── README.md           # Backend documentation
├── frontend/                # React application
│   ├── src/
│   │   ├── features/       # Feature modules (search, charts, share)
│   │   ├── shared/         # Shared components and utilities
│   │   └── contracts/      # API contracts and types
│   └── README.md           # Frontend documentation
└── docs/                    # Project documentation
    ├── product-spec.md     # Product requirements
    ├── backend-spec.md     # Backend technical spec
    └── frontend-spec.md    # Frontend technical spec
```

## Quick Start

### Prerequisites

- **Node.js**: v22 or higher (or Bun)
- **GitHub Token**: Personal access token with `read:user` and `repo` scopes
- **Git**: For cloning the repository

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/wildan3105/github-langs.git
   cd github-langs
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   # or
   bun install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Configure environment variables**

   **Backend** (`backend/.env`):
   ```env
   PORT=3001
   NODE_ENV=development
   GITHUB_TOKEN=your_github_personal_access_token
   GITHUB_API_URL=https://api.github.com/graphql
   ALLOWED_ORIGINS=http://localhost:5173
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
npm run dev        # Development with nodemon
# or
bun run dev        # Development with Bun
```
Backend runs on http://localhost:3001

**Terminal 2 - Frontend**:
```bash
cd frontend
npm run dev        # Development with Vite HMR
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

## API Endpoints

### `GET /api/v1/language-stats/:username`

Fetch language statistics for a GitHub user.

**Query Parameters**:
- `provider` (optional): Platform provider (default: `github`)

**Response**:
```json
{
  "success": true,
  "data": {
    "profile": {
      "username": "octocat",
      "name": "The Octocat",
      "avatarUrl": "https://avatars.githubusercontent.com/u/583231",
      "profileUrl": "https://github.com/octocat"
    },
    "series": [
      {
        "name": "JavaScript",
        "value": 15,
        "color": "#f1e05a"
      }
    ]
  }
}
```

**Error Codes**:
- `user_not_found` - User doesn't exist
- `rate_limited` - GitHub API rate limit exceeded
- `network_error` - Network/connectivity issues
- `server_error` - Internal server error
- `validation_error` - Invalid request parameters

See [backend/README.md](./backend/README.md) for detailed API documentation.

## Deployment

### Backend Deployment

**Docker**:
```bash
cd backend
docker build -t gitlingo-backend .
docker run -p 3001:3001 --env-file .env gitlingo-backend
```

**Platform Recommendations**:
- Railway.app (recommended)
- Render.com
- Fly.io
- AWS ECS/Fargate

**Environment Variables**: Ensure all variables from `.env.example` are set in your deployment platform.

### Frontend Deployment

**Build for Production**:
```bash
cd frontend
npm run build       # Creates dist/ folder
npm run preview     # Preview production build locally
```

**Platform Recommendations**:
- Vercel (recommended)
- Netlify
- Cloudflare Pages
- AWS S3 + CloudFront

**Environment Variables**: Set `VITE_API_BASE_URL` to your deployed backend URL.

## Development Workflow

1. **Read the specs first**:
   - [docs/product-spec.md](./docs/product-spec.md) - Product requirements
   - [docs/backend-spec.md](./docs/backend-spec.md) - Backend technical spec
   - [docs/frontend-spec.md](./docs/frontend-spec.md) - Frontend technical spec

2. **Follow coding guidelines**:
   - DRY principle - flag repetition aggressively
   - Well-tested code is non-negotiable
   - Handle edge cases thoughtfully
   - Explicit over clever

3. **Make incremental changes**:
   - Small, proven changes
   - Test one-by-one before committing
   - Confirm before making changes

4. **Run tests before pushing**:
   ```bash
   # Backend
   cd backend && npm test

   # Frontend
   cd frontend && npm test
   ```

## Documentation

- **[Product Specification](./docs/product-spec.md)** - Features, goals, and improvements
- **[Backend Specification](./docs/backend-spec.md)** - Architecture, API contracts, testing
- **[Frontend Specification](./docs/frontend-spec.md)** - Component architecture, state management
- **[Backend README](./backend/README.md)** - Backend setup and API details
- **[Frontend README](./frontend/README.md)** - Frontend setup and development

## Architecture Highlights

### Backend (DDD Architecture)
- **Domain Layer**: Business logic, validation rules, entities
- **Application Layer**: Use cases, service orchestration
- **Infrastructure Layer**: GitHub API client, external services
- **Interface Layer**: HTTP controllers, routes, middleware

### Frontend (Feature-Based Architecture)
- **Feature Modules**: search, charts, share, download
- **Shared Components**: reusable UI components
- **Contracts**: API types and response schemas
- **State Management**: React Query for server state

## Performance Optimizations

- **Frontend**:
  - React.memo for chart components
  - useMemo for expensive calculations
  - React Query caching (5 min stale, 10 min cache)
  - Vite code splitting and lazy loading

- **Backend**:
  - GraphQL query optimization
  - Error handling without retry storms
  - CORS configuration for security
  - Structured logging

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following the coding guidelines
4. Run tests (`npm test` in both backend and frontend)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## License

MIT License - see [LICENSE](./LICENSE) file for details

## Support

For issues, questions, or contributions:
- Open an issue on GitHub
- Check existing documentation in `docs/`
- Review backend and frontend READMEs for specific details

---

Made with ♥ using Chart.js and React
