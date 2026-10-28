# Stub: Open stubs cite D-25, which D-36 replaced

- lane: chore
- found-by: `triage/set-up-uat-environment` (#148) · 2026-10-28
- complexity: low
- priority: P2

## Problem

D-36 replaced D-25 on 2026-10-28. Fifteen open stubs still cite D-25. Some of them say that a migration "runs on production only" or that the one database is shared. With D-36, the admin `uat` build migrates the UAT base, a preview with a migration migrates its own Neon branch, and `promote.yml` migrates production. Examples: `bmi/calculations-table.md`, `food-directives/term-base.md`, `eviction-safety/suggestion-suspension.md`, `preparatory-questionnaire/questionnaire-fields.md`, `protocol-versions/protocol-version-table.md`.

## Proposed change

Replace each D-25 citation in an open stub with D-36, and correct the sentence when it says where the migration runs.

## Acceptance criteria

- [ ] `grep -rn "D-25" .icm/intake --include=*.md` finds no open stub. It finds only `README.md` and files in `_done/`.
- [ ] No open stub says that a migration runs on production only, or at the build of `main`.
