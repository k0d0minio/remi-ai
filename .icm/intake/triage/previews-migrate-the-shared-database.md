# previews-migrate-the-shared-database

- epic: triage
- lane: chore
- status: active
- created: 2026-09-17
- size: M
- depends-on: none

## Problem

`scripts/migrate.mjs` carries a guard that refuses to migrate from a non-production Vercel deploy,
and its header explains why in the strongest terms — a preview writing the branch's schema into the
live database is how, on 2026-09-02, a table appeared there and pushed drizzle's high-water mark
past an older migration on `main`, losing it silently and forever.

**That guard is not in force on the admin project.** Every preview build of PR #95 ran
`drizzle-kit migrate` for real, which only happens when `VERCEL_ENV` is unset or
`ALLOW_NON_PRODUCTION_MIGRATIONS=true` is set on the project. So previews are doing exactly what
the guard exists to prevent.

It cost that PR two failed deploys and a stretch of misdiagnosis:

1. Preview deploy of `2b293a9` applied the branch's migration — then numbered `0013_recipe_variants`
   — to the shared database. The build went green. The column `recipes.variant_of_id` now existed
   in a database whose `main` knew nothing about it.
2. `link-writes` merged and took `0013` on `main`. Merging `main` into the branch forced a
   regeneration to `0014_numerous_norman_osborn` with a later `when` — correct per
   `parallel-migrations-journal-ordering.md`.
3. Drizzle decides what to apply by high-water mark, never by hash, so the renamed migration read
   as unapplied. It re-ran `ALTER TABLE "recipes" ADD COLUMN "variant_of_id"` against a database
   that already had the column, failed with 42701, and took the whole admin build down before
   `next build` ever ran.

The immediate fix was to hand-guard that migration (`ADD COLUMN IF NOT EXISTS` plus a
`duplicate_object` catch), which is the repair `migrate.mjs` itself prescribes. That unblocks one
PR. It does not stop the next branch doing the same thing.

## Worth knowing

- The failure mode is asymmetric and nasty: the preview that pollutes the database **passes**, and
  the cost lands on a later build, often on a different branch, as an error that names a column
  rather than a cause.
- Two branches with migrations open at once is now normal here — five feature PRs were cut from one
  `main` on 2026-09-17 — so this is a standing condition, not an edge case.
- The real fix is a **Neon branch per preview**, which the storage vendor supports natively and
  which `migrate.mjs`'s own guard text already suggests ("Point previews at their own Neon
  branch to see them"). Then a preview migrates its own database, the guard can stay on, and a
  branch's schema is visible in its own preview — which is what the guard currently trades away.
- Whatever is decided, the `ALLOW_NON_PRODUCTION_MIGRATIONS` setting on each Vercel project should
  match it, and `.icm/docs/ENV.md` should say which projects carry it and why. Right now the code
  says one thing and the deployment says another, which is worse than either.

## Acceptance

- [ ] It is settled and written down whether previews migrate at all, and against what database.
- [ ] If previews keep migrating: each gets its own Neon branch, so no preview can write into the
      database another deploy reads.
- [ ] If they do not: `ALLOW_NON_PRODUCTION_MIGRATIONS` is off on every project, and the tradeoff —
      a preview serving against `main`'s schema, so a branch's new columns are absent until merge —
      is stated where someone testing a preview will read it.
- [ ] `.icm/docs/ENV.md` records the setting per project and the reason.
- [ ] `migrate.mjs`'s header stops describing a guard that is not in force.
