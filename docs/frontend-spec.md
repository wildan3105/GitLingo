# Frontend Specification – GitLingo

> This document describes the **frontend** architecture under the **`/frontend`** directory only.  
> Backend design and API contracts are covered separately.

# Architecture

GitLingo frontend is a TypeScript web application built with a modern, component-driven architecture. It aims for:

- **Responsiveness** (desktop/tablet/mobile)
- **Performance** (fast initial load, efficient rendering)
- **Reliability** (clear loading/error states, resilient networking)
- **Maintainability** (predictable structure, separation of concerns)
- **Extensibility** (support more charts, more providers, more statistics later)

Frontend responsibilities:

- Provide a clean UI for searching accounts
- Call backend `/api/v1/search`
- Render results as selectable chart types (bar/pie/doughnut/radar)
- Support sharing and downloading charts
- Display friendly messages for rate limit / not found / errors

---

## High-Level Flow (Frontend perspective)

1. User types a username and submits (Enter key and Search button)
2. Frontend validates input (basic checks) and triggers request
3. Frontend calls backend: `GET /api/v1/search?username=...&provider=...`
4. UI shows:
   - Loading state
   - Error state (rate-limited / not found / invalid request)
   - Success state (charts + share/download actions)

This mirrors the product flow (rate-limited → friendly retry message; not found → friendly message; success → show chart).

---

## Frontend Directory Structure (TypeScript + React)

Proposed structure inside `/frontend` (No need to follow exactly the same as this. Make the simpler version out of this):

```
/frontend
  /src
    /app
      App.tsx
      routes.ts (optional; simple SPA can skip)
      providers.tsx (query client, theme provider, etc.)
    /features
      /search
        SearchPage.tsx
        components/
          SearchBar.tsx
          ProviderSelect.tsx
          ResultHeader.tsx
          EmptyState.tsx
          ErrorState.tsx
          LoadingState.tsx
        hooks/
          useSearch.ts
        utils/
          validation.ts
      /charts
        ChartPanel.tsx
        ChartTypeSelect.tsx
        charts/
          BarChartView.tsx
          PieChartView.tsx
          DoughnutChartView.tsx
          RadarChartView.tsx
        utils/
          normalizeSeries.ts
          downloadChart.ts
      /share
        ShareButtons.tsx
        buildShareUrl.ts
    /services
      apiClient.ts
      gitlingoApi.ts
    /contracts
      api.ts (shared DTO types; ideally re-exported from monorepo package)
    /styles
      globals.css
    /shared
      components/
        Button.tsx
        Card.tsx
        Select.tsx
        Toast.tsx
      hooks/
        useDebounce.ts (optional)
      utils/
        format.ts
        url.ts
  /tests
    /unit
    /integration
```

### Boundary rules (to keep it maintainable)

- `features/*` owns UI logic and state for that feature.
- `services/*` is the only place that performs HTTP calls.
- `contracts/*` defines request/response shapes (mirrors backend).
- `shared/*` is reusable UI primitives and utilities.

---

# Functional Requirements

## 1. Search UX

- Provide username input with:
  - **Enter to search**
  - Search button
- Provide provider selection (default: `github`)
- Prevent obvious invalid input client-side (e.g., empty username)
- Keep UX consistent across devices (mobile/desktop)

### Acceptance criteria

- Pressing Enter triggers search when input is focused.
- Search button triggers search.
- Provider default is `github`.
- Invalid empty input shows inline message (no request sent).

---

## 2. Result Rendering

On success, frontend must:

- Display profile summary:
  - username
  - type (`user` / `org`)
  - provider name
- Render chart data using the `series` array returned by backend.
- Sort order should follow backend output (do not re-sort unless needed)

---

## 3. Chart Selection

User can switch between chart types:

- Bar (default)
- Pie
- Doughnut
- Radar

### Behavior requirements

- Switching chart types must not trigger a refetch.
- Chart type selection must persist while staying on page (component state is fine).
- Chart views must use the same source data (`series`).

---

## 4. Download Chart

- Provide “Download” action to export chart as image (PNG)
- Download should include:
  - username
  - provider
  - timestamp (optional)
- Works on desktop and mobile browsers (best effort)

---

## 5. Share Result

- Provide share buttons:
  - X (Twitter)
  - Facebook
- Sharing should include:
  - app URL + query params (username/provider) OR a stable share link
- If you later add server-side “share snapshots”, the share implementation should be replaceable (don’t hardcode assumptions).

---

## 6. Error & Empty States

Frontend must handle and display friendly messages for:

- `invalid_request` (e.g., username invalid)
- `user_not_found`
- `rate_limited` (include retry hint when backend provides it)
- `provider_unavailable`
- generic errors

Must also support:

- initial empty state (before any search)
- “no data” state (if series is empty)

---

# Non-Functional Requirements

## 1. Performance

- Fast initial render and interaction
- Avoid unnecessary rerenders (memoize heavy chart components)
- Keep JS bundle lean:
  - lazy-load chart components if needed
- Cache successful responses to avoid repeated fetches for the same query (short TTL is fine)

**Targets**

- Time-to-interactive should feel instant on modern devices
- Chart switching should be near-instant (no refetch)

---

## 2. Reliability

- Always show a clear UI state:
  - idle / loading / success / error
- Network timeouts should show actionable error
- Do not crash on large `series` arrays (even if backend returns many buckets)
- Avoid UI freeze: heavy transforms should be O(n) and minimal

---

## 3. Responsiveness & Accessibility

- Must work well on:
  - Mobile (small screen)
  - Tablet
  - Desktop
- Use responsive layout patterns:
  - single-column on mobile
  - split layout on desktop (search + chart + actions)
- Basic accessibility:
  - keyboard navigation for search + chart selection
  - focus states visible
  - buttons have labels (aria-label for icons)

---

## 4. Maintainability & Testability

- Keep logic testable in isolation:
  - normalize chart data in pure functions
  - keep API calls in `services/`
- Strong typing throughout (TypeScript)
- Keep UI components small and composable

---

# Data Contracts

Frontend must follow backend `/api/v1/search` contract:

- Query params: `username`, `provider`
- Success shape: `{ ok: true, provider, profile, series, meta }`
- Error shape: `{ ok: false, provider, error, meta }`

**Note:** Frontend should treat `series[].key` as stable identifiers (e.g. `__forks__`) and use `label` for display.

---

# UI/UX Guidelines

## Layout

- Top: app title + short description
- Center: Search bar + provider dropdown
- Main: chart panel + chart selection
- Bottom: download + share actions

## States

- Idle: “Search a GitHub username or org”
- Loading: skeleton chart + disabled buttons
- Error: clear message + retry action
- Success: chart + actions enabled

---

# Stacks

TBD (but intended direction)

- React + TypeScript
- Vite
- Tailwind CSS + a theme/component library
- Chart library (should support bar/pie/doughnut/radar)
- Fetching/caching library (optional but recommended)

---

# Testing Strategy

## Unit tests

- `normalizeSeries()` transforms correctly
- `buildShareUrl()` output correct
- input validation utilities

## Component tests

- SearchBar triggers on Enter
- ChartTypeSelect switches chart
- ErrorState renders correct message by error code

## Integration tests

- Mock backend responses:
  - success → chart appears
  - rate_limited → retry message appears
  - user_not_found → not found message appears

(E2E tests optional later.)
