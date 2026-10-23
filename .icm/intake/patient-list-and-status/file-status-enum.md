# Stub: Every file carries one of four statuses, defined once and changed through one function

- feature-slug: file-status-enum
- epic: patient-list-and-status
- story: 5
- sequence: 1 of 4
- depends-on: none
- complexity: medium
- priority: P0

## Problem

Story 5 and story 30 define the file's lifecycle. Nothing on `main` holds it. `status` on
`patient_profiles` is the retention lifecycle, a different fact. Every other epic needs the
same four values.

## Proposed change

Add `file_status` to `patient_profiles` with the values `to_complete` (« Dossier à
compléter »), `ready` (« Prêt pour consultation »), `to_validate` (« Recommandations à
valider »), `active` (« Accompagnement actif »). The French labels live in one map. One
function `setFileStatus(patient, next, actor, reason)` applies the allowed transitions and
writes an audit event. The migration sets today's patients per Morgane's question 2.

## Acceptance criteria

- [ ] The four values and their French labels exist in one module. No other file spells them
- [ ] `setFileStatus` refuses a transition the table does not allow and returns a `Result` error
- [ ] Each applied transition writes an audit event with the previous and next status and the reason
- [ ] The migration adds the column, not null, and sets every existing row to the status Morgane chose
- [ ] The retention `status` column is untouched and still drives `ended`
- [ ] The allowed transitions: `to_complete → ready`, `ready → to_validate`, `to_validate → active`, and `active → to_validate` on a new unvalidated change

## Out of scope

- Any screen. The triggers in other epics.

## Notes

- D-31, D-32. Touches `schema.ts` and the migrations journal, so it goes first across every epic that reads it.
- Label per Morgane's question 1. Default « Dossier à compléter ».
