# Task 3: KPI Cards Component

**Status:** Pending
**Estimated Time:** 45 minutes
**Priority:** High

## Problem
Information hierarchy is weak. Everything is a big white card with same visual weight. The profile card doesn't show key metrics at a glance.

## Goal
Create KPI (Key Performance Indicator) cards to show quick stats that help users understand the data immediately.

## Scope
Create a row of KPI cards showing:
1. **Repositories Analyzed** - Total count of repos
2. **Top Language** - Most used language with count
3. **Languages Detected** - Total unique languages
4. **Forks Percentage** - % of repos that are forks (if > 0)

## Implementation Details

### Files to Create
- `frontend/src/shared/components/KPICard.tsx` - Reusable KPI card component

### Files to Modify
- `frontend/src/features/search/SearchPage.tsx` - Add KPI row after profile

### Component Props
```typescript
type KPICardProps = {
  label: string
  value: string | number
  subtitle?: string
  icon?: ReactNode
  color?: 'primary' | 'success' | 'warning' | 'secondary'
}
```

### Acceptance Criteria
- [ ] KPI cards show 3-4 metrics in a responsive row
- [ ] Cards are visually lighter than main content (smaller, subtle)
- [ ] Data is calculated from existing API response
- [ ] Responsive: stack on mobile, row on desktop
- [ ] Professional, data-dashboard aesthetic

## Technical Notes
- Calculate metrics from existing `series` data
- Top language: Find item with highest value
- Total languages: Count of series items (excluding forks)
- Forks %: Find __forks__ item, calculate percentage
- Use subtle colors and good typography hierarchy
- Consider icons from lucide-react or heroicons

## Success Metrics
- Users can understand key stats at a glance
- Improves information hierarchy
- Looks professional and intentional

## Dependencies
None - uses existing API data
