# Project: general-feedback

The run's context card — what a fresh session needs before it reads anything else. Pointers,
not copies: the spec stays the spec, the scope stays the scope. Seeded when the run is opened
(`new-run.sh` → `run-pack.sh --init`), sharpened by whichever stage learns something. Read with
`status.md` and `handoff.md` on every resume (`_shared/stage-preamble.md`).

- stub: intake/patient-loop/general-feedback.md
- scope: ../september-sources/01_scope/output/scope.md (the amendment that cut this stub; D-19)
- spec: 02_define/output/spec.md
- touches: packages/services/src/db, apps/web/app/[locale]/p/[token], apps/web/components/patient-link, apps/web/lib/patient-link, apps/web/lib/content, apps/admin/app/(admin)/patients, apps/admin/components/patients, apps/admin/components/audit, .icm/docs/RETENTION.md
- complexity: standard → model: sonnet (executor — select-model.sh --stage 03_build)

## Constraints

- One general thread per patient; no per-recipe / per-recommendation comments (her § 6).
- The token is the whole credential (D-2): writes go through the existing link-writes path only.
- No outbound channel — no email, push, scheduler or cron (D-9).
- Messages are append-only; nothing clears unread on its own (D-37).
- Reuse the meal journal's awaiting pattern and components; no second design.

## Context budget

- Define read a few admin/web files by grep (the meal awaiting count, `visibleSegments`, the patient list's challenge badge, the operators table) to fill `touches:` and the reply-author rule. Within budget.
