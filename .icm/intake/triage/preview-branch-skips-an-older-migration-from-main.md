# Stub: A preview branch that migrated first does not skip a migration main merges later

- lane: bug
- found-by: consent-and-data/consent-texts-and-records, pull request 159 · 2026-11-01
- complexity: medium
- priority: P1

## Problem

Two open pull requests each add migration `0026`. Pull request A migrates its preview branch first. Then pull request B merges to `main` with an older journal `when`. A merges `main` and renumbers its migration to `0027`. Drizzle skips B's `0026` on A's preview branch, because its `when` is older than the newest migration applied. Then `0027` fails, because its table exists. The admin preview of A fails until a person resets the Neon branch (`packages/services/scripts/migrate.mjs`, `.icm/database/CONTEXT.md`).

## Proposed change

Investigate. One option: `migrate.mjs` on a preview resets the branch from its parent when the journal's applied set is not a prefix of the checked-in journal.

## Acceptance criteria

- [ ] A preview branch that migrated an old journal migrates the new journal without a person's act.
- [ ] `.icm/database/CONTEXT.md` names the rule.
