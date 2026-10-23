# Stub: A field the patient changed after validation is marked on the file with the old and new value

- feature-slug: post-validation-change-markers
- epic: patient-file-view
- story: 6
- sequence: 5 of 5
- depends-on: provenance-markers
- complexity: low
- priority: P1

## Problem

Story 6: « Signaler sur la fiche les données modifiées par le patient après validation. »
Story 21 defines the signal: field, old value, new value, date, cleared when acknowledged.

## Proposed change

Each field with an unacknowledged change from `patient-change-signals` shows a marker
« Modifié par le patient le … », the old and the new value, and « Pris en compte ». The
missing list and the header show a count. Acknowledging calls the signal epic's function.

## Acceptance criteria

- [ ] A field with an unacknowledged change shows the marker, the old value, the new value and the date
- [ ] « Pris en compte » clears the marker and the list indicator
- [ ] The header shows « n modifications à prendre en compte » when n is above zero
- [ ] A calculation that reads a changed field shows « à revalider » in the calculations section

## Out of scope

- Storing and acknowledging the signal (`patient-change-signals`, story 21).

## Notes

- cross-epic: `patient-change-signals` (story 21) must merge first. `patient-list-and-status/list-indicators` shows the same count.
- P1: needed before 19 December, after activation exists.
