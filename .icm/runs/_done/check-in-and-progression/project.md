# Project: check-in-and-progression

The run's context card — what a fresh session needs before it reads anything else. Pointers,
not copies: the spec stays the spec, the scope stays the scope. Seeded when the run is opened
(`new-run.sh` → `run-pack.sh --init`), sharpened by whichever stage learns something. Read with
`status.md` and `handoff.md` on every resume (`_shared/stage-preamble.md`).

- stub: intake/patient-loop/check-in-and-progression.md
- scope: none
- spec: 02_define/output/spec.md
- touches: packages/services/src/db, packages/services/src/shared, apps/web/app/[locale]/p/[token], apps/web/components/patient-link, apps/web/lib/patient-link, apps/web/lib/content, apps/admin/app/(admin)/patients, apps/admin/components/patients
- complexity: standard → model: sonnet (executor — select-model.sh --stage 03_build)

## Constraints

- Goals only, weekly, 0–5 (D-30, D-31); no recommendation check-ins and no new table.
- No scheduler, cron, email, push or model call (D-9); no chart library.
- Writes go through the link-writes path only (D-2): token-scoped, rate-limited, audited.
- Morgane's consultation check-in form and existing rows are unchanged; practitioner rows never count
  as awaiting (D-33).
- The home keeps room for `general-feedback`'s card beside this one (D-32).
- No app imports another app: a strip shared by `web` and `admin` lives in `@remi/ui` or is twinned.

## Context budget

- Beyond Define's Inputs: targeted greps of `schema.ts`, `shared/patient.ts`, the link's loader,
  segments and content, the console's goal trail, and her 14 Sept text in
  `runs/september-sources/01_scope/output/scope.md` — to ground the open points (no data for
  "recipes tried"; the vocabulary has no sleep/hydration categories).
