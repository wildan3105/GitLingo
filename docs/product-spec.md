# GitLingo - Product Specification
## Overview
**GitLingo** is a web application that visualizes Github language statistics for a given user or organization. It displays repository language distribution in a chart format and allow users to download or share the results. 

The long-term vision is to evolve GitLingo from a simple language checker into a generic **version control statistics platform** (i.e. expand from Github to Gitlab and many more).

## Current Capabilities

- Displays language statistics for a GitHub user or organization
- Shows results as a bar chart sorted by repository count (descending)
- Uses official GitHub Linguist language colors (https://github.com/github-linguist/linguist/blob/main/lib/linguist/languages.yml)
- Clicking a bar redirects to the corresponding GitHub language filter
- Chart is downloadable
- Results are shareable via X (Twitter) and Facebook

# Screenshot
See the current display of the app ![here](../screenshot.png)

# Refactoring & Improvement Plan
The goal of this refactoring initiative is to make GitLingo:
- More user-friendly
- More performant
- More scalable
- Easier to maintain
- Ready for future expansion

## 1. Product Improvements

### 1.1 Enter to Search
Restore support for pressing Enter to trigger search.
This previously worked and should behave consistently with standard search UX expectations

### 1.2 Multiple Chart Types
Currently, only bar charts are supported. Add support for:
- Pie
- Radar

This improves flexibility and makes the tool more visually engaging

### 1.3 UI Modernization
Improve overall UI/UX:
- Cleaner layout
- Better spacing and typography
- Clear visual hierarchy
- Improved button styles and interactions
- Support multiple devices (at least desktop, mobile, and tablet)

Proposed stacks:
- Tailwind CSS (with a suitable theme)
- Component-driven UI structure

The interface should feel lightweight, modern, and developer-focused

## 2. Technical Improvements

### 2.1 Performance Optimization
The application currently crashes for users with many repositories. The likely cause is inefficient REST-based data fetching.

Improvement plan:
- Migrate from REST to Github GraphQL API
- Fetch only required fields
- Reduce request count
- Improve pagination handling
- Handle rate-limit more gracefully (show user-friendly error message i.e. retry in X minutes)
- Add caching layer if necessary

Goal: handle high-repo accounts reliably and efficiently

### 2.2 Proper Monorepo Architecture
Although the project is technically full-stack, it lacks clear separation and structure. 

Refactor into a clean monorepo architecture with (example): 

- apps/backend
- apps/frontend
- packages/shared
- Clear separation of concerns
- Independent build pipelines
- Easily deployable to the major cloud service

### 2.3 Testing Strategy
Testing is currently limited and inconsistent.

Refactoring goals:
- separate frontend and backend test suites
- backend:
    - unit tests
    - integration tests
    - API contract tests
- frontend:
    - component tests
    - integration tests
- optional: E2E tests

Testing should follow industry best practices (i.e. fast execution with high coverage for critical functionalities) and enable confident future expansion

### 2.4 Security
Modernize dependencies and frameworks to:
- eliminate known vulnerabilities
- use latest stable versions
- follow secure coding practices
- protect against abuse (rate limits, sanitization, input validation, DDoS, etc.)
- properly handle github tokens (if used)

Security must be considered part of the architecture, not an afterthought.

### 2.5 Local Development Experience
Local setup should be simple and flexible.

Support:
- NPM / yarn for frontend and backend
- Docker-based full environment
- Clear documentation on how to run, debug, test, and deploy
- One-command startup for the whole app where possible

Goal: any contributor should be able to run the project locally in minutes.