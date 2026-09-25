# Project: patient-profile-edit

The run's context card — what a fresh session needs before it reads anything else. Pointers,
not copies: the spec stays the spec, the scope stays the scope. Seeded when the run is opened
(`new-run.sh` → `run-pack.sh --init`), sharpened by whichever stage learns something. Read with
`status.md` and `handoff.md` on every resume (`_shared/stage-preamble.md`).

- stub: intake/patient-loop/patient-profile-edit.md
- scope: none
- spec: 02_define/output/spec.md
- touches: apps/web/app/[locale]/p/[token], apps/web/lib/patient-link, apps/web/components/patient-link, packages/services/src/db/schema.ts, packages/services/src/db/migrations, packages/services/src/db/models/patient-profile.ts, packages/services/src/db/services/patients, packages/services/src/db/services/patient-link-writes, packages/services/src/shared/patient.ts, packages/services/src/ai/context.ts, apps/admin/components/patients, apps/admin/lib/patients, .icm/docs/RETENTION.md
- complexity: standard → model: sonnet (executor — select-model.sh --stage 03_build)

## Constraints

- D-2: every patient write goes through `patient-link-writes` — the token is the only credential.
- D-23 is out of scope: `birth_date` and the console's identity fields do not change.
- The patient never edits identity, measures, objective, constraints, medications or supplements.
- The admin patient form changes only for the time select and the budget select.
- Brainstorm § 7: no exact preparation time — three levels only.

## Context budget

- Define read `.icm/docs/RETENTION.md`, the old version's onboarding (`.icm/processed/…remi-v2-explication-syste-me.txt`) and the 28 Aug transcript around [29:32], to close the stub's open points.
