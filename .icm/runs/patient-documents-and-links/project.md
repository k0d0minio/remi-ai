# Project: patient-documents-and-links

The run's context card — what a fresh session needs before it reads anything else. Pointers,
not copies: the spec stays the spec, the scope stays the scope. Seeded when the run is opened
(`new-run.sh` → `run-pack.sh --init`), sharpened by whichever stage learns something. Read with
`status.md` and `handoff.md` on every resume (`_shared/stage-preamble.md`).

- stub: intake/patient-loop/patient-documents-and-links.md
- scope: none
- spec: 02_define/output/spec.md
- touches: packages/services/src/files, packages/services/src/db, packages/services/src/server/env.ts, packages/services/package.json, packages/services/tsup.config.ts, pnpm-lock.yaml, turbo.json, apps/admin/app/(admin)/patients, apps/admin/components/patients, apps/admin/lib, apps/web/app/[locale]/p/[token], apps/web/components/patient-link, apps/web/lib/patient-link, apps/web/lib/content, apps/web/lib, apps/docs/app/technical/decisions, .icm/docs/ENV.md, .icm/docs/RETENTION.md
- complexity: complex → model: opus (executor — select-model.sh --stage 03_build)

## Constraints

- <what must stay true while this run is built — from the spec's Out of scope, the `D-n`
  decisions in `decisions.md`, and `_shared/project-rules.md`>

## Context budget

- <what was loaded beyond the stage's Inputs, and why — the stage's overrun note lives here>
