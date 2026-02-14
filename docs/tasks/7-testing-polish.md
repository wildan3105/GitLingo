# Task 7: Testing & Final Polish

## Objective
Add comprehensive tests, finalize documentation, and prepare for deployment.

## Steps

### 1. Setup test configuration

**`src/__tests__/setup.ts`**
- Test setup and teardown
- Mock environment variables

**Update `package.json`**
- Add test scripts:
  - `"test": "jest"`
  - `"test:watch": "jest --watch"`
  - `"test:coverage": "jest --coverage"`

**Install test dependencies (if not already)**
```bash
npm install -D jest ts-jest @types/jest
```

**Create `jest.config.js`**
- TypeScript support with ts-jest
- Coverage thresholds (>80%)
- Test match patterns

### 2. Unit tests

**`src/__tests__/unit/SearchService.test.ts`**
- Test aggregation logic with mocked provider
- Test language counting
- Test fork categorization
- Test sorting
- Test error transformation

**`src/__tests__/unit/GitHubAdapter.test.ts`** (with nock)
- Mock GitHub GraphQL responses
- Test successful fetch
- Test user not found
- Test rate limiting
- Test network errors

### 3. Integration tests

**`src/__tests__/integration/search.test.ts`** (with supertest)
- Test `GET /api/v1/search?username=octocat`
- Test successful response format
- Test validation errors
- Test 404 for unknown users
- Test rate limiting (if feasible)
- Mock GitHub API with nock

### 4. Update documentation

**Update `backend/README.md`**
- Add test section with coverage report
- Add example .env file
- Add deployment notes

**Create `backend/.env.example`**
```env
PORT=3001
NODE_ENV=development
GITHUB_TOKEN=
LOG_LEVEL=info
```

### 5. Add npm scripts for production

**Update `package.json`**
```json
"scripts": {
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage",
  "prebuild": "npm run lint && npm run typecheck",
  "postbuild": "echo 'Build successful!'"
}
```

### 6. Docker support (optional but recommended)

**Create `Dockerfile`**
- Multi-stage build
- Node 20 Alpine
- Production dependencies only
- Non-root user

**Create `.dockerignore`**
- Exclude node_modules, dist, .git, etc.

### 7. CI/CD preparation

**Create `.github/workflows/backend-ci.yml`** (optional)
- Run on backend changes
- Install dependencies
- Lint, typecheck, test
- Build

## Verification
- ✅ All unit tests pass
- ✅ All integration tests pass
- ✅ Test coverage >80%
- ✅ README is comprehensive
- ✅ .env.example is provided
- ✅ Docker builds successfully (if implemented)
- ✅ `npm run build` succeeds
- ✅ Production build runs: `npm start`
- ✅ No console errors in production mode
- ✅ All linting passes
- ✅ All type checks pass

## Manual E2E Test
```bash
# Build and run production
npm run build
npm start

# Test in another terminal
curl http://localhost:3001/health
curl "http://localhost:3001/api/v1/search?username=octocat"

# Verify:
# - Response matches API contract
# - Language colors are correct
# - Repos are aggregated properly
# - Forks are categorized
# - Sorted by count descending
```

## Success Criteria
- 🎯 MVP is feature-complete per backend-spec.md
- 🎯 API contract matches specification exactly
- 🎯 All tests pass with >80% coverage
- 🎯 Can successfully fetch stats for any GitHub user
- 🎯 Error handling is robust and user-friendly
- 🎯 Ready for frontend integration
