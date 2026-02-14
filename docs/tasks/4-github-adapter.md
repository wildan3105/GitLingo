# Task 4: GitHub GraphQL Adapter (Infrastructure)

## Objective
Implement the GitHub provider adapter using GraphQL API.

## Steps

### 1. Create GitHub adapter in `src/infrastructure/providers/`

**`src/infrastructure/providers/GitHubGraphQLAdapter.ts`**
- Implements `ProviderPort` interface
- Uses `@octokit/graphql` to fetch repositories
- GraphQL query should fetch:
  - User/org repositories (name, primaryLanguage, isFork)
  - Pagination handling (first 100 repos, then paginate if needed)
  - Only required fields (no N+1 queries)
- Maps GitHub response to domain `Repository[]` models
- Handles errors gracefully:
  - User not found
  - Rate limiting
  - Network errors
  - Invalid responses

### 2. Create GitHub types in `src/infrastructure/providers/types/`

**`src/infrastructure/providers/types/GitHubTypes.ts`**
- GraphQL response types
- GitHub-specific interfaces (don't leak to domain)

### 3. Handle rate limiting

- Detect GitHub rate limit errors
- Return structured error with retry info
- Log rate limit warnings

### 4. Error handling

**`src/infrastructure/errors/ProviderError.ts`**
- Custom error class for provider failures
- Error codes: `USER_NOT_FOUND`, `RATE_LIMITED`, `NETWORK_ERROR`, `PROVIDER_ERROR`
- Include retry information when applicable

## Verification
- ✅ GitHubGraphQLAdapter implements ProviderPort
- ✅ GraphQL query is efficient (only required fields)
- ✅ Pagination works for accounts with >100 repos
- ✅ Error handling covers all cases
- ✅ Rate limiting detected and handled
- ✅ No domain models leak into infrastructure
- ✅ All types are explicit (no `any`)
- ✅ `npm run typecheck` passes
- ✅ `npm run lint` passes

## Testing
- Create a simple test file to verify adapter can fetch repos for a known user (e.g., "octocat")
- Test with environment variable for GitHub token (optional, but increases rate limit)
