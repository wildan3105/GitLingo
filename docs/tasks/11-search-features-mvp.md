# Phase 4: Search Feature (First MVP)

## Overview
Build the search feature with input validation, provider selection, and search trigger functionality.

## Tasks

### 4.1 Create SearchBar component with validation
**Description:** Build the main search input component with client-side validation.

**Steps:**
- Create `features/search/components/SearchBar.tsx`
- Add text input for username
- Add Enter key handler
- Add client-side validation:
  - Non-empty username
  - Valid GitHub username format (alphanumeric + hyphens)
  - Max length 39 characters
- Display inline validation errors
- Handle loading state (disable during search)
- Style with Tailwind CSS

**Props:**
```typescript
type SearchBarProps = {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  isLoading?: boolean
  error?: string
}
```

**Validation rules:**
- Username must not be empty
- Username must match: `/^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?$/`
- Show inline error on blur if invalid
- Prevent submit if validation fails

**Acceptance Criteria:**
- ✅ Input renders correctly
- ✅ Enter key triggers onSubmit
- ✅ Validation prevents invalid submissions
- ✅ Inline errors display correctly
- ✅ Loading state disables input
- ✅ Accessible (label, ARIA)

---

### 4.2 Create ProviderSelect component
**Description:** Build provider selection dropdown (currently only GitHub, but extensible).

**Steps:**
- Create `features/search/components/ProviderSelect.tsx`
- Use shared Select component from Phase 3
- Support provider options: github (gitlab, bitbucket - disabled)
- Default to 'github'
- Display disabled state for unimplemented providers
- Add tooltip for coming soon providers (optional)
- Style with Tailwind CSS

**Props:**
```typescript
type ProviderSelectProps = {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}
```

**Provider options:**
```typescript
const PROVIDERS = [
  { value: 'github', label: 'GitHub', disabled: false },
  { value: 'gitlab', label: 'GitLab (Coming soon)', disabled: true },
  { value: 'bitbucket', label: 'Bitbucket (Coming soon)', disabled: true },
]
```

**Acceptance Criteria:**
- ✅ Select renders with providers
- ✅ GitHub is default and enabled
- ✅ Other providers are disabled
- ✅ onChange fires correctly
- ✅ Accessible (label, ARIA)

---

### 4.3 Create validation utility
**Description:** Create pure functions for input validation.

**Steps:**
- Create `features/search/utils/validation.ts`
- Implement `validateUsername(username: string)` function
- Return validation result with error message
- Add JSDoc comments
- Keep function pure and testable

**Function signature:**
```typescript
type ValidationResult = {
  isValid: boolean
  error?: string
}

function validateUsername(username: string): ValidationResult
```

**Validation logic:**
- Empty: "Username is required"
- Too short: "Username is too short"
- Too long: "Username must be 39 characters or less"
- Invalid format: "Username can only contain alphanumeric characters and hyphens"
- Valid: `{ isValid: true }`

**Acceptance Criteria:**
- ✅ Function is pure (no side effects)
- ✅ All validation cases covered
- ✅ Error messages are user-friendly
- ✅ 100% test coverage
- ✅ JSDoc comments added

---

### 4.4 Create useSearch hook
**Description:** Create custom hook for search state management and API calls.

**Steps:**
- Create `features/search/hooks/useSearch.ts`
- Integrate with React Query
- Manage search state (username, provider)
- Handle form submission
- Call gitlingoApi service
- Return search state and handlers
- Handle validation before API call

**Hook signature:**
```typescript
type UseSearchReturn = {
  username: string
  setUsername: (value: string) => void
  provider: string
  setProvider: (value: string) => void
  handleSearch: () => void
  isLoading: boolean
  error: ErrorResponse | null
  data: SuccessResponse | null
  validationError: string | null
}

function useSearch(): UseSearchReturn
```

**Acceptance Criteria:**
- ✅ Hook manages all search state
- ✅ Validation runs before API call
- ✅ API call triggered on handleSearch
- ✅ Loading/error/data states exposed
- ✅ React Query integration works
- ✅ Hook is testable

---

### 4.5 Test search feature (Enter key, button, validation)
**Description:** Create comprehensive tests for search functionality.

**Steps:**
- Create `tests/unit/features/search/validation.test.ts`
- Create `tests/unit/features/search/useSearch.test.ts`
- Create `tests/unit/features/search/SearchBar.test.tsx`
- Create `tests/unit/features/search/ProviderSelect.test.tsx`
- Test all validation rules
- Test Enter key trigger
- Test button click trigger
- Test API integration (mocked)
- Test error states

**Test cases:**

**validation.test.ts:**
- ✅ Empty username returns error
- ✅ Invalid format returns error
- ✅ Too long username returns error
- ✅ Valid username returns isValid: true

**SearchBar.test.tsx:**
- ✅ Input value changes on type
- ✅ Enter key calls onSubmit
- ✅ Validation error displays
- ✅ Loading state disables input
- ✅ Accessible (label, ARIA)

**ProviderSelect.test.tsx:**
- ✅ Default value is 'github'
- ✅ onChange fires with correct value
- ✅ Disabled providers cannot be selected
- ✅ Accessible (label, ARIA)

**useSearch.test.ts:**
- ✅ Initial state is correct
- ✅ setUsername updates state
- ✅ handleSearch validates before API call
- ✅ handleSearch calls API with correct params
- ✅ API error updates error state
- ✅ API success updates data state

**Acceptance Criteria:**
- ✅ All tests pass
- ✅ >90% coverage for search feature
- ✅ Enter key behavior tested
- ✅ Validation thoroughly tested
- ✅ API integration tested (mocked)

---

## Definition of Done
- [ ] All 5 tasks completed
- [ ] SearchBar and ProviderSelect components working
- [ ] Validation logic implemented and tested
- [ ] useSearch hook manages state correctly
- [ ] All tests pass with >90% coverage
- [ ] Enter key and button both trigger search
- [ ] No TypeScript errors

## Dependencies
- Phase 2 (API Contracts & Services) must be complete
- Phase 3 (Shared Components) must be complete

## Estimated Effort
4-5 hours

## Notes
- This is the first user-facing feature (MVP)
- Keep validation on client-side lightweight (backend validates too)
- Focus on UX: clear error messages, instant feedback
- Ensure keyboard navigation works perfectly
