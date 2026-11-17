# Stub: The UAT database runs the same Postgres major version as production

- lane: chore
- found-by: the Neon API, during triage/vercel-function-regions-not-pinned · 2026-11-12
- complexity: low
- priority: P1

## Problem

The Neon project `remi-ai` (production) runs Postgres 17. The Neon project `uat-remi-ai` runs
Postgres 18. The client signs off a batch on UAT. A migration or a query can pass on 18 and
fail on 17 in production.

## Proposed change

Investigate. Then move both Neon projects to one major version, and record the version in
`.icm/database/CONTEXT.md`.

## Acceptance criteria

- [ ] The Neon API reads the same `pg_version` for `remi-ai` and `uat-remi-ai`
- [ ] `.icm/database/CONTEXT.md` names the Postgres major version of each Neon project

## Notes

- Jamie decided on 2026-11-17: Postgres 18 is the version. Development continues on
  `uat-remi-ai` (18). The Neon project `remi-ai` (17) is not in use and its rows are not kept.
  It moves to 18 at the next promotion. Neon does not change a major version in place: the
  move is a new project.
