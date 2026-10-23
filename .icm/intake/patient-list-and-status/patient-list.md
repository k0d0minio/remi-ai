# Stub: A practitioner sorts their patient list by appointment date or by name, and the choice stays

- feature-slug: patient-list
- epic: patient-list-and-status
- story: 5
- sequence: 2 of 4
- depends-on: file-status-enum
- complexity: medium
- priority: P0

## Problem

The roster at `(admin)/patients` sorts on `last_edited_at` and shows every patient to every
operator. Story 5 wants the practitioner's own patients, two sorts, the status and the
appointment date.

## Proposed change

Rework `(admin)/patients/page.tsx`. Rows: nom, prénom, status label, appointment date, a link
to the file. Two sorts: « Date de rendez-vous » (no date last) and « Nom » (nom, then
prénom). The choice is stored per practitioner (Jamie's question 2). The default is Morgane's
question 3. The query goes through the care-relationship scope.

## Acceptance criteria

- [ ] The list shows only the signed-in practitioner's patients
- [ ] Sorting by appointment date puts patients without a date at the end, oldest date first
- [ ] Sorting by name orders on nom, then prénom, case and accent insensitive
- [ ] The chosen sort is remembered across sessions for that practitioner
- [ ] Each row shows the French status label from the one map
- [ ] Each row opens the file in one click

## Out of scope

- Which files appear (next stub). Indicators (last stub).

## Notes

- cross-epic: `patient-file-creation/care-relationship` (scope), `patient-file-creation/appointment-date` (the column).
