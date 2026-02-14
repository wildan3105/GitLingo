# Phase 1: Foundation & Project Setup

## Overview
Initialize the frontend project with proper tooling, structure, and development environment.

## Tasks

### 1.1 Initialize Vite + React + TypeScript project
**Description:** Create a new Vite project in `/frontend` directory with React and TypeScript template.

**Steps:**
- Run `npm create vite@latest frontend -- --template react-ts`
- Install dependencies
- Verify dev server runs (`npm run dev`)
- Clean up default boilerplate (App.tsx, main.tsx)

**Acceptance Criteria:**
- ✅ Vite dev server starts without errors
- ✅ TypeScript compilation works
- ✅ Hot module replacement (HMR) functional
- ✅ Default boilerplate cleaned up

---

### 1.2 Setup Tailwind CSS + basic theme
**Description:** Add Tailwind CSS for styling with a basic theme configuration.

**Steps:**
- Install Tailwind CSS and dependencies
- Configure `tailwind.config.js` and `postcss.config.js`
- Add Tailwind directives to main CSS file
- Create basic color palette (primary, secondary, error, success)
- Test with a sample styled component

**Acceptance Criteria:**
- ✅ Tailwind utility classes work
- ✅ Custom theme colors accessible
- ✅ No build errors or warnings
- ✅ Dark mode support configured (optional)

---

### 1.3 Setup testing framework (Vitest + React Testing Library)
**Description:** Configure Vitest and React Testing Library for unit and component testing.

**Steps:**
- Install vitest, @testing-library/react, @testing-library/jest-dom
- Configure vitest.config.ts
- Setup test utilities file (test-utils.tsx)
- Add test scripts to package.json
- Create sample test to verify setup

**Acceptance Criteria:**
- ✅ `npm run test` executes tests
- ✅ `npm run test:coverage` generates coverage report
- ✅ Sample test passes
- ✅ React Testing Library renders components

---

### 1.4 Setup ESLint + Prettier + Git hooks
**Description:** Add code quality tools and git hooks for automated checks.

**Steps:**
- Configure ESLint with React and TypeScript rules
- Configure Prettier with formatting rules
- Add husky for git hooks
- Create pre-commit hook (format + lint + typecheck)
- Create pre-push hook (tests + typecheck)
- Add scripts to package.json

**Acceptance Criteria:**
- ✅ ESLint catches TypeScript and React issues
- ✅ Prettier formats code consistently
- ✅ Pre-commit hook auto-fixes issues
- ✅ Pre-push hook runs tests successfully
- ✅ Hooks work without manual intervention

---

### 1.5 Create folder structure
**Description:** Create the feature-based folder structure per spec (simplified).

**Steps:**
- Create `/src/app` (App.tsx, providers.tsx)
- Create `/src/features` (search, charts, share)
- Create `/src/services` (API clients)
- Create `/src/contracts` (API types)
- Create `/src/shared` (components, hooks, utils)
- Create `/src/styles` (globals.css)
- Create `/tests` (unit, integration)
- Add index.ts barrel exports where needed

**Structure:**
```
/frontend/src
  /app
    App.tsx
    providers.tsx
  /features
    /search
      components/
      hooks/
      utils/
    /charts
      components/
      utils/
    /share
  /services
  /contracts
  /shared
    /components
    /hooks
    /utils
  /styles
/tests
  /unit
  /integration
```

**Acceptance Criteria:**
- ✅ All directories created
- ✅ Basic barrel exports work
- ✅ No import path issues
- ✅ Structure matches spec (simplified)

---

## Definition of Done
- [ ] All 5 tasks completed
- [ ] Dev server runs without errors
- [ ] Tests run and pass
- [ ] Git hooks work correctly
- [ ] Folder structure is clean and organized
- [ ] README updated with setup instructions

## Dependencies
None (first phase)

## Estimated Effort
2-3 hours

## Notes
- Keep configuration simple and extensible
- Document any non-standard decisions
- Ensure all team members can run the project after setup
