# Stub: Lifestyle advices have a table of their own, and the patient-side read model exists

- feature-slug: advice-table
- epic: lifestyle-advice
- story: 17
- sequence: 1 of 2
- depends-on: none
- complexity: medium
- priority: P0

## Problem

Advice on sleep, stress, movement or hydration is scattered in two recommendation categories as title and detail. The story wants six categories, several advices each, with frequency, moment and duration, and a history.

## Proposed change

A table `patient_lifestyle_advices`: patient, category (one of six keys), text (not empty), frequency, moment, duration (each nullable text), position, `deactivated_at`, `deleted_at`. One migration that also moves every `habit` row into « comportements alimentaires » and every `activity` row into « activité physique », title and detail joined into text. A service with add, update, deactivate, delete and `validatedAdvices(patientId)`, which returns active, validated advices only. Each write is an audit event.

## Acceptance criteria

- [ ] The migration adds `patient_lifestyle_advices` and moves the `habit` and `activity` rows into it.
- [ ] A save with an empty text is refused.
- [ ] « Fréquence », « Moment de la journée » and « Durée » are optional. Each one saves empty.
- [ ] Several advices can exist in one category for one patient.
- [ ] A deactivated advice is absent from `validatedAdvices` and present in the history read.
- [ ] `validatedAdvices` returns nothing for a patient whose protocol is not validated.
- [ ] Every write is an audit event (D-32).

## Out of scope

- The console section (advice-section).
- The patient page (patient-recommendations).

## Notes

- D-25: one migration, production only. D-32: audit.
- Shared files first: this stub owns the schema change.
- Files: `schema.ts`, a migration, `packages/services/src/db/services/patient-lifestyle-advices/`, `shared/patient.ts` (the six category keys, the two old keys removed).
- cross-epic: protocol-versions (validation state), patient-recommendations (reader).
