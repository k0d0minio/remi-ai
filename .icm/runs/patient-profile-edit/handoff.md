# Handoff: patient-profile-edit

For the next session — human or agent — what to do first and what stands in the way.
Rewritten, not appended, at every stage stop; a stage that STOPs mid-way writes it before it
stops, so nothing is carried in anyone's head.

## Next steps

1. Operator reads `02_define/output/spec.md` (or the PR's Spec block); a change goes through
   `revise patient-profile-edit "<what>"`.
2. Once **Spec approved** is ticked on https://github.com/k0d0minio/remi-ai/pull/131, run
   `build patient-profile-edit` and follow `plan.md` pass by pass.

## Blockers

- blocked on operator: tick **Spec approved** in the body of https://github.com/k0d0minio/remi-ai/pull/131

## Do not

- Do not start Build before the tick; do not tick it.
- Do not touch `birth_date` or the 18+ rule (D-23 is out of scope for this run).
- Do not widen the admin patient form beyond the time and budget selects.
