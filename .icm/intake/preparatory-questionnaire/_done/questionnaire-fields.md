# Stub: The profile holds every questionnaire field, and today's data moves into it without loss

- feature-slug: questionnaire-fields
- epic: preparatory-questionnaire
- story: 4
- sequence: 1 of 5
- depends-on: none
- complexity: high
- priority: P0

## Problem

`patient_profiles` holds allergies and intolerances as free text and lacks activity level,
desired weight, consultation reason, pathologies, celiac flag, the genotype trio and the gate
answer, and the free question's answer. Stories 4, 7, 8, 9 and 24 all read these.

## Proposed change

One migration. On `patient_profiles`: `sex_for_calculation`, `activity_level` (four keys),
`desired_weight_kg`, `consultation_reason`, `pathologies`, `celiac_disease`, `genetic_test`
(`yes`, `no_or_unknown`, null), `apoe`, `dio2`, `amy1a`, `practitioner_question_answer`,
`no_known_allergies`, `no_known_intolerances`. A `patient_allergens` table (Jamie's question
1): patient, kind (`allergy` or `intolerance`), key from the enum, sub-key or `all`, `other`
text. The enums live in `packages/services/src/shared/questionnaire.ts`. Today's free-text
allergies and intolerances become one `other` row each, per Morgane's question 1. The old
columns stay until every reader moves.

## Acceptance criteria

- [ ] The migration adds every column and the table, and runs on the one database once (D-25)
- [ ] Every existing free-text allergy and intolerance appears as an `other` row. No text is dropped
- [ ] The enums for diet, allergens, sub-lists, intolerances and activity levels exist in one shared module with their French labels
- [ ] The four activity levels carry their NAP coefficient (1.4, 1.6, 1.8, 2.0) in the same module
- [ ] `patient_profiles.sex` is not reused for the calculation. `sex_for_calculation` is its own field
- [ ] The service exposes read and write functions for the new fields with tests

## Out of scope

- Any page. Removing the old free-text columns.

## Notes

- D-30. Touches `schema.ts` and the migrations journal, so it goes first and before `patient-file-creation/practitioner-creates-file`.
- Age stays derived from `birth_date` at read time, never stored (the 28 Aug rule).
