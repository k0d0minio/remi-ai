# Stub: Every change a patient makes is recorded with its old and new value

- feature-slug: patient-change-table
- epic: patient-change-signals
- story: 21
- sequence: 1 of 4
- depends-on: none
- complexity: medium
- priority: P0

## Problem

A patient write is audited but the old value is lost. The practitioner cannot see what changed.

## Proposed change

A table `patient_changes`: patient, field key, old value, new value, changed at, acknowledged at, acknowledged by. One helper `recordPatientChange` writes a row for each watched field whose value differs. Every patient-side profile write calls it. The helper writes a row only when the file holds a validated protocol version. The first questionnaire fill raises no signal. The watched fields are a list in one file, answered by question 1 of the breakdown. Its migration ships in this stub.

## Acceptance criteria

- [ ] A patient write that changes a watched field creates one `patient_changes` row per changed field.
- [ ] The row holds the field key, the old value, the new value and the time.
- [ ] A write that changes no watched field creates no row.
- [ ] A signal is raised only on a file that holds a validated protocol version. The first questionnaire fill raises no signal.
- [ ] The watched-field list lives in one file in the services package.
- [ ] `RETENTION.md` says changes are deleted with the patient.

## Out of scope

- Showing or acknowledging the signals: `change-signals-in-console`.

## Notes

D-25, D-26, D-32. Shared files first: `packages/services/src/db/schema.ts`, the migrations journal, `.icm/docs/RETENTION.md`. Cross-epic: `preparatory-questionnaire` and `patient-home-navigation/profile-tab` call the helper.
