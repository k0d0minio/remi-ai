# Stub: `patient_anamnesis` was recorded as applied and then dropped, 500ing every patient page

- feature-slug: anamnesis-table-dropped-after-apply
- lane: bug
- priority: P1
- found-by: the owner, 2026-09-04 — the admin patient page rendered the error boundary with
  digest `1380576423`
- sources: `.icm/intake/triage/_done/preview-migration-schema-drift.md` (the parent incident) ·
  `packages/services/scripts/migrate.mjs` · `packages/services/src/db/migrations/`

## What this was

Opening any patient in the admin console rendered **Cette page n'a pas pu être chargée**. The page
(`apps/admin/app/(admin)/patients/[id]/page.tsx`) fans out one `Promise.all` over the whole record;
`listPatientAnamnesis` selects from `patient_anamnesis`, which was **not in the database** —
Postgres `42P01`, thrown on the server, surfaced to the operator as a digest.

`drizzle.__drizzle_migrations` told the opposite story: all eleven checked-in migrations were
recorded, `0005_misty_hedge_knight` (the one that creates `patient_anamnesis`) among them. Drizzle
decides what to apply by comparing the journal's `when` against the newest recorded `created_at`,
never by hash, so a migration already in the ledger is never revisited. The table was recorded as
created and was not there, and no build, deploy or check noticed.

The cause is the repair in the parent stub, run out of the order that stub laid out. That repair's
`DROP TABLE patient_anamnesis` was meant to remove a copy a preview had created **before** the
production deploy applied `0005`. It ran after. The deploy created the table and recorded the
migration; the drop then removed the table and left the row. The repair's `DELETE` against
`drizzle.__drizzle_migrations` did its job — the ledger's missing `id = 5` is the preview row it
removed — but nothing put `patient_anamnesis` back.

## What shipped

1. **`0011_lost_anamnesis.sql`** — `CREATE TABLE IF NOT EXISTS "patient_anamnesis"` with its
   unique and foreign-key constraints inline, so the whole statement is one no-op wherever the
   table already exists. Its journal `when` is above the mark, so it applies; it changes no
   schema, so `0011_snapshot.json` is `0010`'s state carried forward with a fresh id.

2. **A post-migrate schema check in `scripts/migrate.mjs`** — after `drizzle-kit migrate` returns
   green, every table in the newest snapshot is compared against `information_schema.tables`, and
   a missing one fails the build with the names printed. A green migrate only ever meant the
   ledger was satisfied; this is what makes it mean the schema is there. It reads the snapshot
   rather than `schema.ts` so it needs no build of the package, and it runs only where migrations
   ran — the two skip paths (no `DATABASE_URL`, non-production deploy) return before it, and the
   driver import is dynamic so neither needs it resolved.

### On the parent stub's "do not use `CREATE TABLE IF NOT EXISTS`"

That instruction was about editing `0004`/`0005` in place to get a red build green, which would
have hidden an ordering bug and left `patient_pantry_essentials` missing. This is the opposite
shape: a new forward migration repairing a table known to be absent, checked in and applied the
same way in every environment, with a verifier that makes any remaining drift loud. The concern
the instruction protects against — drift hiding behind a green build — is what item 2 closes.

The alternative repair was to delete `0005`'s ledger row so drizzle re-runs it. Rejected: it is
another round of hand-editing the ledger in a production console, which is the manoeuvre that
caused this.

## The parent stub's open question, answered

> Is any other migration below the mark?

No. Every table and every column in `0010_snapshot.json` was compared against the live database on
2026-09-04: all seventeen tables and their columns matched except `patient_anamnesis`, which was
absent entirely. That was the only drift. From here the check in item 2 answers this question on
every production deploy instead of by hand.

## Still open — the parent stub's other question stands

Previews still share production's `DATABASE_URL`. The guard stops them writing to it, so a preview
renders against production's schema and cannot show a branch's new tables. A Neon branch per
preview remains the real answer, and remains the owner's call.
