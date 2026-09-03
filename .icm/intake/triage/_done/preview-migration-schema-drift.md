# Stub: a preview migrated production and silently skipped `patient_pantry_essentials`

- feature-slug: preview-migration-schema-drift
- lane: bug
- priority: P1
- found-by: the `anamnesis-structure` session, 2026-09-02, when PR #67's admin deploy went red
- sources: PR #67 (deploy `dpl_ABgT89s1EWk4puxfesKEri9pVxUo`) · PR #69 (the guard) ·
  `packages/services/scripts/migrate.mjs` · `.icm/docs/ENV.md` § Preview caveat

## What this is

**The live database is missing a table that shipped code expects.** `patient_pantry_essentials`
was almost certainly never created, while `pantry-essentials` (#68) is merged and serving on
`main`. An operator opening a patient page should be hitting a database error on the
**Essentiels placard / frigo** card.

Previews and production share one `DATABASE_URL`, and `migrate.mjs` ran `drizzle-kit migrate` for
real on every admin build. Drizzle's pg dialect decides what to apply with
`Number(lastDbMigration.created_at) < migration.folderMillis` — a high-water mark on the journal's
`when`, never a hash comparison — so a migration applied out of order raises the mark and every
older unapplied migration is skipped **silently**: no error, no output, no failed build.

What happened, from the journal timestamps:

| #   | event                                                                                                                                                                                   | journal `when` |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| 1   | the `anamnesis-structure` preview on `1c39c79` applied its `0004_worthless_micromacro` to the live database, creating `patient_anamnesis` and setting the mark                          | 1788364553618  |
| 2   | `pantry-essentials` #68 merged; its `0004_next_cable` is **70 seconds older**, so it fell below the mark and never ran                                                                  | 1788364483531  |
| 3   | #67 renumbered its migration to `0005_misty_hedge_knight`, which is above the mark, so it runs `CREATE TABLE patient_anamnesis` — already there from step 1 — and the admin build fails | 1788383757253  |

Step 3 is only the symptom that made this visible. Step 2 is the bug: production has been running
without a table its code reads.

The owner confirmed on 2026-09-02 that `patient_anamnesis` exists in the database and is **empty**,
so nothing is lost by dropping it.

## The repair

Bookkeeping, not schema-by-hand: delete the poisoned high-water row and the table the preview
created, then let the next production deploy apply `0004_next_cable` and `0005_misty_hedge_knight`
in order, from the checked-in migrations.

```sql
BEGIN;
-- Confirm the premise before destroying anything: this must return 0.
SELECT count(*) AS must_be_zero FROM patient_anamnesis;

DROP TABLE patient_anamnesis;
DELETE FROM drizzle.__drizzle_migrations WHERE created_at = 1788364553618;

-- The mark should now sit at 0003's timestamp, below both pending migrations.
SELECT created_at FROM drizzle.__drizzle_migrations ORDER BY created_at DESC LIMIT 1;
COMMIT;
```

Then redeploy admin on `main`. Its build applies both migrations and `patient_pantry_essentials`
appears. Verify by opening a patient in the admin console: the Essentiels card renders and an item
can be added.

**Do not** make either migration `CREATE TABLE IF NOT EXISTS` to get past this. That hides the
drift and leaves the pantry table missing.

## Sequencing

1. This repair — production is currently broken for pantry essentials.
2. PR #69 (`migrate-preview-guard`) so it cannot recur.
3. PR #67 (`anamnesis-structure`) merges once the repair has run; its admin deploy is red only
   because of step 1's leftovers.

## Open questions — flag these on pickup

- **Previews still share production's `DATABASE_URL`.** #69 stops previews writing to it, but a
  preview then renders against production's schema and cannot show a branch's new tables at all —
  which is what the `/pipeline verify` DoD smoke reads. A Neon branch per preview is the real
  answer (`.icm/docs/ENV.md` says so); whether to set that up, and who does it, is the owner's.
- **Is any other migration below the mark?** The two known ones are accounted for, but the same
  silent skip could have swallowed an earlier one. Worth listing `drizzle.__drizzle_migrations`
  against the journal once, rather than assuming these were the only two.

## Prompt

In the remi-ai repo, read `.icm/intake/triage/preview-migration-schema-drift.md` first. Production's
database is missing `patient_pantry_essentials` because a preview deploy applied a newer migration
out of order and pushed drizzle's high-water mark past it. Run the repair SQL in that stub against
the live database (the count must be zero before dropping — stop if it is not), redeploy admin on
`main`, and verify in the admin console that a patient's Essentiels card renders and takes a new
item. Then audit `drizzle.__drizzle_migrations` against `src/db/migrations/meta/_journal.json` for
any other migration left below the mark, and report what you find. Raise the stub's open questions
rather than answering them. Move this stub to `.icm/intake/triage/_done/` in the same PR.
