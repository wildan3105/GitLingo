# Task 4: Export Dropdown Button

**Status:** Pending
**Estimated Time:** 45 minutes
**Priority:** Medium

## Problem
Big "Share on X / Facebook" buttons are visually louder than the insight. They feel like random growth hacks stapled onto a dashboard, not intentional features. Dev audience doesn't use Facebook sharing.

## Goal
Replace social share buttons with a single, professional "Export" dropdown button with multiple export options.

## Scope
- Remove individual Twitter and Facebook buttons
- Create single "Export" dropdown button
- Include options:
  - Download PNG (existing functionality)
  - Copy Link (share current URL with username)
  - Download CSV (language data as CSV)
  - Copy as Image (optional, may need clipboard API)

## Implementation Details

### Files to Create
- `frontend/src/shared/components/Dropdown.tsx` (or use existing pattern)
- `frontend/src/features/export/utils/exportToCSV.ts`

### Files to Modify
- `frontend/src/features/charts/components/ChartPanel.tsx`

### Files to Remove
- `frontend/src/features/share/` (entire directory, unless needed for URL building)

### Acceptance Criteria
- [ ] Single "Export" button replaces share buttons
- [ ] Dropdown opens on click with 3-4 options
- [ ] Download PNG works (reuse existing functionality)
- [ ] Copy Link copies shareable URL to clipboard
- [ ] Download CSV exports language data
- [ ] Toast notification on successful export
- [ ] Button is secondary/subtle, not visually dominant

## Technical Notes
- Use proper dropdown with click-outside handling
- CSV format: Language, Repositories, Percentage
- Copy Link: `${window.location.origin}?user=${username}&provider=${provider}`
- Use Clipboard API for copy operations
- Add keyboard navigation (Escape to close, Arrow keys to navigate)
- Ensure dropdown is accessible

## Success Metrics
- Export actions feel professional and intentional
- Visual hierarchy improved (export is secondary)
- More useful export options for dev audience

## Dependencies
- Task 6 (Toast Notifications) - for success feedback
