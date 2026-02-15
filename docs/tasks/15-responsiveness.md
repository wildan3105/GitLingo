# Phase 8: Responsiveness & Accessibility

## Overview
Ensure the application works well on all devices and is accessible to all users.

## Tasks

### 8.1 Implement responsive layout for mobile
**Description:** Optimize layout for mobile devices (< 640px).

**Steps:**
- Test current layout on mobile viewport
- Adjust SearchBar width (full width on mobile)
- Stack provider select below search bar
- Optimize chart size for small screens
- Stack action buttons vertically
- Test on real mobile devices
- Use responsive Tailwind utilities

**Mobile layout (< 640px):**
```
┌───────────────────┐
│  GitLingo         │
│  Description      │
├───────────────────┤
│  [Username Input] │
│  [Provider Select]│
│  [Search Button]  │
├───────────────────┤
│                   │
│  [Chart]          │
│                   │
├───────────────────┤
│  [Download]       │
│  [Share X]        │
│  [Share FB]       │
└───────────────────┘
```

**Acceptance Criteria:**
- ✅ Layout adapts to mobile viewport
- ✅ All controls are touch-friendly (min 44px)
- ✅ Charts are readable on small screens
- ✅ No horizontal scrolling
- ✅ Buttons stack appropriately
- ✅ Text is legible (min 16px)

---

### 8.2 Implement responsive layout for tablet
**Description:** Optimize layout for tablet devices (640px - 1024px).

**Steps:**
- Test current layout on tablet viewport
- Use 2-column layout where appropriate
- Search bar and provider side-by-side
- Chart takes more horizontal space
- Action buttons horizontal
- Test on real tablet devices
- Use responsive Tailwind utilities

**Tablet layout (640px - 1024px):**
```
┌─────────────────────────────────────┐
│  GitLingo                           │
│  Visualize your GitHub stats        │
├─────────────────────────────────────┤
│  [Username Input] [Provider] [Search]│
├─────────────────────────────────────┤
│                                     │
│          [Chart - Wider]            │
│                                     │
├─────────────────────────────────────┤
│  [Download] [Share X] [Share FB]    │
└─────────────────────────────────────┘
```

**Acceptance Criteria:**
- ✅ Layout uses available space effectively
- ✅ Controls are touch-friendly
- ✅ Charts are appropriately sized
- ✅ No awkward gaps or overlaps
- ✅ Transitions smoothly from mobile

---

### 8.3 Implement responsive layout for desktop
**Description:** Optimize layout for desktop devices (> 1024px).

**Steps:**
- Test current layout on desktop viewport
- Use multi-column layout
- Maximize chart size
- Action buttons horizontal with spacing
- Consider sidebar for controls (optional)
- Test on various desktop resolutions
- Use responsive Tailwind utilities

**Desktop layout (> 1024px):**
```
┌─────────────────────────────────────────────┐
│  GitLingo                                   │
│  Visualize your GitHub language statistics  │
├─────────────────────────────────────────────┤
│  [Username Input] [Provider▼] [Search]      │
├─────────────────────────────────────────────┤
│                                             │
│              [Chart - Full Width]           │
│                                             │
├─────────────────────────────────────────────┤
│  [Download PNG]    [Share on X] [Share FB]  │
└─────────────────────────────────────────────┘
```

**Acceptance Criteria:**
- ✅ Layout uses screen space effectively
- ✅ Charts are large and readable
- ✅ Controls are appropriately sized
- ✅ White space is balanced
- ✅ Looks professional and polished

---

### 8.4 Add keyboard navigation
**Description:** Ensure all interactive elements are keyboard accessible.

**Steps:**
- Test Tab key navigation through all controls
- Ensure logical tab order
- Add visible focus states
- Ensure Enter key submits form
- Ensure Escape key closes modals/popups
- Add skip-to-content link (optional)
- Test with keyboard only (no mouse)

**Keyboard shortcuts to support:**
- **Tab**: Navigate between controls
- **Shift+Tab**: Navigate backwards
- **Enter**: Submit search, activate buttons
- **Escape**: Clear focus, close modals
- **Space**: Activate buttons

**Acceptance Criteria:**
- ✅ All controls reachable via keyboard
- ✅ Tab order is logical
- ✅ Focus states are clearly visible
- ✅ Enter submits search
- ✅ No keyboard traps
- ✅ Focus management works correctly

---

### 8.5 Add focus states and ARIA labels
**Description:** Improve accessibility with proper focus states and ARIA attributes.

**Steps:**
- Add visible focus rings (not browser default)
- Add ARIA labels to all interactive elements
- Add ARIA roles where appropriate
- Add ARIA live regions for dynamic content
- Add alt text for any images/icons
- Test with screen reader (VoiceOver/NVDA)

**ARIA labels to add:**
- SearchBar: aria-label="Search for GitHub username"
- ProviderSelect: aria-label="Select provider"
- Search button: aria-label="Search"
- Chart type buttons: aria-label="View as [bar/pie/radar] chart"
- Download button: aria-label="Download chart as image"
- Share buttons: aria-label="Share on [Twitter/Facebook]"

**ARIA live regions:**
- Loading state: aria-live="polite" aria-busy="true"
- Error messages: role="alert"
- Success messages: aria-live="polite"

**Acceptance Criteria:**
- ✅ Focus states visible on all controls
- ✅ All buttons have ARIA labels
- ✅ Screen reader announces states correctly
- ✅ Loading states announced
- ✅ Errors announced as alerts
- ✅ No accessibility violations (run axe)

---

### 8.6 Test responsive layouts
**Description:** Comprehensive testing of responsive behavior.

**Steps:**
- Test on various viewport sizes (320px - 1920px)
- Test on real devices (iOS, Android, tablets)
- Test orientation changes (portrait/landscape)
- Test with browser zoom (100% - 200%)
- Verify no horizontal scrolling
- Verify no overflow issues
- Take screenshots for documentation

**Viewports to test:**
- 320px (iPhone SE)
- 375px (iPhone 12)
- 390px (iPhone 14)
- 768px (iPad)
- 1024px (iPad Pro)
- 1366px (Laptop)
- 1920px (Desktop)

**Acceptance Criteria:**
- ✅ Layout works on all viewport sizes
- ✅ No horizontal scrolling on any size
- ✅ Touch targets are appropriately sized
- ✅ Text is legible at all sizes
- ✅ Charts scale appropriately
- ✅ No visual bugs or overlaps

---

### 8.7 Test keyboard navigation
**Description:** Comprehensive testing of keyboard accessibility.

**Steps:**
- Navigate entire app with keyboard only
- Verify tab order is logical
- Test all keyboard shortcuts
- Test with screen reader
- Run automated accessibility tests
- Document any keyboard shortcuts

**Tools to use:**
- Chrome DevTools Accessibility panel
- axe DevTools extension
- WAVE browser extension
- Lighthouse accessibility audit
- Screen reader (VoiceOver on Mac, NVDA on Windows)

**Test scenarios:**
- ✅ Complete search using only keyboard
- ✅ Switch chart types with keyboard
- ✅ Download chart with keyboard
- ✅ Navigate error states with keyboard
- ✅ Focus trapped in modals (if any)
- ✅ Focus returns correctly after actions

**Acceptance Criteria:**
- ✅ All functionality accessible via keyboard
- ✅ Tab order is logical
- ✅ Focus states always visible
- ✅ No keyboard traps
- ✅ Screen reader experience is good
- ✅ axe reports no violations

---

### 8.8 Run accessibility audits
**Description:** Run automated accessibility tests and fix issues.

**Steps:**
- Run Lighthouse accessibility audit (aim for 100)
- Run axe DevTools scan
- Run WAVE evaluation
- Fix all critical and serious issues
- Document any non-critical issues
- Add accessibility testing to CI (optional)

**Audits to run:**
- **Lighthouse**: aim for score > 95
- **axe DevTools**: 0 violations
- **WAVE**: 0 errors, minimize alerts
- **Manual testing**: screen reader, keyboard

**Common issues to check:**
- Missing alt text
- Missing ARIA labels
- Insufficient color contrast
- Missing focus states
- Improper heading hierarchy
- Missing form labels
- Missing landmark regions

**Acceptance Criteria:**
- ✅ Lighthouse accessibility score > 95
- ✅ axe DevTools reports 0 violations
- ✅ WAVE reports 0 errors
- ✅ All issues documented or fixed
- ✅ App passes WCAG 2.1 Level AA

---

## Definition of Done
- [ ] All 8 tasks completed
- [ ] Responsive on mobile, tablet, desktop
- [ ] Keyboard navigation works perfectly
- [ ] Focus states visible and consistent
- [ ] ARIA labels added to all controls
- [ ] Lighthouse accessibility score > 95
- [ ] axe DevTools reports 0 violations
- [ ] Screen reader experience is good
- [ ] Tested on real devices

## Dependencies
- Phase 7 (Integration) must be complete
- All previous phases should be complete for thorough testing

## Estimated Effort
4-5 hours

## Notes
- Accessibility is not optional - it's essential
- Test with real assistive technologies
- Don't rely only on automated tools
- Mobile testing should include real devices, not just emulators
- Consider touch targets: minimum 44x44px
- Color contrast ratios: 4.5:1 for text, 3:1 for UI components
- Document any known accessibility limitations
