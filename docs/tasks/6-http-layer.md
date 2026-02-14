# Task 6: HTTP Layer (Express Server + API)

## Objective
Create the Express server with routes, controllers, middleware, and validation.

## Steps

### 1. Setup Express server in `src/index.ts`

- Initialize Express app
- Setup middleware:
  - `helmet()` - security headers
  - `cors()` - CORS support
  - `express.json()` - JSON body parsing
  - `pinoHttp()` - request logging
  - `rateLimit()` - rate limiting (100 req/15min per IP)
- Mount routes
- Error handling middleware
- Graceful shutdown handling
- Start server on `PORT` from env (default: 3001)

### 2. Create request validation in `src/interfaces/validation/`

**`src/interfaces/validation/searchSchema.ts`**
- Zod schema for search query params:
  - `username`: string, required, min 1 char, max 39 chars, pattern: `[A-Za-z0-9-]+`
  - `provider`: string, optional, default "github", enum: ["github", "gitlab", "bitbucket"]
- Export validation middleware function

### 3. Create controller in `src/interfaces/controllers/`

**`src/interfaces/controllers/SearchController.ts`**
- Constructor accepts `SearchService` (DI)
- Method: `search(req, res, next)`
- Validate query params with Zod
- Call SearchService
- Return JSON response (success or error)
- Handle validation errors (400)
- Handle application errors (4xx/5xx based on error type)
- Proper HTTP status codes:
  - 200: Success
  - 400: Invalid input
  - 404: User not found
  - 429: Rate limited
  - 500: Server error

### 4. Create routes in `src/interfaces/routes/`

**`src/interfaces/routes/searchRoutes.ts`**
- `GET /api/v1/search` -> SearchController.search
- Apply validation middleware

**`src/interfaces/routes/index.ts`**
- Mount all routes
- Health check endpoint: `GET /health` (returns 200 + uptime)

### 5. Create DTOs in `src/interfaces/dto/`

**`src/interfaces/dto/SearchResponseDto.ts`**
- Maps `SearchResult` to API response format
- Maps `SearchError` to error response format

### 6. Error handling middleware

**`src/interfaces/middleware/errorHandler.ts`**
- Global error handler
- Catches unhandled errors
- Logs with pino
- Returns sanitized error response (no stack traces in production)
- Returns 500 for unknown errors

### 7. Environment configuration

**`src/shared/config/env.ts`**
- Load and validate environment variables:
  - `PORT` (default: 3001)
  - `NODE_ENV` (development/production)
  - `GITHUB_TOKEN` (optional)
  - `LOG_LEVEL` (default: info)
- Export typed config object

## Verification
- ✅ Express server starts successfully
- ✅ Health check endpoint works: `GET /health`
- ✅ Search endpoint works: `GET /api/v1/search?username=octocat`
- ✅ Validation rejects invalid usernames
- ✅ CORS headers present
- ✅ Security headers present (helmet)
- ✅ Rate limiting works (test with multiple requests)
- ✅ Pino logs requests
- ✅ Errors return proper HTTP status codes
- ✅ Error responses don't leak stack traces
- ✅ `npm run typecheck` passes
- ✅ `npm run lint` passes

## Manual Testing
```bash
# Start server
npm run dev

# Test health check
curl http://localhost:3001/health

# Test search
curl "http://localhost:3001/api/v1/search?username=octocat"

# Test invalid input
curl "http://localhost:3001/api/v1/search?username="

# Test unknown user
curl "http://localhost:3001/api/v1/search?username=thisuserdoesnotexist123456789"
```
