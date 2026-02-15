# Task 5: Smooth Transitions

**Status:** Pending
**Estimated Time:** 30 minutes
**Priority:** Medium

## Problem
Content appears and disappears abruptly. Empty state, loading state, and results state have no smooth transitions, making the app feel janky.

## Goal
Add smooth, professional transitions between states to make the app feel polished and delightful.

## Scope
- Fade-in transition for results appearing
- Smooth transition from empty state to results
- Fade-in for profile card
- Fade-in for chart card (slight delay for stagger effect)
- Smooth fade-out for loading states

## Implementation Details

### Files to Modify
- `frontend/src/features/search/SearchPage.tsx`
- `frontend/src/features/search/components/ResultHeader.tsx`
- `frontend/src/features/charts/components/ChartPanel.tsx`

### Technical Approach
**Option 1: CSS Transitions (Simpler)**
```css
.fade-in {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
```

**Option 2: Framer Motion (Richer)**
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
```

### Acceptance Criteria
- [ ] Results fade in smoothly (300ms duration)
- [ ] Profile card and chart card have staggered entrance (100ms delay)
- [ ] Loading states fade out before results fade in
- [ ] Empty state fades out when starting search
- [ ] Transitions feel smooth, not sluggish or janky
- [ ] No layout shift during transitions

## Technical Notes
- Use `ease-in-out` timing function for natural feel
- Keep transitions short (200-400ms max)
- Consider using Tailwind's animation utilities
- If using Framer Motion, add `framer-motion` dependency
- Ensure transitions don't delay critical content visibility
- Use `prefers-reduced-motion` media query for accessibility

## Success Metrics
- App feels polished and intentional
- Transitions add delight without slowing down UX
- Professional, modern SaaS feel

## Dependencies
None - can use CSS or add framer-motion
