# Architecture

Tech Library is split into deployable applications and reusable packages so content, presentation, automation, and infrastructure can evolve independently.

```text
React/Vite PWA ──REST──> Fastify API ──> SQLite
                              ▲             ▲
                              │             │
                         Admin review   Source worker
```

## Boundaries

- `apps/web` owns Danish presentation, routing, query caching, and local UI state.
- `apps/api` owns authentication, authorization, publication rules, and versioned REST resources.
- `apps/worker` owns official-source collection, normalization, fingerprinting, and findings.
- `packages/contracts` owns runtime validation and shared public types.
- `packages/database` owns schema, migrations, connection policy, and curated seed data.

Published revisions are immutable. `topics.active_revision_id` is the only publication pointer, so rollback does not rewrite history. Findings and draft revisions never become public merely because a worker produced them.

English revision payloads are canonical. Each localized payload references the exact English source revision it translates; missing translations fall back to English rather than blocking publication. Reader accounts and favorites are separate from the editorial administrator and never affect public content.

## ADR-001: SQLite and one writer host

SQLite is authoritative for v1 and runs on a persistent local volume. WAL mode supports concurrent readers while API and worker serialize short writes. Do not place the database on a network filesystem. Database access stays behind the database package and repository layer to preserve a future migration path.

## ADR-002: Dynamic content delivery

The PWA contains no production catalog bundle. Public content is fetched from the API, allowing editors to publish a revision without rebuilding the frontend. The service worker caches only the application shell and static assets.

## ADR-003: Human publication gate

Automated adapters may create source findings, never published revisions. A signed admin session and matching CSRF token are required for every mutating editorial request.
