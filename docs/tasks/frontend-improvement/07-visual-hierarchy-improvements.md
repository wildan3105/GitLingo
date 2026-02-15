# Task 7: Visual Hierarchy Improvements

**Status:** ✅ Completed
**Estimated Time:** 45 minutes
**Priority:** High

## Problem
Everything is a big white card with the same visual weight. The chart area doesn't feel like the "main event." Page looks generic like a "dashboard template from 2018."

## Goal
Improve visual hierarchy so users immediately understand what's important: the chart is the star, profile is supporting context, actions are secondary.

## Scope
- Reduce visual weight of less important cards
- Make chart area more prominent and engaging
- Improve spacing and sizing relationships
- Create clear visual hierarchy: Profile < KPIs < Chart > Actions

## Implementation Details

### Files to Modify
- `frontend/src/features/search/SearchPage.tsx`
- `frontend/src/shared/components/Card.tsx` (may need variants)
- `frontend/src/features/charts/components/ChartPanel.tsx`

### Visual Weight Strategy
1. **Profile Card**: Lighter, compact
   - Smaller padding
   - Subtle border or no shadow
   - Less prominent background

2. **KPI Cards**: Minimal, data-focused
   - Small, clean cards
   - Light background
   - Tight spacing

3. **Chart Card**: The hero
   - Larger padding
   - Stronger shadow or border
   - More breathing room
   - Prominent positioning

4. **Action Buttons**: Secondary
   - Smaller, subtle
   - Right-aligned or bottom-aligned
   - Not visually competing with content

### Acceptance Criteria
- [x] Chart area is visually dominant (prominent variant + larger size)
- [x] Profile and KPIs provide context without competing (subtle variant)
- [x] Clear hierarchy: users' eyes flow naturally to the chart
- [x] Better spacing between sections (8 units base + 12 units before chart)
- [x] Professional, modern aesthetic with clear visual weight
- [x] Card variants implemented (subtle, default, prominent)

## Technical Notes
- Create Card variants: `subtle`, `default`, `prominent`
- Use consistent spacing scale: 4, 6, 8, 12, 16, 24 (Tailwind units)
- Profile card: `bg-white/50 border shadow-sm` (lighter)
- Chart card: `bg-white border-2 shadow-lg` (prominent)
- Consider subtle gradients or depth effects for chart area
- Ensure contrast ratios still meet WCAG AA

## Success Metrics
- Visual hierarchy is immediately clear
- Chart feels like the main content
- Page looks modern and intentional
- Users know where to look first

## Dependencies
- Task 3 (KPI Cards) - to implement proper hierarchy
