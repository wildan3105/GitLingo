# Phase 2: API Contracts & Services

## Overview
Define API contracts and create service layer for communication with backend.

## Tasks

### 2.1 Define API contracts (contracts/api.ts)
**Description:** Create TypeScript types that mirror the backend API response/request shapes.

**Steps:**
- Create `contracts/api.ts`
- Define `SearchQuery` type (username, provider)
- Define `SuccessResponse` type (ok, provider, profile, series, metadata)
- Define `ErrorResponse` type (ok, provider, error, meta)
- Define `ApiResponse` discriminated union
- Define `LanguageSeries`, `Profile`, `ErrorDetail` types
- Add JSDoc comments for documentation

**Types to create:**
```typescript
// Query
type SearchQuery = { username: string; provider: string }

// Success
type SuccessResponse = {
  ok: true
  provider: string
  profile: Profile
  series: LanguageSeries[]
  metadata: Metadata
}

// Error
type ErrorResponse = {
  ok: false
  provider: string
  error: ErrorDetail
  meta: Meta
}

// Union
type ApiResponse = SuccessResponse | ErrorResponse
```

**Acceptance Criteria:**
- ✅ All backend response shapes defined
- ✅ Discriminated union works (ok: true/false)
- ✅ Types match backend-spec.md exactly
- ✅ JSDoc comments added
- ✅ No `any` types used

---

### 2.2 Create base API client (services/apiClient.ts)
**Description:** Create a base HTTP client for making API requests.

**Steps:**
- Create `services/apiClient.ts`
- Implement base fetch wrapper with error handling
- Add timeout support (30s default)
- Add request/response logging (dev only)
- Handle network errors gracefully
- Export configured client instance

**Features:**
- Base URL from environment variable
- Timeout support
- Error transformation
- TypeScript generics for responses

**Acceptance Criteria:**
- ✅ Fetch wrapper handles errors properly
- ✅ Timeout works as expected
- ✅ Network errors return user-friendly messages
- ✅ Base URL configurable via env
- ✅ TypeScript types enforced

---

### 2.3 Create GitLingo API service (services/gitlingoApi.ts)
**Description:** Create service for GitLingo-specific API calls.

**Steps:**
- Create `services/gitlingoApi.ts`
- Implement `searchLanguageStatistics(username, provider)` function
- Use API client from 2.2
- Return typed `ApiResponse`
- Handle query parameter encoding
- Add error transformation

**Signature:**
```typescript
async function searchLanguageStatistics(
  username: string,
  provider: string = 'github'
): Promise<ApiResponse>
```

**Acceptance Criteria:**
- ✅ Function returns proper ApiResponse type
- ✅ Query params encoded correctly
- ✅ Errors transformed to ErrorResponse
- ✅ Default provider is 'github'
- ✅ Function is pure and testable

---

### 2.4 Setup React Query for fetching/caching
**Description:** Configure React Query (TanStack Query) for data fetching and caching.

**Steps:**
- Install @tanstack/react-query
- Create `app/providers.tsx` with QueryClientProvider
- Configure QueryClient with sensible defaults:
  - staleTime: 5 minutes
  - cacheTime: 10 minutes
  - retry: 1
  - refetchOnWindowFocus: false
- Add React Query DevTools (dev only)
- Wrap App in QueryClientProvider

**Acceptance Criteria:**
- ✅ React Query installed and configured
- ✅ QueryClientProvider wraps app
- ✅ DevTools available in development
- ✅ Cache configuration matches requirements
- ✅ No console warnings

---

### 2.5 Test API service with mocked responses
**Description:** Create unit tests for API service with mocked fetch.

**Steps:**
- Create `tests/unit/services/gitlingoApi.test.ts`
- Mock global fetch
- Test success response
- Test error responses (404, 429, 500, network error)
- Test timeout behavior
- Test query param encoding

**Test cases:**
- ✅ Success: returns SuccessResponse
- ✅ 404: returns ErrorResponse with user_not_found
- ✅ 429: returns ErrorResponse with rate_limited
- ✅ 500: returns ErrorResponse with server_error
- ✅ Network error: returns ErrorResponse with network_error
- ✅ Timeout: returns ErrorResponse with timeout

**Acceptance Criteria:**
- ✅ All test cases pass
- ✅ 100% coverage for gitlingoApi.ts
- ✅ Mocks properly reset between tests
- ✅ No real network calls made
- ✅ Tests run fast (<1s total)

---

## Definition of Done
- [ ] All 5 tasks completed
- [ ] API contracts match backend exactly
- [ ] API service fully tested
- [ ] React Query configured and working
- [ ] No TypeScript errors
- [ ] All tests pass with good coverage

## Dependencies
- Phase 1 (Foundation) must be complete

## Estimated Effort
3-4 hours

## Notes
- Keep API contracts in sync with backend
- Use environment variables for API URLs
- Mock all external dependencies in tests
- Document any deviations from backend contracts
