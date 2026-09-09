# Chore: migrate-preview-guard

- invariant: production deploys migrate exactly as before; only a **non-production** Vercel deploy
  changes — it now skips migrating instead of writing the branch's schema into whatever database
  `DATABASE_URL` points at. No app code, no schema, no migration, no rendered output differs.
- change: `packages/services/scripts/migrate.mjs` — after the existing `DATABASE_URL` check, refuse
  when `VERCEL_ENV` is set and is not `production`, unless `ALLOW_NON_PRODUCTION_MIGRATIONS=true`.
  Exits 0 and loud, so the preview still builds. `turbo.json` gains `VERCEL_ENV` and
  `ALLOW_NON_PRODUCTION_MIGRATIONS` in `globalEnv`; `.icm/docs/ENV.md` gains the variable's row and a
  rewritten preview caveat carrying the reasoning.
- rollback: revert the commit. The guard only ever skips work, so reverting restores the previous
  behaviour with no data or schema consequence.

## Why

Previews and production share one `DATABASE_URL` in this project. `migrate.mjs` ran
`drizzle-kit migrate` for real on every admin build, so a preview migrated the live database.

That is worse than it sounds. Drizzle's pg dialect decides what to apply with
`Number(lastDbMigration.created_at) < migration.folderMillis` — a high-water mark on the journal's
`when`, never a hash comparison. A migration applied out of order raises the mark, and every older
unapplied migration is then skipped **silently**: no error, no output, no failed build.

On 2026-09-02 that happened. A preview of `anamnesis-structure` applied its `0004` (when 1788364553618) to the live database. `pantry-essentials` then merged with a `0004` generated 70
seconds earlier (when 1788364483531), so its `CREATE TABLE patient_pantry_essentials` fell below the
mark and never ran, while its code shipped to production expecting the table.

## Notes for readiness

- Nothing to set in either dashboard: `ALLOW_NON_PRODUCTION_MIGRATIONS` is deliberately unset
  everywhere. It exists as a named escape hatch, not as configuration to apply.
- It is not in the `env.ts` zod schema on purpose. Nothing in-process reads it — the only reader is
  this build script, outside the app process, the same carve-out `drizzle.config.ts` already has.
  A schema entry would be a key with no reader, which `CONVENTIONS.md` forbids.
- **This guard does not repair the database.** The stale high-water mark and the table it skipped
  are existing state; see the `preview-migration-schema-drift` bug stub.
- Exercised locally across all five paths: no `DATABASE_URL` → skip; `VERCEL_ENV=preview` → refuse;
  `VERCEL_ENV=production` → migrate; `preview` + opt-in → migrate; unset `VERCEL_ENV` (local, CI) →
  migrate.
