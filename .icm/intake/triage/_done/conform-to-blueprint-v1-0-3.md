# Stub: The repo renders from the blueprint v1.0.3

- lane: chore
- found-by: the house drift report `desk/estate/drift-2026-10-28.md` · 2026-10-28
- complexity: low
- priority: P2

## Problem

`.copier-answers.yml` names blueprint v1.0.2. The blueprint is at v1.0.3 (2026-10-28).

- v1.0.3: `.icm/scripts/vercel-build.sh` holds the migration rule of `.icm/database/CONTEXT.md`. `package.json` calls it with one line that never changes.

The admin app's `build` runs `db:migrate` first, and that is the only migration of production. UAT is not set up (`triage/set-up-uat-environment.md`).

## Proposed change

Run `copier update` to v1.0.3 with the answers of record. The repo's own `vercel-build` does not change here: a switch to `.icm/scripts/vercel-build.sh` before UAT exists stops the migration of production. `triage/set-up-uat-environment.md` makes the switch, and its criteria name the v1.0.3 line.

## Acceptance criteria

- [ ] `.copier-answers.yml` names `v1.0.3`, and its other lines do not change.
- [ ] The repo's own files change only as the proposed change says.
- [ ] `ci` is green.
