# REMI-022 · Land the first database adapter on Neon

| | |
| --- | --- |
| **Type** | feature (infrastructure) |
| **Priority** | P1 — unblocks every real feature |
| **Size** | A week or more (the audit warns against sizing it as an afternoon) |
| **Depends on** | REMI-001 (the Neon project and its first migration exist), REMI-008 (harness + 75% floor), REMI-018 (entities), REMI-019 (seam) |
| **Blocked by** | — (D-2 is settled: **Neon**, recorded by REMI-001) |
| **Sources** | audit F-08, F-11, F-28, D-2, checklist item 8; v1-report §9.2 |

## Problem statement

There is no database. Every query module in the signed-in app returns fixture data
unconditionally, so a production deploy renders plausible fake patients with no error anywhere —
the "missing database fails loud" promise is not true where it matters. The documented
registration point (`instrumentation.ts`) exists in no app; the documented `db/services/` and
`db/migrations/` directories don't exist; there is no migration story and a `close()` nobody will
call on serverless. The audit's honest sizing: adapter + bootstrap file per app + migrations
tooling + connection lifecycle + query-module migration, not "one file and one registration line".

## Required steps

1. Build on what REMI-001 already stood up: the Neon project (EU region), the connection variables,
   and the auth migration. This ticket generalises that thin connection into the real seam — it does
   not open a second database.
2. Implement the adapter for the REMI-019 interface in `packages/services/src/db/`; it must pass
   the REMI-019 contract-test suite. The 75% coverage floor on `src/db/**` switches on here.
3. Stand up migrations tooling and the initial migration generated from the REMI-018 models
   (learn from v1 §8.12: the chain must replay cleanly from zero — make that a CI check).
4. Create `instrumentation.ts` registration in `apps/web` (and admin when it needs data);
   handle serverless connection lifecycle explicitly.
5. **In the same PR** (F-08): route the `apps/web/lib/queries/*` modules through the seam and
   delete the unconditional fixture path — or gate fixtures behind an explicit flag for the demo
   app only. Fix the roster N+1 with the batched read (F-37) while restructuring.
6. Add a health route (F-28): app up *and* database reachable, per app that registers an adapter.
7. Env per the three-list rule; EU region documented; secrets only in Vercel/CI.
8. Seed strategy for development (seeded fixtures via the seam, not hardcoded returns).

## Acceptance criteria

- [ ] Contract tests and the 75% coverage floor pass on `src/db/**` in CI.
- [ ] Migrations replay cleanly from an empty database, verified in CI.
- [ ] No query module returns fixtures unconditionally; a missing adapter fails loud at boot.
- [ ] `/api/health` (or equivalent) answers app+db status.
- [ ] The roster page issues batched queries, not 1+3×N.

## Agent prompt

```text
Work in the remi-ai monorepo. The database vendor is decided: Neon (D-2), and REMI-001 has already
opened the project in an EU region, set DATABASE_URL, and landed the auth migration — build on
that, do not create a second database. Read CLAUDE.md, CONVENTIONS.md, packages/services/AGENTS.md,
then docs/audit-report.md findings F-08, F-09, F-11, F-28, F-37 and decision D-2, and
docs/v1-report.md §9.2's database note and §8.12 (migration hygiene lessons).

Task: land real persistence, honestly sized. Work in reviewable stages (separate PRs are fine):
1. Adapter: implement the Collection/AccessContext interface from packages/services/src/db/ against
   Neon, passing the existing contract-test suite verbatim. The
   preconfigured 75% coverage floor for src/db/** must now be enforced in CI.
2. Migrations: set up the vendor-appropriate migrations tooling under packages/services (the
   AGENTS.md names db/migrations/); write the initial migration from the models; add a CI step
   that replays the full chain against an empty database — v1 died of migrations that could not
   replay, do not repeat it.
3. Registration: create instrumentation.ts in apps/web registering the adapter at boot, with an
   explicit serverless connection strategy (pooling/driver per vendor guidance). A production
   boot with no adapter must fail loudly — verify getDatabase() is actually on every query path.
4. Query migration, same change as registration: rewrite each module in apps/web/lib/queries/ to
   go through the seam; delete the unconditional fixture returns (fixtures survive only behind an
   explicit flag for apps/demo). Restructure the roster query (clients.ts) onto the batched read
   so it is not 1+3×N.
5. Health: add an api health route to apps/web answering app-up + db-reachable.
6. Env: connection variables through the services env schema + docs/ENV.md + turbo.json (the
   three-list rule); never commit a secret; document the EU-region choice in the decisions page.
Run tests; do not run build/lint/typecheck locally (factory-owned) — push and read CI. Open PRs
with the audit finding each stage resolves.
```
