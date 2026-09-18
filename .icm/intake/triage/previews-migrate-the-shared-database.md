# Stub: Preview deploys migrate the shared database

- lane: chore
- found-by: PR #95's preview deploys, confirmed again by `ciqual-import` (#102) · 2026-09-17
- size: M

## Problem

> **Second confirmation, 2026-09-17 — `ciqual-import` (#102).** The same thing happened again,
> independently: that branch's preview created `foods`, `food_nutrients` and `ciqual_imports` in the
> shared database before anything merged, and they are there now. Its own duplicate of this stub
> was folded in here rather than kept beside it. Two details it adds:
>
> - Vercel's « set on your Vercel project, but missing from turbo.json » warning in those builds
>   lists the `POSTGRES_*` / `PG*` / `NEON_*` names but **not** `VERCEL_ENV`, and both `VERCEL_ENV`
>   and `ALLOW_NON_PRODUCTION_MIGRATIONS` are in `turbo.json`'s `globalEnv`. That narrows it: either
>   `VERCEL_ENV` is absent from the environment the turbo task spawns, or the opt-out is set on the
>   project and `.icm/docs/ENV.md`'s « Unset everywhere » is stale. One screen in Vercel decides it.
> - Whichever it is, the guard should **fail closed**. It currently reads an absent `VERCEL_ENV` as
>   "not on Vercel, so this is a developer's own database — go ahead"; on Vercel that reasoning
>   inverts, because absent means the variable did not arrive and migrating is the dangerous branch.
> - Two PRs have now been renumbered by this, which means the high-water mark moves far more often
>   than merges alone would — so this makes
>   [`parallel-migrations-journal-ordering`](parallel-migrations-journal-ordering.md) fire more,
>   rather than being a separate nuisance.
>
> Still open on either side: whether the tables `ciqual-import`'s preview created ahead of its merge
> were deliberate. They are empty and their migration is written `IF NOT EXISTS`, so they are
> harmless — the point is that nobody chose them.

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

## Proposed change

Settle whether previews migrate at all and against what: a Neon branch per preview, or the opt-out off on every project and the trade-off written where a tester reads it; make the guard fail closed.

## Acceptance criteria (rough)

- [ ] It is settled and written down whether previews migrate at all, and against what database.
- [ ] If previews keep migrating: each gets its own Neon branch, so no preview can write into the
      database another deploy reads.
- [ ] If they do not: `ALLOW_NON_PRODUCTION_MIGRATIONS` is off on every project, and the tradeoff —
      a preview serving against `main`'s schema, so a branch's new columns are absent until merge —
      is stated where someone testing a preview will read it.
- [ ] `.icm/docs/ENV.md` records the setting per project and the reason.
- [ ] `migrate.mjs`'s header stops describing a guard that is not in force.

## Notes

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

## Prompt

Run `/pipeline chore previews-migrate-the-shared-database` in the remi-ai repo. The lane pre-seeds from this stub and moves it to `triage/_done/` when it opens the PR. Scope is the Proposed change and nothing wider; a question left open above is raised, not answered in code.
