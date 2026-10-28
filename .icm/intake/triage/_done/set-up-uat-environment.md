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
   production. With UAT, the `uat` environment migrates at build (`VERCEL_TARGET_ENV=uat`), and
   `promote.yml` migrates production. Today the admin app's production build is the only
   migration of production, so the switch to `.icm/scripts/vercel-build.sh` waits for this
   setup (blueprint v1.0.3 conformance, 2026-10-28).

## Proposed change

Do `.icm/uat/CONTEXT.md` § Setup, once, and `.icm/database/CONTEXT.md` § Setup, once. Before
that, Jamie decides which Vercel projects get a `uat` environment and a promotion, and records
a decision that replaces D-25.

## Acceptance criteria

- [ ] The Vercel projects `admin` and `app` have the custom environment `uat`, tracking `main`, at `uat.<its production domain>`.
- [ ] On `admin` and `app`, "Auto-assign Custom Production Domains" is off. A merge to `main` builds a production deployment that stays staged.
- [ ] Neon has a UAT project apart from production's. `NEON_PROJECT_ID` names the UAT project.
- [ ] `DATABASE_URL` and `DATABASE_URL_UNPOOLED` are on `uat`. `MIGRATE_AT_BUILD` is on no environment by hand: only `preview-db.sh` sets it, on a preview branch.
- [ ] The Actions secrets `VERCEL_TOKEN`, `NEON_API_KEY` and `DATABASE_URL`, and the variables `VERCEL_TEAM`, `VERCEL_PROJECT` (`admin`) and `NEON_PROJECT_ID`, exist.
- [ ] The admin app's `package.json` has `"build": "bash ../../.icm/scripts/vercel-build.sh next build"`. Vercel's Build Command does not change.
- [ ] `db:migrate` and `db:verify` are separate scripts. The admin app's `package.json` names both. `migrate.mjs` migrates on Vercel only when `VERCEL_TARGET_ENV=uat` or `MIGRATE_AT_BUILD=1`.
- [ ] `turbo.json` `globalEnv` names `VERCEL_TARGET_ENV`, `MIGRATE_AT_BUILD` and `DATABASE_URL_UNPOOLED`.
- [ ] The root `package.json` names `db:migrate` and `db:verify` (through `pnpm --filter @remi/services`), so that `promote.yml` migrates and verifies production.
- [ ] `ALLOW_NON_PRODUCTION_MIGRATIONS` is in no file outside `.icm/docs/history/` and `_done/`.
- [ ] `.icm/intake/README.md` records D-36, which replaces D-25.
- [ ] The stub `triage/previews-migrate-the-shared-database` is in `triage/_done/` with a `> Dropped:` line.
- [ ] `.icm/scripts/promote.sh status` marks every setup act that it can read as done.
