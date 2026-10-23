# Stub: One home for every automatic calculation, and the BMI function

- feature-slug: calculations-table
- epic: bmi
- story: 7
- sequence: 1 of 2
- depends-on: none
- complexity: medium
- priority: P0

## Problem

`main` stores no calculation. Stories 7, 8 and 9 each need an estimated value, a validated
value and the parameters used, kept apart. Without one table, three epics add three shapes.

## Proposed change

Add `patient_calculations`: one row per patient and `kind` (`bmi`, `protein`, `energy`),
with `estimated_value`, `estimate_parameters` (jsonb), `estimated_at`, `validated_value`,
`validation_parameters` (jsonb), `validated_at`, `validated_by`, `needs_revalidation`
(boolean). Add to `patient_profiles` the practitioner-entered `special_situation`
(`none`, `pregnancy_1`, `pregnancy_2`, `pregnancy_3`, `lactation_first_6_months`,
`lactation_after_6_months`, `pathology`, `malnutrition`) and `special_situation_note`.
Add the pure function `bmi(weightKg, heightCm)` and the WHO class function in
`packages/services/src/shared/calculations.ts`, with unit tests. Record every write of a
validated value as an audit event. Add the « Calculs » slot to the patient file, empty
until stub 2 fills it.

## Acceptance criteria

- [ ] The migration adds `patient_calculations` with one row per patient and kind, and the two profile columns.
- [ ] `bmi(65, 165)` returns 23.9 and the class « Corpulence normale ». The test runs in CI.
- [ ] The four WHO classes are a table in code, with their French labels.
- [ ] An estimated value and a validated value are separate columns. Writing one never changes the other.
- [ ] A write of `validated_value` creates an audit event with the parameters used.
- [ ] The patient file shows a « Calculs » slot under the patient's data. It says « Aucun calcul » for now.

## Out of scope

- The BMI display, alert and recalculation (stub 2).
- The protein and energy functions (`protein-needs`, `energy-needs`).

## Notes

- Decisions kept: D-25 (one database, the migration runs on production only), D-30
  (« estimation » until validated), D-32 (validation is an audit event).
- Files: `packages/services/src/db/schema.ts`, a new migration, `shared/calculations.ts`,
  the patient file page under `apps/admin/app/(admin)/patients/[id]/`.
- cross-epic: `patient-file-view` owns the file layout. This stub adds the slot only.
- Shared files first: this stub carries the schema change for the three calculation epics.
