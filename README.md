# Tech Library

Tech Library is a modular, source-backed reference for modern web, app, and systems development. English entries are the canonical source texts; Danish and future languages are revision-bound translations with explicit English fallback. Official-source monitoring proposes changes; a human editor always reviews them before publication.

## Included

- 32 curated starter topics across web, frontend, backend, data, mobile/desktop, DevOps, testing/observability, and security
- faceted browsing and SQLite FTS5 search
- immutable revisions, publication pointers, rollback, and claim-level provenance
- integrated editorial workspace with secure session and CSRF protection
- Danish/English UI and content selection without translating source code or established technical terms
- dark-first discovery interface built from local shadcn/ui primitives and Radix accessibility foundations
- simple reader registration/login with private topic favorites
- idempotent monitoring of official sources with a daily scheduler and manual trigger
- installable React/Vite PWA, Fastify API, SQLite/Drizzle data layer, and independent worker
- Docker Compose deployment, health checks, persistent data, backup and restore guidance

## Quick start

Requirements: Node.js 22+ and npm 10+.

```powershell
npm install
npm run db:migrate
npm run db:seed
$env:ADMIN_PASSWORD_HASH = npm run --silent password:hash -w @tech-library/api -- "development password"
$env:SESSION_SECRET = "replace-this-with-a-long-random-development-secret"
npm run dev
```

Open `http://localhost:5173`. The API runs on port 3001. Local content is stored under `data/` and is intentionally ignored by Git.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Run web, API, and source worker |
| `npm run check` | Type-check, test, and build every workspace |
| `npm run db:migrate` | Apply idempotent SQLite migrations |
| `npm run db:seed` | Add the curated starter catalog |
| `docker compose up -d --build` | Build and run the production topology |

The Compose stack listens on host port `8000` by default. Copy `.env.example` to `.env` and change `HOST_PORT` plus `WEB_ORIGIN` when another port or public origin is required.

## Repository structure

```text
apps/web       React, Vite, shadcn/ui + Radix, TanStack Query, Zustand, PWA
apps/api       Fastify REST API, editorial policy, authentication
apps/worker    Official-source monitoring and structured findings
packages/contracts  Shared Zod schemas and public TypeScript types
packages/database   Drizzle schema, migrations, seed catalog
deploy         Reverse-proxy configuration
docs           Architecture decisions and operations
scripts        Backup and restore helpers
```

See [architecture](docs/architecture.md) and [operations](docs/operations.md) for system boundaries and production guidance.

## Editorial flow

1. The worker fetches enabled official sources and normalizes volatile page content.
2. A new fingerprint produces one deduplicated finding; failures only update source health.
3. An administrator reviews the source and creates an immutable draft revision.
4. A revision must be approved before it can be published.
5. Publication updates the active pointer and search index in one transaction; rollback selects a prior approved revision.

## Development policy

Use short feature branches and focused Conventional Commits. Tests and documentation belong in the same change as the behavior they describe. Comments should explain decisions or non-obvious constraints rather than restating code.
