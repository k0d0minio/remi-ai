# Stub: The practitioner or the patient enters the appointment date, shown on the file and the list

- feature-slug: appointment-date
- epic: patient-file-creation
- story: 1
- sequence: 4 of 5
- depends-on: practitioner-creates-file
- complexity: low
- priority: P0

## Problem

Story 1: « Le praticien ou le patient peut renseigner la date du rendez-vous. » Story 5 sorts
the list by it. Story 4 asks for it in the questionnaire. There is no such column.

## Proposed change

Add `appointment_at` to `patient_profiles`, nullable, one date (Morgane's question 4). The
practitioner edits it on the file. The patient enters it in the questionnaire
(`preparatory-questionnaire/questionnaire-flow`). Both write the same column.

## Acceptance criteria

- [ ] The file shows the appointment date, or « Non renseigné »
- [ ] The practitioner can set, change and clear it on the file
- [ ] The questionnaire's « date de consultation » writes the same column
- [ ] A change writes an audit event with the old and new value

## Out of scope

- Calendar integration. Reminders. A history of appointments.

## Notes

- cross-epic: `patient-list-and-status/patient-list` sorts on this column. `preparatory-questionnaire/questionnaire-flow` writes it.
