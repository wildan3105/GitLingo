# Phase 6: Actions (Download & Share)

## Overview
Implement download chart as image and share to social media functionality.

## Tasks

### 6.1 Implement downloadChart utility
**Description:** Create utility to export chart as PNG image.

**Steps:**
- Create `features/charts/utils/downloadChart.ts`
- Use html2canvas or chart library's built-in export
- Accept chart canvas/element reference
- Generate filename with username, provider, timestamp
- Trigger browser download
- Handle errors gracefully
- Add TypeScript types

**Function signature:**
```typescript
type DownloadOptions = {
  username: string
  provider: string
  chartType: string
  format?: 'png' | 'jpg'
}

async function downloadChart(
  chartElement: HTMLElement,
  options: DownloadOptions
): Promise<void>
```

**Filename format:**
```
gitlingo-{username}-{provider}-{chartType}-{timestamp}.png
Example: gitlingo-octocat-github-bar-20250217.png
```

**Acceptance Criteria:**
- ✅ Chart exports as PNG image
- ✅ Filename includes username and timestamp
- ✅ Download triggers automatically
- ✅ Works on desktop browsers
- ✅ Works on mobile browsers (best effort)
- ✅ Error handling for unsupported browsers

---

### 6.2 Test downloadChart utility
**Description:** Create unit tests for downloadChart utility.

**Steps:**
- Create `tests/unit/features/charts/downloadChart.test.ts`
- Mock canvas APIs
- Test filename generation
- Test download trigger
- Test error handling
- Mock browser download behavior

**Test cases:**
- ✅ Generates correct filename
- ✅ Calls canvas export API
- ✅ Triggers browser download
- ✅ Handles errors gracefully
- ✅ Works with different chart types
- ✅ Includes timestamp in filename

**Acceptance Criteria:**
- ✅ All tests pass
- ✅ 100% coverage for downloadChart.ts
- ✅ Mocks don't trigger actual downloads
- ✅ Tests run fast (<1s)

---

### 6.3 Create buildShareUrl utility
**Description:** Create utility to build shareable URLs for social media.

**Steps:**
- Create `features/share/utils/buildShareUrl.ts`
- Build app URL with query params (username, provider)
- Support different platforms (X/Twitter, Facebook)
- URL-encode parameters
- Add share text/description
- Keep function pure
- Add TypeScript types

**Function signature:**
```typescript
type Platform = 'twitter' | 'facebook'

type ShareData = {
  username: string
  provider: string
  appUrl: string
}

function buildShareUrl(platform: Platform, data: ShareData): string
```

**Platform URLs:**

**Twitter/X:**
```
https://twitter.com/intent/tweet?text={text}&url={url}

Text: "Check out {username}'s programming language stats on GitLingo!"
URL: {appUrl}?username={username}&provider={provider}
```

**Facebook:**
```
https://www.facebook.com/sharer/sharer.php?u={url}

URL: {appUrl}?username={username}&provider={provider}
```

**Acceptance Criteria:**
- ✅ Generates correct Twitter share URL
- ✅ Generates correct Facebook share URL
- ✅ Parameters are URL-encoded
- ✅ Share text is user-friendly
- ✅ Function is pure
- ✅ 100% test coverage

---

### 6.4 Test buildShareUrl utility
**Description:** Create unit tests for buildShareUrl utility.

**Steps:**
- Create `tests/unit/features/share/buildShareUrl.test.ts`
- Test URL generation for both platforms
- Test URL encoding
- Test with special characters in username
- Verify share text format

**Test cases:**
- ✅ Twitter URL format correct
- ✅ Facebook URL format correct
- ✅ Parameters URL-encoded correctly
- ✅ Special characters handled
- ✅ Share text includes username
- ✅ App URL included correctly

**Acceptance Criteria:**
- ✅ All tests pass
- ✅ 100% coverage for buildShareUrl.ts
- ✅ Edge cases covered (special chars)
- ✅ Tests run fast (<1s)

---

### 6.5 Create ShareButtons component
**Description:** Build share buttons for X (Twitter) and Facebook.

**Steps:**
- Create `features/share/components/ShareButtons.tsx`
- Use buildShareUrl utility
- Add X (Twitter) button
- Add Facebook button
- Open share URL in new window
- Add icons for each platform
- Handle click events
- Style with Tailwind CSS
- Make responsive

**Props:**
```typescript
type ShareButtonsProps = {
  username: string
  provider: string
}
```

**Behavior:**
- On click: open share URL in popup window (centered)
- Popup size: 600x400
- Track share click (analytics - optional)

**Acceptance Criteria:**
- ✅ Both share buttons render correctly
- ✅ Clicking opens share URL in popup
- ✅ Popup is centered and sized correctly
- ✅ Icons display correctly
- ✅ Responsive on mobile (use native share if available)
- ✅ Accessible (ARIA labels)

---

### 6.6 Add Download button to ChartPanel
**Description:** Integrate download functionality into ChartPanel.

**Steps:**
- Update `features/charts/components/ChartPanel.tsx`
- Add "Download" button below chart
- Use downloadChart utility
- Get chart element ref
- Pass username, provider, chartType
- Show loading state during export
- Show success message after download
- Handle errors with toast/alert

**Button behavior:**
- Disabled when isLoading or error
- Shows spinner during export
- Success: show brief success message
- Error: show error message with retry

**Acceptance Criteria:**
- ✅ Download button renders below chart
- ✅ Clicking downloads chart as PNG
- ✅ Filename includes username and timestamp
- ✅ Loading state shows during export
- ✅ Success/error feedback shown
- ✅ Button disabled when appropriate

---

### 6.7 Add Share buttons to ChartPanel
**Description:** Integrate share functionality into ChartPanel.

**Steps:**
- Update `features/charts/components/ChartPanel.tsx`
- Add ShareButtons component below chart (next to Download)
- Pass username and provider
- Layout buttons horizontally
- Style consistently with Download button
- Make responsive (stack on mobile if needed)

**Layout:**
```
[Download PNG] [Share on X] [Share on Facebook]
```

**Acceptance Criteria:**
- ✅ Share buttons render below chart
- ✅ Clicking opens share popup
- ✅ Layout is clean and consistent
- ✅ Responsive on mobile
- ✅ Buttons disabled when appropriate

---

### 6.8 Test download and share functionality
**Description:** Create integration tests for download and share features.

**Steps:**
- Create `tests/integration/features/actions.test.tsx`
- Test download button click
- Test share button clicks
- Mock window.open for share
- Mock canvas export for download
- Test error handling
- Test button states (disabled, loading)

**Test cases:**
- ✅ Download button triggers downloadChart
- ✅ Download button disabled when no data
- ✅ Download shows loading state
- ✅ Share buttons open correct URLs
- ✅ Share buttons disabled when no data
- ✅ Download error shows error message
- ✅ Share buttons accessible

**Acceptance Criteria:**
- ✅ All tests pass
- ✅ Download and share thoroughly tested
- ✅ Error paths covered
- ✅ Button states tested
- ✅ >90% coverage for share feature

---

## Definition of Done
- [ ] All 8 tasks completed
- [ ] Download chart as PNG works
- [ ] Share to X/Twitter works
- [ ] Share to Facebook works
- [ ] All utilities tested thoroughly
- [ ] Integration with ChartPanel complete
- [ ] All tests pass with >90% coverage
- [ ] No TypeScript errors

## Dependencies
- Phase 5 (Charts Feature) must be complete
- Phase 3 (Shared Components) must be complete

## Estimated Effort
4-5 hours

## Notes
- Download may not work on all mobile browsers (document limitations)
- Consider native Web Share API for mobile (navigator.share)
- Test on multiple browsers (Chrome, Firefox, Safari)
- Consider adding more platforms later (LinkedIn, Reddit)
- Filename format should be consistent and descriptive
