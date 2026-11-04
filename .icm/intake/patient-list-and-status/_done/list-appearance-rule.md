# Stub: A self-registered file appears in the list only once complete, a practitioner-created one at once

- feature-slug: list-appearance-rule
- epic: patient-list-and-status
- story: 5
- sequence: 3 of 4
- depends-on: patient-list
- complexity: low
- priority: P0

## Problem

Story 5: a patient who signs up appears « uniquement après avoir complété l'ensemble des
champs obligatoires du questionnaire préparatoire, avec le statut « Prêt pour consultation »,
sans intervention du praticien ». A file the practitioner created appears at once as
« Dossier à compléter ».

## Proposed change

The list query includes a file when its origin is the practitioner, or when its origin is the
patient and `file_status` is `ready` or later. Add `created_by` (`patient` or `practitioner`)
to `patient_profiles` if the audit trail cannot answer it in one read. The questionnaire's
completion flips `to_complete → ready` through `setFileStatus`.

## Acceptance criteria

- [ ] A patient who leaves the questionnaire incomplete is saved and absent from the list
- [ ] The same patient appears as « Prêt pour consultation » the moment the last mandatory field is saved
- [ ] A practitioner-created file is in the list at once as « Dossier à compléter »
- [ ] No duplicate row appears when a practitioner-created file is later taken over by the patient
- [ ] The rule is one function with tests for the four cases above

## Out of scope

- The questionnaire's definition of mandatory (`preparatory-questionnaire`).

## Notes

- cross-epic: `preparatory-questionnaire/questionnaire-flow` calls the flip. `patient-file-creation/practitioner-creates-file` sets the origin.
