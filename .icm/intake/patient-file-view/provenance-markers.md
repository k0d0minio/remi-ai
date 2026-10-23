# Stub: The file tells apart what the patient declared, what is absent and what the practitioner entered, and the practitioner corrects in place

- feature-slug: provenance-markers
- epic: patient-file-view
- story: 6
- sequence: 3 of 5
- depends-on: file-page-frame
- complexity: medium
- priority: P0

## Problem

Story 6: « distinguer sans ambiguïté ce que le patient a déclaré, ce qui est absent et ce
qu'il a lui-même validé » and « permettre au praticien de compléter ou de corriger lui-même
une donnée du patient ».

## Proposed change

Each questionnaire field carries a provenance: `patient`, `practitioner`, or absent. A small
marker and a tooltip show « Déclaré par le patient le … », « Saisi par vous le … » or
« Non renseigné ». An in-place edit control opens the same input as the questionnaire. A save
writes the value, sets the provenance to `practitioner`, and writes an audit event with old
and new. Validated recommendations keep their own marker in their epics.

## Acceptance criteria

- [ ] Every questionnaire field shows one of the three provenance states
- [ ] The practitioner edits any field (per Morgane's question 3) with the same input and rules as the patient's questionnaire
- [ ] A save changes the provenance to `practitioner` and the audit page shows the old and new value
- [ ] A practitioner's save of an allergy or intolerance follows the same list rules as the questionnaire
- [ ] Filling a missing mandatory field from the file removes it from the missing list and can flip the status to « Prêt pour consultation »

## Out of scope

- Validation of recommendations (stories 13 to 19). The patient's post-validation changes (next stub).

## Notes

- D-30, D-32. Store the provenance per field in one map column, as `patient_edited_fields` does today, or widen that map. Jamie decides in the pull request.
- cross-epic: `patient-list-and-status/file-status-enum`.
