# Handoff: challenges

For the next session — human or agent — what to do first and what stands in the way.
Rewritten, not appended, at every stage stop; a stage that STOPs mid-way writes it before it
stops, so nothing is carried in anyone's head.

## Next steps

1. The operator reads `02_define/output/spec.md` and ticks **Spec approved** on
   https://github.com/k0d0minio/remi-ai/pull/120 — or runs `revise challenges "<change>"`.
2. Then `build challenges`, following `plan.md` pass by pass.

## Blockers

- The Spec approved tick — the operator's.

## Do not

- Do not start Build before the tick; never tick it.
- Do not open a second PR for this run; `revise` re-projects #120.
- Do not run `patient-documents-and-links` or `general-feedback` beside this run — they share
  `schema.ts` and the migrations journal and are sequenced after it.
