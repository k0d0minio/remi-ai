# Stub: The practitioner adds, modifies, suspends and ends interventions with the patient's medications in view

- feature-slug: intervention-form
- epic: supplement-interventions
- story: 18
- sequence: 2 of 2
- depends-on: intervention-fields
- complexity: medium
- priority: P0

## Problem

The console's supplement rows take four fields. The story's form takes ten, four of them mandatory, and the practitioner must see what the patient already takes while she writes.

## Proposed change

On the console patient page, the supplements section becomes « Compléments et interventions » with « + Ajouter une recommandation ». The form shows type, route, moment and frequency as lists with a free option, and name, dose, duration or dates, reason and precautions under a fold. A save with a mandatory field empty is refused and names the field. Each row has « Modifier », « Suspendre », « Terminer ». A suspended or ended row stays in the list under its status. Beside the form, a read-only panel « Déclaré par le patient » shows the medications and supplements the patient declared. REMI adds no dose and no interaction note.

## Acceptance criteria

- [ ] Type, route, moment and frequency are mandatory. Name, dose, reason, duration and precautions are optional.
- [ ] « Modifier », « Suspendre » and « Terminer » keep the row in history with its status.
- [ ] The declared medications and supplements show beside the form, read-only.
- [ ] REMI pre-fills no dose and shows no interaction it did not receive from the practitioner.
- [ ] Several rows can be added before one save.

## Out of scope

- An interaction check.
- The patient page.

## Notes

- D-27: the console, practitioner role. Follows the section-save pattern on main.
- Files: the console patient page, `section-save.ts`, `patient-supplements/`.
- cross-epic: preparatory-questionnaire (the declared medications' future home). Until it ships, the panel reads `patient_profiles.medications` and `.supplements`.
