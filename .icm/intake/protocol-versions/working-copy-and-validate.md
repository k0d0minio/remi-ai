# Stub: The practitioner edits a working copy and validates it into the next version

- feature-slug: working-copy-and-validate
- epic: protocol-versions
- story: 20
- sequence: 2 of 3
- depends-on: protocol-version-table
- complexity: high
- priority: P0

## Problem

A change the practitioner saves must not reach the patient or the generation until the practitioner validates it. Nothing marks the difference today.

## Proposed change

The live protocol tables become the working copy. The patient file compares the working copy with the last version and shows « Modifications non validées » when they differ. A button « Valider les recommandations » writes the next version (`protocol-version-table`) and writes an audit event. One read API, `getValidatedProtocol(patientId)`, returns the latest version's snapshot. Generation and the patient space read only that API. A new version deletes no recipe and no assignment.

## Acceptance criteria

- [ ] A saved change that differs from the last version shows « Modifications non validées » on the file.
- [ ] « Valider les recommandations » creates version n+1 and clears the mark.
- [ ] `getValidatedProtocol` returns the latest version, or nothing when the file has none.
- [ ] A working-copy change does not alter what `getValidatedProtocol` returns.
- [ ] A new version deletes no row in `recipes` or `patient_recipe_assignments`.
- [ ] The first save of a recommendation on a file at « Prêt pour consultation » moves it to « Recommandations à valider » (D-31).
- [ ] Each validation is an audit event.

## Out of scope

- The first validation as activation: `care-activation/activation-action` calls this stub's action.
- Consumers of the read API: `recipe-space`, `meal-improvement`, `patient-recommendations`.

## Notes

D-30, D-31, D-32. Files: `apps/admin/app/(admin)/patients/[id]/`, `packages/services/src/services/`. Cross-epic: `patient-list-and-status` (the status enum), `care-activation/activation-action`.
