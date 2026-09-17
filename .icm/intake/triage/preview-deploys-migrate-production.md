# Stub: preview deploys are migrating the production database, and the guard that should stop them did not

- feature-slug: preview-deploys-migrate-production
- lane: bug
- priority: P1
- found-by: the `ciqual-import` run, 2026-09-17 — its first migration was recorded as applied and
  never ran, and the admin preview build failed on `migrate.mjs`'s own verification step
- sources: `packages/services/scripts/migrate.mjs` (the guard and the verification) ·
  `.icm/docs/ENV.md` § Preview caveat · `turbo.json` § globalEnv · the Vercel admin build log for
  commit `59ff78a`

## What this is

`migrate.mjs` carries a guard added after the 2026-09-02 incident: refuse to migrate when
`VERCEL_ENV` is set to anything but `production`, unless `ALLOW_NON_PRODUCTION_MIGRATIONS=true`.
**On the admin preview deploy for `59ff78a` it did not fire.** The log goes straight from
`> node scripts/migrate.mjs` to drizzle-kit reading `drizzle.config.ts` — no refusal warning — and
drizzle then ran against the shared database.

Both variables are in `turbo.json`'s `globalEnv`, and Vercel's own "missing from turbo.json"
warning in that build lists the `POSTGRES_*` / `PG*` / `NEON_*` names but not `VERCEL_ENV`. So
either `VERCEL_ENV` is not set in the environment the turbo task spawns, or
`ALLOW_NON_PRODUCTION_MIGRATIONS=true` has been set on the admin Vercel project — `.icm/docs/ENV.md`
says it is « Unset everywhere », which is then stale. Neither has been confirmed from here: this
session has no access to the `remi21` Vercel scope.

The second half is the damage it already did. `drizzle.__drizzle_migrations` on the production
database holds **sixteen** rows; this branch's journal holds fourteen. The two extra are
`created_at` 1789600000000 — a suspiciously round number, 2026-09-16 23:06:40 — and 1789646871306,
2026-09-17 12:07:51. Drizzle chooses what to apply by comparing a journal entry's timestamp against
the newest `created_at` already recorded, **never by hash**, so any migration generated before that
mark is recorded as applied and silently never runs.

That is exactly what happened to `ciqual-import`'s migration: generated 12:05:30Z, mark already at
12:07:51Z, three tables reported applied and absent. It was caught only because `migrate.mjs`
verifies the schema after migrating — the check added after the same failure cost two days and an
error digest in production.

## Why it matters

Every migration generated from now on races a mark that any preview deploy can push forward. The
next one to lose the race fails the same way, and the one after that may not be caught if it adds a
column rather than a table — the verification step checks table presence, not columns.

## Proposed change

Three things, in order of how much they settle:

1. **Establish which of the two causes it is.** Read the admin project's environment in Vercel:
   is `ALLOW_NON_PRODUCTION_MIGRATIONS` set? Is `VERCEL_ENV` visible to the turbo task? Everything
   else depends on the answer, and the answer is one screen.
2. **Make the guard fail closed.** It currently treats an absent `VERCEL_ENV` as "not on Vercel, so
   a developer's own database — go ahead". On Vercel that reasoning inverts: absent means the
   variable did not arrive, and migrating is the dangerous branch. Prefer an explicit
   `VERCEL=1`-and-not-production refusal, or require a positive `MIGRATE=production` signal.
3. **Give previews their own database.** `.icm/docs/ENV.md` already names this as the real answer and
   the other two as interim. A Neon branch per preview ends the shared-mark problem outright, and
   would also let a branch's new tables be tested on its own preview — which `ciqual-import` could
   not do.

Also worth deciding: whether the two unknown applied rows should be reconciled against `main`'s
journal, or left alone as history.

## Acceptance criteria (rough)

- [ ] It is written down which of the two causes let the preview migrate, with the evidence
- [ ] A preview deploy provably cannot migrate the production database — demonstrated, not argued
- [ ] The guard fails closed when `VERCEL_ENV` is absent on a Vercel build
- [ ] `.icm/docs/ENV.md` § Preview caveat matches what is actually configured
- [ ] The verification step's limits are documented, or it is widened past table presence
