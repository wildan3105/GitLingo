# Task 5: Application Layer (Use Case)

## Objective
Implement the search statistics use case that orchestrates the domain logic.

## Steps

### 1. Create search service in `src/application/services/`

**`src/application/services/SearchService.ts`**
- Constructor accepts `ProviderPort` (dependency injection)
- Method: `searchLanguageStatistics(username: string, provider: Provider): Promise<SearchResult>`
- Orchestrates:
  1. Fetch repositories from provider
  2. Aggregate by language
  3. Count repos per language
  4. Add language colors from shared constants
  5. Handle forks (include in special "__forks__" category)
  6. Sort by value (repo count) descending
  7. Return structured result

### 2. Create result types in `src/application/types/`

**`src/application/types/SearchResult.ts`**
- `SearchResult` type matching API contract from backend-spec.md:
  - `ok: boolean`
  - `provider: string`
  - `profile: Profile`
  - `series: LanguageStatistic[]`
  - `metadata: { generatedAt, unit, limit }`

**`src/application/types/SearchError.ts`**
- `SearchError` type matching error contract:
  - `ok: false`
  - `provider: string`
  - `error: { code, message, details }`
  - `meta: { generatedAt }`

### 3. Business logic

- Aggregate repositories by language
- Exclude repos without a language (or categorize as "Unknown")
- Count forked repos separately (key: "__forks__", color: "#ededed")
- Apply language colors from shared constants
- Fallback color for unknown languages: "#cccccc"
- Sort series by value (descending)

### 4. Error transformation

- Catch `ProviderError` and transform to `SearchError`
- Map error codes appropriately
- Include helpful error messages

## Verification
- ✅ SearchService is testable (accepts ProviderPort via DI)
- ✅ Aggregation logic is correct
- ✅ Forks are counted and categorized
- ✅ Language colors are applied
- ✅ Results are sorted by count (descending)
- ✅ Error transformation works
- ✅ Types match API contract exactly
- ✅ `npm run typecheck` passes
- ✅ `npm run lint` passes

## Testing (Optional for this task)
- Unit test SearchService with mocked ProviderPort
- Verify aggregation logic with test data
- Verify error transformation
