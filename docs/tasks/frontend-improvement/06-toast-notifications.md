# Task 6: Toast Notifications

**Status:** Pending
**Estimated Time:** 30 minutes
**Priority:** Medium

## Problem
Success feedback (download, copy, share) is either inline or uses temporary button text changes. This is not consistent and can be missed by users.

## Goal
Implement a proper toast notification system for success/error feedback.

## Scope
- Create reusable toast notification component
- Show toast for export actions (download, copy link, etc.)
- Show toast for errors if helpful
- Auto-dismiss after 3-4 seconds
- Support different types: success, error, info

## Implementation Details

### Files to Create
- `frontend/src/shared/components/Toast.tsx`
- `frontend/src/shared/hooks/useToast.tsx` (context + hook)

### Files to Modify
- `frontend/src/app/providers.tsx` (add ToastProvider)
- `frontend/src/features/charts/components/ChartPanel.tsx`
- Any component that needs success/error feedback

### Component Requirements
```typescript
type ToastType = 'success' | 'error' | 'info'

type Toast = {
  id: string
  type: ToastType
  message: string
  duration?: number
}

// Usage
const { showToast } = useToast()
showToast({ type: 'success', message: 'Chart downloaded!' })
```

### Acceptance Criteria
- [ ] Toast component with success/error/info variants
- [ ] Context provider for global toast state
- [ ] Auto-dismiss after 3-4 seconds (configurable)
- [ ] Support manual dismiss (X button)
- [ ] Multiple toasts stack properly
- [ ] Fade in/out animations
- [ ] Positioned fixed (top-right or bottom-right)
- [ ] Accessible with aria-live

## Technical Notes
- Use React Context + Reducer for state management
- Position: `fixed top-4 right-4 z-50` (or bottom-right)
- Max width: 320-400px
- Stack multiple toasts with gap
- Use Tailwind for styling variants
- Consider icons: check circle (success), X circle (error), info circle (info)
- Ensure keyboard dismissible (Escape key)

## Success Metrics
- Users get clear feedback for actions
- Professional, modern notification system
- Consistent feedback across the app

## Dependencies
None - standalone component system
