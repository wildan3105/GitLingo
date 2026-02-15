# Task 9: Loading State Polish

**Status:** Pending
**Estimated Time:** 30 minutes
**Priority:** Medium

## Problem
Loading indicators are basic. There are layout shifts during loading. The experience doesn't feel cohesive across all loading scenarios.

## Goal
Create a consistent, polished loading experience across all states: initial load, search, chart switching, export actions.

## Scope
- Improve search input loading indicator
- Consistent loading patterns across components
- No layout shifts during any loading state
- Professional loading animations
- Loading state for all async actions

## Implementation Details

### Files to Modify
- `frontend/src/features/search/components/SearchBar.tsx`
- `frontend/src/shared/components/LoadingState.tsx`
- `frontend/src/features/charts/components/ChartPanel.tsx`

### Loading Patterns to Implement
1. **Search Loading**
   - Subtle spinner in input field (right side)
   - Input slightly dimmed
   - Button disabled but visible

2. **Results Loading**
   - Skeleton components (Task 1)
   - Fade-in when loaded (Task 5)
   - Maintain all spacing

3. **Chart Switching**
   - Quick fade transition
   - No skeleton needed (too fast)
   - Smooth chart swap

4. **Export Actions**
   - Button shows loading state briefly
   - Toast notification (Task 6)
   - No page-level loading

### Acceptance Criteria
- [ ] All loading states have consistent styling
- [ ] No layout shifts during any loading transition
- [ ] Loading indicators are appropriate for duration (spinner vs skeleton)
- [ ] All async actions show loading feedback
- [ ] Loading states are accessible (aria-live, aria-busy)
- [ ] Smooth transitions between states

## Technical Notes
- Use `aria-busy="true"` during loading
- Ensure focus management during loading
- Loading spinners should be 16-20px, subtle color
- Keep loading indicators close to the action
- Don't show skeleton for actions < 500ms
- Prevent double-clicks during loading

## Success Metrics
- Users always know when app is working
- No jarring transitions or layout jumps
- Professional, cohesive loading experience
- Clear feedback for all async operations

## Dependencies
- Task 1 (Skeleton Loading) - base skeleton components
- Task 5 (Smooth Transitions) - transition animations
- Task 6 (Toast Notifications) - for action feedback
