# Frontend Improvement Tasks

**Total Estimated Time:** 6 hours
**Status:** Planning Phase
**Based on:** `docs/frontend-improvement.md`

## Overview

This task list addresses the critique that the frontend "looks and feels like a prototype" with weak hierarchy and unfinished UX. The goal is to transform it into a polished, professional product within 6 hours of focused work.

**Excluded:** Task #3 from the improvement doc (charts are not product-grade) per user request.

## Task Summary

| # | Task | Priority | Time | Status |
|---|------|----------|------|--------|
| 01 | [Skeleton Loading States](./01-skeleton-loading-states.md) | High | 30min | Pending |
| 02 | [Fixed Footer Position](./02-fixed-footer-position.md) | High | 15min | Pending |
| 03 | [KPI Cards Component](./03-kpi-cards-component.md) | High | 45min | Pending |
| 04 | [Export Dropdown Button](./04-export-dropdown-button.md) | Medium | 45min | Pending |
| 05 | [Smooth Transitions](./05-smooth-transitions.md) | Medium | 30min | Pending |
| 06 | [Toast Notifications](./06-toast-notifications.md) | Medium | 30min | Pending |
| 07 | [Visual Hierarchy Improvements](./07-visual-hierarchy-improvements.md) | High | 45min | Pending |
| 08 | [Search Section Improvements](./08-search-section-improvements.md) | Medium | 30min | Pending |
| 09 | [Loading State Polish](./09-loading-state-polish.md) | Medium | 30min | Pending |
| 10 | [Micro-interactions Polish](./10-micro-interactions-polish.md) | Low | 30min | Pending |

**Total:** 6 hours

## Approach

### Phase 1: Foundation (1.5 hours)
**Fix critical UX issues that make the app feel broken**
- Task 01: Skeleton Loading States
- Task 02: Fixed Footer Position
- Task 03: KPI Cards Component
- Task 07: Visual Hierarchy Improvements

### Phase 2: Enhancement (2 hours)
**Replace problematic patterns with professional alternatives**
- Task 04: Export Dropdown Button
- Task 05: Smooth Transitions
- Task 06: Toast Notifications
- Task 08: Search Section Improvements

### Phase 3: Polish (2.5 hours)
**Add delight and professional touches**
- Task 09: Loading State Polish
- Task 10: Micro-interactions Polish

## Key Principles

1. **Small, incremental changes** - Each task is focused and achievable
2. **Visible impact** - Every task improves user-facing experience
3. **Frontend-only** - No API changes required
4. **Professional aesthetic** - Move from "prototype" to "product"
5. **Maintainable** - Follow existing patterns and conventions

## Success Metrics

**Before:**
- Usability: 6/10
- Aesthetics: 3.5/10
- Delight: 2/10

**Target After:**
- Usability: 8.5/10
- Aesthetics: 7.5/10
- Delight: 7/10

## Dependencies

```
Task 01 → Task 09 (loading states build on skeleton)
Task 05 → Task 08 (transitions needed for search states)
Task 05 → Task 10 (transitions foundation for micro-interactions)
Task 06 → Task 04 (toast notifications for export feedback)
```

## Guidelines

- Follow `CLAUDE.md` principles at all times
- DRY principle - flag repetition aggressively
- Well-tested code is non-negotiable
- Small, incremental, proven changes
- Test one-by-one before moving forward

## Technical Stack Considerations

### Current Stack
- React 19 + TypeScript
- Tailwind CSS v3
- TanStack Query v5
- Chart.js

### Optional Additions (if needed)
- Framer Motion (for transitions - Task 05)
- Lucide React or Heroicons (for consistent icons - Task 03)
- Radix UI primitives (for dropdown - Task 04, if needed)

### Avoid Adding
- Heavy UI libraries (keep bundle size reasonable)
- shadcn/ui (mentioned in doc but too large for 6hr scope)
- Complex state management (keep it simple)

## Notes

- Each task is designed to be completed independently
- Tasks can be done in order or based on priority
- Some tasks have dependencies - check task files for details
- All tasks are frontend-only and require no backend changes
- Focus on making the app feel "3x better" as stated in the improvement doc

## Getting Started

1. Read each task file carefully
2. Understand acceptance criteria
3. Check dependencies
4. Start with Phase 1 (foundation tasks)
5. Test thoroughly after each task
6. Move to next phase when foundation is solid

---

**Last Updated:** 2026-02-15
**Created By:** Claude (based on frontend-improvement.md critique)
