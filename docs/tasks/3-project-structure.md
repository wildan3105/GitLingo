# Task 3: DDD Project Structure + Domain Layer

## Objective
Setup the DDD folder structure and create provider-neutral domain models.

## Steps

### 1. Create DDD folder structure
```
backend/src/
├── domain/           # Pure business logic, no dependencies
├── application/      # Use cases, orchestration
├── infrastructure/   # External integrations (GitHub, HTTP, etc.)
├── interfaces/       # HTTP layer (controllers, DTOs, routes)
└── shared/          # Shared utilities, types, constants
```

### 2. Create domain models in `src/domain/`

**`src/domain/models/Repository.ts`**
- Repository value object with:
  - `name: string`
  - `language: string | null`
  - `isFork: boolean`

**`src/domain/models/LanguageStatistic.ts`**
- LanguageStatistic with:
  - `key: string` (e.g., "JavaScript")
  - `label: string` (display name)
  - `value: number` (repo count)
  - `color: string` (hex color)

**`src/domain/models/Profile.ts`**
- User profile with:
  - `username: string`
  - `type: 'user' | 'organization'`
  - `providerUserId: string`

### 3. Create provider port in `src/domain/ports/`

**`src/domain/ports/ProviderPort.ts`**
- Interface with:
  - `fetchRepositories(username: string): Promise<Repository[]>`
  - `getProviderName(): string`

### 4. Create shared utilities in `src/shared/`

**`src/shared/constants/languageColors.ts`**
- Export language colors map (from GitHub Linguist)
- At least 20 popular languages (JavaScript, Python, TypeScript, Java, Go, Rust, etc.)

**`src/shared/types/common.ts`**
- Common types like `Provider = 'github' | 'gitlab' | 'bitbucket'`

## Verification
- ✅ All folders created
- ✅ All domain models are pure TypeScript (no external dependencies)
- ✅ ProviderPort interface is provider-agnostic
- ✅ Language colors map has at least 20 languages
- ✅ All files have proper TypeScript types (no `any`)
- ✅ `npm run typecheck` passes
- ✅ `npm run lint` passes
