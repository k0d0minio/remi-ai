# Handoff: patient-profile-edit

For the next session — human or agent — what to do first and what stands in the way.
Rewritten, not appended, at every stage stop; a stage that STOPs mid-way writes it before it
stops, so nothing is carried in anyone's head.

## Next steps

1. Operator smokes the previews: the patient link at
   https://app-git-claude-happy-dirac-a5h7ig-remi21.vercel.app/fr/p/<a patient's token>/profil
   (edit, save, clear an allergy, a no-change save), then the console at
   https://admin-git-claude-happy-dirac-a5h7ig-remi21.vercel.app — the patient's profile summary
   (« Modifié par la patiente le … »), the form's time and budget selects, the copy-context export.
2. Operator ticks **Ready to merge** on https://github.com/k0d0minio/remi-ai/pull/131, then
   runs `release patient-profile-edit`.

## Blockers

- blocked on operator: smoke the previews and tick **Ready to merge** on https://github.com/k0d0minio/remi-ai/pull/131

## Do not

- Do not re-run or renumber 0024: it is already recorded in production's drizzle ledger (the
  preview applied it, accepted by the operator). A merge of `main` that brings a newer migration
  is resolved per CONVENTIONS.md → "Regenerate a migration, never renumber it" — and 0024 is
  idempotent if that ever happens.
- Do not drop `preferences_updated_by_patient_at` from production here — orphan of the abandoned
  branch `claude/patient-profile-edit-define-rnkw88`; a separate chore.
- Do not tick either gate.
