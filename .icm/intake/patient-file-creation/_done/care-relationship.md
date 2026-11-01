# Stub: Every patient belongs to one practitioner, and every read is scoped to it

- feature-slug: care-relationship
- epic: patient-file-creation
- story: 1
- sequence: 1 of 5
- depends-on: none
- complexity: medium
- priority: P0

## Problem

`patient_profiles` has no practitioner. Every operator sees every patient. Stories 1, 3, 5 and
6 all require « le praticien ne voit que ses propres patients ».

## Proposed change

Add `practitioner_id` to `patient_profiles`, a reference to `operators`, not null. The
migration backfills every existing row to Morgane's operator (Jamie's question 2). Add a scope
helper in `packages/services/src/db/services/` that every patient query takes. The patient
list and the file pages use it from this stub on.

## Acceptance criteria

- [ ] The migration adds `practitioner_id`, backfills every row, and sets not null
- [ ] `patientsOf(practitionerId)` returns only that practitioner's patients
- [ ] The console's patient list and file pages call the scope helper
- [ ] A new patient row without a practitioner is refused by the service
- [ ] The service tests cover a two-practitioner fixture

## Out of scope

- The role rename `admin` / `practitioner` (`consent-and-data/data-access-scoping`).
- The admin's cross-practitioner access and its log.

## Notes

- D-27. Touches `schema.ts` and the migrations journal, so it goes first in this epic and before `consent-and-data/data-access-scoping`.
