# Stub: An abandoned patient-profile-edit attempt left a column in production and a branch behind

- lane: chore
- found-by: `patient-profile-edit` Build (PR #131) · 2026-09-25
- size: S

## Problem

A first attempt at `patient-loop/patient-profile-edit`, on branch
`claude/patient-profile-edit-define-rnkw88` (20 Sept, migration `0020_aspiring_grandmaster`),
never merged — but its admin preview migrated the shared production database
(`previews-migrate-the-shared-database`), without a row in drizzle's ledger. It left
`patient_profiles.preferences_updated_by_patient_at` (timestamptz, no reader anywhere in the code)
and pre-created `cooking_time`, which made PR #131's first migration fail with 42701 until it was
rewritten `IF NOT EXISTS`. The branch is still on the remote and describes a different design
(one timestamp for the whole segment, `food_budget` blanked) that no longer matches what shipped.

## Proposed change

A forward migration `ALTER TABLE "patient_profiles" DROP COLUMN IF EXISTS
"preferences_updated_by_patient_at"` once PR #131 has merged, and delete the remote branch
`claude/patient-profile-edit-define-rnkw88` (the operator's call — it is on GitHub, not in this
repo's tree).

## Acceptance criteria

- [ ] Production's `patient_profiles` has no `preferences_updated_by_patient_at` column
- [ ] The abandoned branch is gone from the remote, or kept with a reason recorded here
