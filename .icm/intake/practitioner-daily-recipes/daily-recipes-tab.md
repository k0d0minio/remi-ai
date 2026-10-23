# Stub: The practitioner opens « Recettes du jour » and reads today's proposals for a patient

- feature-slug: daily-recipes-tab
- epic: practitioner-daily-recipes
- story: 32
- sequence: 1 of 2
- depends-on: none
- complexity: low
- priority: P0

## Problem

The practitioner does not know what REMI proposed to a patient today without opening the patient's own space.

## Proposed change

A tab « Recettes du jour » in the practitioner's patient file in `apps/admin`. It reads today's `patient_meal_plan` rows for that patient in the order petit-déjeuner, déjeuner, collation, dîner, and shows each recipe's name and the label « proposé par REMI ». A day with no row shows « Aucune recette proposée aujourd'hui ». The tab has no action. A practitioner who does not follow this patient gets 404.

## Acceptance criteria

- [ ] The tab is in the patient file and shows only the selected patient's recipes for today.
- [ ] Recipes appear in meal order. Previous days are not shown.
- [ ] An empty day shows « Aucune recette proposée aujourd'hui ».
- [ ] No edit, validate or regenerate control exists on the tab.
- [ ] A practitioner cannot open the tab of a patient they do not follow.
- [ ] Today is computed in Europe/Brussels.

## Out of scope

- Opening the recipe. History. Any write.

## Notes

D-27. Files: `apps/admin/app/(admin)/patients/[id]/recettes/page.tsx`. Cross-epic: `recipe-space/recipe-structure` (the tables), `patient-file-view` (the file's tabs), `patient-list-and-status` (the practitioner scope).
