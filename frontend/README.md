# GitLingo Frontend

React + TypeScript frontend for GitLingo - Visualize your GitHub language statistics.

## Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **TanStack Query (React Query)** - Data fetching and caching
- **Chart.js + react-chartjs-2** - Data visualization
- **Vitest** - Unit testing
- **React Testing Library** - Component testing
- **ESLint + Prettier** - Code quality

### Chart Library Decision

We chose **Chart.js** with **react-chartjs-2** for the following reasons:

- ✅ Supports all 3 required chart types (Bar, Pie, Polar Area)
- ✅ Highly customizable and performant
- ✅ Excellent documentation and community support
- ✅ Responsive by default
- ✅ Lightweight bundle size (~60KB gzipped)
- ✅ Active development and maintenance

**Considered alternative:** Recharts (React-native API)

## Getting Started

### Prerequisites

- Node.js >= 24.3.0

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
# Start dev server (http://localhost:5173)
npm run dev

# Run tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Type check
npm run typecheck

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Check formatting
npm run format:check
```

### Build

```bash
# Production build
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
frontend/
├── src/
│   ├── app/          # App entry, providers
│   ├── features/     # Feature modules (search, charts, export)
│   │   └── <feature>/
│   │       ├── components/
│   │       ├── hooks/
│   │       └── utils/
│   ├── shared/       # Reusable components, hooks, styles, utils
│   ├── services/     # API clients
│   ├── contracts/    # API types (mirrors backend)
│   ├── styles/       # Global styles
│   └── test/         # Test utilities and setup
├── tests/
│   ├── unit/         # Unit tests
│   └── integration/  # Integration tests
└── public/           # Static assets
```

## Testing

We use Vitest and React Testing Library for testing:

```bash
# Run tests in watch mode
npm test

# Run tests with coverage
npm run test:coverage
```

## Code Style

- **Formatting**: Prettier (semi: false, singleQuote: true)
- **Linting**: ESLint with React and TypeScript rules
- **Type Safety**: TypeScript strict mode

## Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_BASE_URL=http://localhost:3001
```