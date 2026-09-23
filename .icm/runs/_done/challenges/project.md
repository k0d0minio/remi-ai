# Project: challenges

The run's context card — what a fresh session needs before it reads anything else. Pointers,
not copies: the spec stays the spec, the scope stays the scope. Seeded when the run is opened
(`new-run.sh` → `run-pack.sh --init`), sharpened by whichever stage learns something. Read with
`status.md` and `handoff.md` on every resume (`_shared/stage-preamble.md`).

- stub: intake/patient-loop/challenges.md
- scope: runs/september-sources/01_scope/output/scope.md (D-19; Open for Define → `challenges`)
- spec: 02_define/output/spec.md
- touches: packages/services/src/db, apps/web/app/[locale]/p/[token], apps/web/components/patient-link, apps/web/lib/patient-link, apps/web/lib/content, apps/admin/app/(admin)/patients, apps/admin/components/patients, .icm/docs/RETENTION.md
- complexity: standard → model: sonnet (executor — select-model.sh --stage 03_build)

## Constraints

- One open challenge per patient, enforced by the database, not only the service.
- The patient writes only through `writeThroughPatientLink` (D-2): no patient id from the client,
  no cookie, no session; a closed challenge is not-found.
- No notification, no model call (D-9, D-19); no library or templates.
- The instruction stays the instruction: only its link title changes; `body` never reaches the link.
- Copy in `fr` and `en`; the link's register is « vous ».

## Context budget

- Define read the scope's Open for Define and § 2/§ 7 excerpts, and grepped the link home, the
  patient list and the admin patient page to fill `touches:` and find the consigne title collision.
