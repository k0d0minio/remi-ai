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

- <what must stay true while this run is built — from the spec's Out of scope, the `D-n`
  decisions in `decisions.md`, and `_shared/project-rules.md`>

## Context budget

- <what was loaded beyond the stage's Inputs, and why — the stage's overrun note lives here>
