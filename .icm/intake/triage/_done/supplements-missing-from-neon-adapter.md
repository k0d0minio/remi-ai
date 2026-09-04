# Stub: `patient_supplements` was never registered in the Neon adapter, 500ing every patient page

- feature-slug: supplements-missing-from-neon-adapter
- lane: bug
- priority: P1
- found-by: the owner, 2026-09-04 — the admin patient page still rendered the error boundary
  after `anamnesis-table-dropped-after-apply` shipped
- sources: `.icm/intake/triage/_done/anamnesis-table-dropped-after-apply.md` (the failure this one
  was hiding behind) · `packages/services/src/db/adapters/neon.ts` ·
  `packages/services/src/db/services/patient-supplements/index.ts`

## What this was

Opening any patient in the admin console kept rendering **Cette page n'a pas pu être chargée**
after the anamnesis repair merged. The database was not the problem this time: all seventeen
tables and every one of their columns match `0011_snapshot.json` in production, `patient_anamnesis`
included.

The adapter was. `createNeonDatabase()` resolved a collection name through a **hand-written
registry** of sixteen tables, and `patient_supplements` was not in it — defined in `schema.ts`,
migrated by `0009_salty_terror`, queried by the supplement protocol, and absent from the one list
that maps a collection name to a table. Every read of it threw

```
unknown collection "patient_supplements" — add the table to src/db/schema.ts and the registry in src/db/adapters/neon.ts
```

`listPatientSupplements` and `listArchivedPatientSupplements` are two of the twenty-one reads the
patient page fans out in one `Promise.all`, so the page threw for every patient, exactly as the
missing anamnesis table had. Two independent faults on the same `Promise.all`: fixing the first
uncovered the second, which is why the page did not come back.

### Why nothing caught it

The service tests all run on `createMemoryDatabase()`, which invents a collection for any name
asked of it. A table missing from the Neon registry is therefore invisible to all 195 of them —
the registry only exists on the production path, and only production exercised it. Lint,
typecheck and build cannot see it either: the name is a string.

## What shipped

1. **The registry is derived, not written** — `tables` in `neon.ts` is now built from
   `import * as schema`, filtering the module's exports to `PgTable` and keying each by
   `getTableName()`. A table exported from `schema.ts` is served under the name it declares, the
   moment it is defined. There is no second list to forget, which is the whole of this bug.

2. **A test that stands in for the service tests** — `neon.test.ts` asserts the adapter serves
   every table the schema declares, and names `patient_supplements` explicitly so the regression
   has a marker. It is the check the memory-database tests structurally cannot make.

## Verified

The failure was reproduced against the pre-fix adapter (`unknown collection "patient_supplements"`
for the fourteen collection names the patient page reads) and is gone after it. `pnpm --filter
@remi/services test` — 195 tests, green.
