# Stub: The list flags files with missing information and files the patient changed after validation

- feature-slug: list-indicators
- epic: patient-list-and-status
- story: 5
- sequence: 4 of 4
- depends-on: patient-list
- complexity: low
- priority: P1

## Problem

Story 5: « Signaler sur le dossier et dans la liste les informations manquantes et les
modifications du patient survenues après validation. » The practitioner must see which files
need their action without opening each one.

## Proposed change

Two indicators on each row. « Informations manquantes » with the count of missing mandatory
fields, linking to the file's missing list. « Modifié par le patient » when an unacknowledged
patient change exists (`patient-change-signals`), linking to the change on the file.

## Acceptance criteria

- [ ] A row with missing mandatory fields shows the indicator and the count
- [ ] Clicking it opens the file scrolled to the missing list
- [ ] A row with an unacknowledged patient change shows « Modifié par le patient »
- [ ] Acknowledging the change on the file removes the indicator from the list
- [ ] A row with neither shows no indicator

## Out of scope

- The change signal's storage (`patient-change-signals`, story 21).

## Notes

- cross-epic: `patient-change-signals` (story 21), `patient-file-view/file-page-frame` (the missing list).
- P1: useful before 19 December, not on the 1 December path.
