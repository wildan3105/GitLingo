# Task 8: Search Section Improvements

**Status:** Pending
**Estimated Time:** 30 minutes
**Priority:** Medium

## Problem
Search section takes up the same amount of space before and after search. It doesn't feel like a hero when empty, and it's too prominent after results are shown.

## Goal
Make search section more impactful before first search (hero mode), and more compact after search (compact mode) to let results shine.

## Scope
- Hero mode: Before first search
  - Larger, centered, prominent
  - Call-to-action feel
  - "Enter a GitHub username to visualize..."

- Compact mode: After first search
  - Smaller, tucked into normal flow
  - Still accessible but not dominant
  - Let results be the focus

## Implementation Details

### Files to Modify
- `frontend/src/features/search/SearchPage.tsx`
- `frontend/src/features/search/components/SearchBar.tsx`

### States
1. **Hero Mode** (`!hasSearched`)
   - Centered container, max-w-2xl
   - Larger text and input fields
   - More vertical padding
   - Clear call-to-action text
   - Maybe gradient background

2. **Compact Mode** (`hasSearched`)
   - Normal flow, max-w-6xl
   - Standard size inputs
   - Less vertical padding
   - Minimal description text

### Acceptance Criteria
- [ ] Hero mode is visually impactful for new users
- [ ] Smooth transition from hero to compact mode
- [ ] Compact mode doesn't compete with results
- [ ] Clear visual separation between search and results
- [ ] Search remains easily accessible in compact mode
- [ ] Responsive on all screen sizes

## Technical Notes
- Use conditional rendering or CSS classes for states
- Transition between states should be smooth (see Task 5)
- Consider keeping search in same position to avoid layout shift
- Hero mode: `py-16 text-center` vs Compact: `py-6 text-left`
- Keep search functionality identical in both modes

## Success Metrics
- New users see clear call-to-action
- After search, focus naturally moves to results
- Professional entry and results experience
- No awkward empty space

## Dependencies
- Task 5 (Smooth Transitions) - for state change animation
