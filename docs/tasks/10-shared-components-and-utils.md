# Phase 3: Shared Components & Utilities

## Overview
Build reusable UI primitives and utilities that will be used across features.

## Tasks

### 3.1 Create shared Button component
**Description:** Build a reusable Button component with variants and states.

**Steps:**
- Create `shared/components/Button.tsx`
- Support variants: primary, secondary, ghost
- Support sizes: sm, md, lg
- Support disabled state
- Support loading state (with spinner)
- Add TypeScript props interface
- Style with Tailwind CSS
- Create Storybook story (optional)

**Props:**
```typescript
type ButtonProps = {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
  children: React.ReactNode
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  className?: string
}
```

**Acceptance Criteria:**
- ✅ All variants render correctly
- ✅ Disabled state prevents clicks
- ✅ Loading state shows spinner
- ✅ Accessible (proper ARIA attributes)
- ✅ Keyboard navigation works
- ✅ Unit test covers all variants

---

### 3.2 Create shared Card component
**Description:** Build a reusable Card component for content containers.

**Steps:**
- Create `shared/components/Card.tsx`
- Support padding variants
- Support shadow variants
- Support hover effect (optional)
- Add TypeScript props interface
- Style with Tailwind CSS

**Props:**
```typescript
type CardProps = {
  padding?: 'none' | 'sm' | 'md' | 'lg'
  shadow?: 'none' | 'sm' | 'md' | 'lg'
  hover?: boolean
  children: React.ReactNode
  className?: string
}
```

**Acceptance Criteria:**
- ✅ Card renders with proper spacing
- ✅ All variants work correctly
- ✅ Responsive on all screen sizes
- ✅ Clean and minimal design
- ✅ Unit test covers all variants

---

### 3.3 Create shared Select component
**Description:** Build a reusable Select/Dropdown component.

**Steps:**
- Create `shared/components/Select.tsx`
- Support label and placeholder
- Support disabled state
- Support error state with message
- Handle onChange events
- Add TypeScript generic for value type
- Style with Tailwind CSS
- Ensure accessibility (labels, ARIA)

**Props:**
```typescript
type SelectProps<T> = {
  label?: string
  placeholder?: string
  value: T
  options: Array<{ value: T; label: string }>
  onChange: (value: T) => void
  disabled?: boolean
  error?: string
  className?: string
}
```

**Acceptance Criteria:**
- ✅ Select renders with options
- ✅ onChange fires with correct value
- ✅ Error state displays message
- ✅ Accessible (label, ARIA)
- ✅ Keyboard navigation works
- ✅ Unit test covers all states

---

### 3.4 Create LoadingState component
**Description:** Build a loading state component with skeleton UI.

**Steps:**
- Create `shared/components/LoadingState.tsx`
- Design skeleton for chart area
- Design skeleton for result header
- Add animated shimmer effect
- Support different variants (chart, list, card)
- Style with Tailwind CSS

**Variants:**
- `chart`: Loading skeleton for chart area
- `search`: Loading skeleton for search results
- `default`: Generic loading spinner

**Acceptance Criteria:**
- ✅ Skeleton displays correctly
- ✅ Animation is smooth
- ✅ Variants match use cases
- ✅ No layout shift when content loads
- ✅ Accessible (ARIA live region)

---

### 3.5 Create ErrorState component
**Description:** Build an error state component for displaying errors.

**Steps:**
- Create `shared/components/ErrorState.tsx`
- Support error types (user_not_found, rate_limited, network_error, generic)
- Display friendly error messages
- Support retry action button
- Support error icon (from icon library)
- Style with Tailwind CSS

**Props:**
```typescript
type ErrorStateProps = {
  code: 'user_not_found' | 'rate_limited' | 'network_error' | 'server_error' | 'generic'
  message: string
  details?: string
  retryAfter?: number
  onRetry?: () => void
}
```

**Acceptance Criteria:**
- ✅ Error messages are user-friendly
- ✅ Retry button works (if provided)
- ✅ Rate limit shows retry timer
- ✅ Accessible (ARIA roles)
- ✅ Unit test covers all error types

---

### 3.6 Create EmptyState component
**Description:** Build an empty state component for no data scenarios.

**Steps:**
- Create `shared/components/EmptyState.tsx`
- Support title and description
- Support icon (optional)
- Support action button (optional)
- Style with Tailwind CSS

**Props:**
```typescript
type EmptyStateProps = {
  title: string
  description?: string
  icon?: React.ReactNode
  action?: {
    label: string
    onClick: () => void
  }
}
```

**Acceptance Criteria:**
- ✅ Empty state renders correctly
- ✅ Action button works (if provided)
- ✅ Design is friendly and inviting
- ✅ Accessible (semantic HTML)
- ✅ Unit test covers component

---

### 3.7 Add unit tests for shared components
**Description:** Create comprehensive unit tests for all shared components.

**Steps:**
- Create test files for each component
- Test all variants and states
- Test user interactions (click, change, etc.)
- Test accessibility features
- Achieve >90% coverage

**Test files:**
- `tests/unit/shared/Button.test.tsx`
- `tests/unit/shared/Card.test.tsx`
- `tests/unit/shared/Select.test.tsx`
- `tests/unit/shared/LoadingState.test.tsx`
- `tests/unit/shared/ErrorState.test.tsx`
- `tests/unit/shared/EmptyState.test.tsx`

**Acceptance Criteria:**
- ✅ All tests pass
- ✅ >90% code coverage for shared components
- ✅ User interactions tested
- ✅ Accessibility tested
- ✅ Tests run fast (<2s total)

---

## Definition of Done
- [ ] All 7 tasks completed
- [ ] All shared components built and styled
- [ ] All components are accessible
- [ ] Unit tests pass with >90% coverage
- [ ] No TypeScript errors
- [ ] Components are reusable and composable

## Dependencies
- Phase 1 (Foundation) must be complete

## Estimated Effort
4-5 hours

## Notes
- Keep components simple and composable
- Follow accessibility best practices (WCAG 2.1)
- Use Tailwind CSS consistently
- Document props with JSDoc
- Consider adding Storybook later for component showcase
