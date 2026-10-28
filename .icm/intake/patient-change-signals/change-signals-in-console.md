# Stub: The practitioner sees each patient change on the file and in the list, and clears it

- feature-slug: change-signals-in-console
- epic: patient-change-signals
- story: 21
- sequence: 2 of 4
- depends-on: patient-change-table
- complexity: medium
- priority: P0

## Problem

The console shows no sign that a patient changed a value after validation.

## Proposed change

On the patient file, a block « Modifications du patient » lists the unacknowledged changes: field, old value, new value, date. A button « Pris en compte » per change, and one for all, sets the acknowledgement and writes an audit event. The patient list shows an indicator on each file with an unacknowledged change (cross-epic: `patient-list-and-status`). From the block, « Mettre à jour les recommandations » opens the working copy (cross-epic: `protocol-versions/working-copy-and-validate`). There the practitioner updates the protocol and validates a new version.

## Acceptance criteria

- [ ] An unacknowledged change shows on the file with field, old value, new value and date.
- [ ] The patient list shows an indicator on a file with one or more unacknowledged changes.
- [ ] « Pris en compte » clears the signal on the file and in the list.
- [ ] An acknowledgement is an audit event with the practitioner and the time.
- [ ] A validated recommendation does not change when a signal is raised or cleared.
- [ ] From the signal block, « Mettre à jour les recommandations » opens the working copy of `protocol-versions/working-copy-and-validate`.

## Out of scope

- The list page itself: `patient-list-and-status`.

## Notes

D-30, D-32. Files: `apps/admin/app/(admin)/patients/[id]/`, the list component. Cross-epic: `patient-list-and-status`, `protocol-versions/working-copy-and-validate`.
