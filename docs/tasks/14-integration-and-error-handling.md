# Phase 7: Integration & Error Handling

## Overview
Integrate all features into SearchPage and implement comprehensive error handling.

## Tasks

### 7.1 Create SearchPage component
**Description:** Build the main page that integrates search, charts, and actions.

**Steps:**
- Create `features/search/SearchPage.tsx`
- Integrate SearchBar component
- Integrate ProviderSelect component
- Integrate ChartPanel component
- Integrate ShareButtons and Download
- Use useSearch hook for state management
- Handle all UI states (idle, loading, success, error)
- Add app header and description
- Style with Tailwind CSS
- Make responsive

**Page layout:**
```
┌─────────────────────────────────────┐
│  GitLingo                           │
│  Visualize your GitHub stats        │
├─────────────────────────────────────┤
│  [Username Input] [Provider] [Search]│
├─────────────────────────────────────┤
│                                     │
│  [Chart Panel or Empty/Error State] │
│                                     │
├─────────────────────────────────────┤
│  [Download] [Share X] [Share FB]    │
└─────────────────────────────────────┘
```

**UI States:**
- **Idle**: Show empty state with "Search a GitHub username"
- **Loading**: Show loading skeleton
- **Success**: Show chart panel with data
- **Error**: Show error state with retry button

**Acceptance Criteria:**
- ✅ All components integrated correctly
- ✅ State management works end-to-end
- ✅ All UI states render correctly
- ✅ Layout is clean and intuitive
- ✅ Responsive on mobile/tablet/desktop
- ✅ No prop drilling (use context if needed)

---

### 7.2 Create ResultHeader component
**Description:** Build component to display profile summary above chart.

**Steps:**
- Create `features/search/components/ResultHeader.tsx`
- Display username
- Display account type (User/Organization)
- Display provider badge
- Display total repositories count
- Style with Tailwind CSS
- Make responsive

**Props:**
```typescript
type ResultHeaderProps = {
  profile: Profile
  totalRepos: number
  provider: string
}
```

**Display format:**
```
octocat (User) • GitHub • 125 repositories
```

**Acceptance Criteria:**
- ✅ Profile info displays correctly
- ✅ Account type labeled clearly
- ✅ Provider badge visible
- ✅ Repository count shows
- ✅ Responsive layout
- ✅ Accessible (semantic HTML)

---

### 7.3 Implement error state for user_not_found
**Description:** Create user-friendly error display for user not found.

**Steps:**
- Use ErrorState component from Phase 3
- Create specific error message for user_not_found
- Suggest checking spelling
- Add retry button
- Style with Tailwind CSS

**Error message:**
```
User Not Found

We couldn't find a GitHub user or organization with the username "xyz".

Please check the spelling and try again.

[Try Again]
```

**Acceptance Criteria:**
- ✅ Error displays when user not found
- ✅ Message is clear and helpful
- ✅ Retry button clears error and refocuses input
- ✅ Accessible (ARIA roles)

---

### 7.4 Implement error state for rate_limited
**Description:** Create user-friendly error display for rate limiting.

**Steps:**
- Use ErrorState component from Phase 3
- Create specific error message for rate_limited
- Display retry_after_seconds if provided
- Show countdown timer (optional)
- Add retry button (disabled until timer expires)
- Style with Tailwind CSS

**Error message:**
```
Rate Limit Exceeded

GitHub's API rate limit has been reached.

Please try again in 60 seconds.

[Retry in 60s]
```

**Acceptance Criteria:**
- ✅ Error displays when rate limited
- ✅ Retry time shown if provided
- ✅ Countdown timer updates (optional)
- ✅ Retry button enabled after wait time
- ✅ Message is clear and helpful

---

### 7.5 Implement error state for network_error
**Description:** Create user-friendly error display for network errors.

**Steps:**
- Use ErrorState component from Phase 3
- Create specific error message for network_error
- Suggest checking internet connection
- Add retry button
- Style with Tailwind CSS

**Error message:**
```
Connection Error

Unable to connect to the server.

Please check your internet connection and try again.

[Retry]
```

**Acceptance Criteria:**
- ✅ Error displays when network error occurs
- ✅ Message is clear and helpful
- ✅ Retry button works
- ✅ Accessible (ARIA roles)

---

### 7.6 Implement error state for server_error
**Description:** Create user-friendly error display for generic server errors.

**Steps:**
- Use ErrorState component from Phase 3
- Create specific error message for server_error
- Suggest trying again later
- Add retry button
- Don't expose technical details
- Style with Tailwind CSS

**Error message:**
```
Something Went Wrong

The server encountered an error while processing your request.

Please try again in a moment.

[Retry]
```

**Acceptance Criteria:**
- ✅ Error displays for generic server errors
- ✅ Message is user-friendly (no technical jargon)
- ✅ Retry button works
- ✅ No sensitive information leaked
- ✅ Accessible (ARIA roles)

---

### 7.7 Implement error state for timeout
**Description:** Create user-friendly error display for timeout errors.

**Steps:**
- Use ErrorState component from Phase 3
- Create specific error message for timeout
- Suggest the account may be large
- Add retry button
- Style with Tailwind CSS

**Error message:**
```
Request Timed Out

The request took too long to complete. This can happen with large accounts.

Please try again.

[Retry]
```

**Acceptance Criteria:**
- ✅ Error displays when timeout occurs
- ✅ Message explains why timeout might happen
- ✅ Retry button works
- ✅ Accessible (ARIA roles)

---

### 7.8 Test all error states
**Description:** Create comprehensive tests for all error scenarios.

**Steps:**
- Create `tests/integration/features/search/SearchPage.test.tsx`
- Mock API responses for each error type
- Test each error state renders correctly
- Test retry button functionality
- Test error recovery (retry after error)
- Test error message content

**Test cases:**
- ✅ user_not_found displays correct message
- ✅ rate_limited displays with retry time
- ✅ network_error displays correct message
- ✅ server_error displays correct message
- ✅ timeout displays correct message
- ✅ Retry button clears error
- ✅ Retry button triggers new search
- ✅ Error state accessible
- ✅ Error doesn't crash app

**Acceptance Criteria:**
- ✅ All error states tested
- ✅ Retry functionality tested
- ✅ Error recovery tested
- ✅ >90% coverage for error handling
- ✅ All tests pass

---

### 7.9 Test SearchPage integration
**Description:** Create integration tests for complete user flows.

**Steps:**
- Create `tests/integration/SearchPage.test.tsx`
- Mock API service
- Test complete search flow (search → loading → success)
- Test error flow (search → loading → error → retry)
- Test chart switching after successful search
- Test download after successful search
- Test share after successful search
- Test input validation before search

**User flows to test:**

**Happy path:**
1. User enters username
2. User clicks Search (or presses Enter)
3. Loading state appears
4. Success state appears with chart
5. User switches chart types
6. User downloads chart
7. User shares to social media

**Error recovery:**
1. User enters username
2. Search returns error
3. Error state appears
4. User clicks Retry
5. Search succeeds
6. Success state appears

**Validation:**
1. User enters invalid username
2. Validation error appears
3. Search not triggered
4. User fixes username
5. Search succeeds

**Acceptance Criteria:**
- ✅ Happy path works end-to-end
- ✅ Error recovery works
- ✅ Validation prevents bad requests
- ✅ Chart switching doesn't refetch
- ✅ Download works after success
- ✅ Share works after success
- ✅ >90% coverage for SearchPage
- ✅ All integration tests pass

---

## Definition of Done
- [ ] All 9 tasks completed
- [ ] SearchPage integrates all features
- [ ] All error states implemented
- [ ] ResultHeader displays profile info
- [ ] Error messages are user-friendly
- [ ] Retry functionality works for all errors
- [ ] Integration tests pass with >90% coverage
- [ ] No TypeScript errors
- [ ] End-to-end user flow works smoothly

## Dependencies
- Phase 4 (Search Feature) must be complete
- Phase 5 (Charts Feature) must be complete
- Phase 6 (Actions) must be complete
- Phase 3 (Shared Components) must be complete

## Estimated Effort
5-6 hours

## Notes
- This is a critical phase - everything comes together here
- Focus on error messages: they should be helpful, not technical
- Test thoroughly with all error scenarios
- Consider adding error boundary for React errors
- Test on real backend API (not just mocks)
