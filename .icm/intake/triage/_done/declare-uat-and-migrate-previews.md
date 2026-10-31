# Stub: Declare the uat target, and let a preview build migrate its Neon branch

- lane: chore
- found-by: the setup verification of 2026-10-31 · 2026-10-31
- complexity: low
- priority: P0

## Problem

Three files describe a platform that is not the one installed. `apps/web/.env.example` and
`apps/admin/.env.example` name no `uat` target, so the setup stub `uat-variables` finds no
name for `uat`. `packages/services/scripts/migrate.mjs` refuses to migrate on Vercel outside
`uat` and `MIGRATE_AT_BUILD=1`, but `.icm/scripts/vercel-build.sh` (blueprint v1.3.0) runs
`db:migrate` on every preview, because the Neon integration makes the branch
`preview/<git branch>` before the build. The first admin preview that builds with the current
script fails. No deployment has built since 2026-10-28 20:23Z: the Ignored Build Step skips
every push that changes only `.icm/`.

## Proposed change

Mark `uat` on each `.env.example` name that `uat` sets. Let `migrate.mjs` migrate when
`VERCEL_TARGET_ENV` is `uat` or `preview`, and print the database host before it does.
Update `.icm/docs/ENV.md` § Who migrates. Reword step 5 and the third Done line of
`.icm/intake/setup/neon-vercel-integration.md` for the Vercel-managed integration. The change
touches `apps/web` and `apps/admin`, so it builds both projects.

## Acceptance criteria

- [ ] Each name that `uat` sets ends in `[production,preview,uat]` in both `.env.example` files.
- [ ] The admin preview build log shows `[vercel-build] VERCEL_TARGET_ENV=preview: migrate, verify, then build`, then `[db:migrate] host=` with the host of the branch `preview/triage/declare-uat-and-migrate-previews`, not the host of `uat-remi-ai` main.
- [ ] After the merge, the admin `uat` build log shows `[vercel-build] VERCEL_TARGET_ENV=uat: migrate, verify, then build`, and `https://uat-admin.remi-ai.tech` answers.
- [ ] `.icm/docs/ENV.md` § Who migrates names the Neon integration, not `preview-db.yml`.
