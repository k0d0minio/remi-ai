# Stub: Set up the UAT environment and the UAT database

- lane: chore
- found-by: the blueprint `v1.0.0` conformance (`chore/conform-blueprint-v1.0.0`), Jamie's answer `uat: true` · 2026-10-27
- complexity: medium
- priority: P1

## Problem

Jamie answered `uat: true` on 2026-10-27. `CLAUDE.md` now says that a ticket's merge reaches UAT
and that production moves only on a promotion. The UAT environment and the UAT database do not
exist. Thus Vercel still deploys `main` to production on each merge, and the rule in `CLAUDE.md`
is not true yet. Jamie does the setup, and not immediately.

Three facts of this repo make the setup larger than the blueprint's single project:

1. The repo has six Vercel projects in team `remi21`. `.icm/scripts/lib/vercel.sh` reads one
   project (`VERCEL_PROJECT`).
2. D-25 (`.icm/intake/README.md`) says: one Neon database for preview and production, and
   previews never migrate. `.icm/database/CONTEXT.md` with UAT says: one Neon project for
   production, one for UAT, and the UAT project's default branch is the base for previews.
3. `packages/services/scripts/migrate.mjs` refuses to migrate from a deployment that is not
   production. With UAT, the `uat` environment migrates at build (`MIGRATE_AT_BUILD=1`), and
   `promote.yml` migrates production.

## Proposed change

Do `.icm/uat/CONTEXT.md` § Setup, once, and `.icm/database/CONTEXT.md` § Setup, once. Before
that, Jamie decides which Vercel projects get a `uat` environment and a promotion, and records
a decision that replaces D-25.

## Acceptance criteria

- [ ] Each Vercel project that the client tests has the custom environment `uat`, tracking `main`, at `uat.<its production domain>`.
- [ ] On those projects, "Auto-assign Custom Production Domains" is off. A merge to `main` builds a production deployment that stays staged.
- [ ] Neon has a UAT project apart from production's. `NEON_PROJECT_ID` names the UAT project.
- [ ] `DATABASE_URL`, `DATABASE_URL_UNPOOLED` and `MIGRATE_AT_BUILD=1` are on `uat`. `MIGRATE_AT_BUILD` is not on Production.
- [ ] The Actions secrets `VERCEL_TOKEN`, `NEON_API_KEY` and `DATABASE_URL`, and the variables `VERCEL_TEAM`, `VERCEL_PROJECT` and `NEON_PROJECT_ID`, exist.
- [ ] `db:migrate`, `db:verify` and `vercel-build` follow `.icm/database/CONTEXT.md` § The migration rule. `migrate.mjs` migrates on `uat`.
- [ ] `.icm/intake/README.md` records the decision that replaces D-25.
- [ ] `.icm/scripts/promote.sh status` marks every setup act that it can read as done.
