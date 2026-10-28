# Breakdown: practitioner-daily-recipes — the practitioner sees what REMI proposed to a patient today

- epic-slug: practitioner-daily-recipes
- source: story 32 « Consultation des recettes du jour proposées par REMI (praticien) », Morgane Paquet, 15 October 2026, https://drive.google.com/file/d/1DY4De439l8Q5s6QnRYI_gR-GJGyW44jR/view
- story: 32

## What I understood

In the patient's file, the practitioner opens a tab « Recettes du jour » and reads the recipes REMI proposed to that patient today, in meal order, by name, read-only, with no history of previous days. An empty day shows « Aucune recette proposée aujourd'hui ». Story 31 asked for this as a separate practitioner story, distinct from the patient navigation. The document's own heading says « 31 », the file is numbered 32. The breakdown follows the file.

On `main` the console's patient page shows Morgane's hand assignments from `patient_recipe_assignments`. This tab reads `patient_meal_plan` and `patient_recipes` instead. The practitioner sees only their own patients (D-27). Rests on D-26, D-27, D-30.

### Questions for Morgane

1. Story 31 asks for a history of proposed recipes per patient. Story 32 gives today only. Is today enough for the MVP? Default: yes.
2. « Aujourd'hui » is the patient's day in Europe/Brussels? Default: yes.

### Questions for Jamie

1. Reuse the patient's card component in the console for the read-only view? Default: yes, from `packages/ui`.
2. Keep `daily-recipe-read`? It goes beyond the story. Default: yes, as P1.

## Build order

1. daily-recipes-tab — the tab, today's names in meal order, the empty state — depends-on: none
2. daily-recipe-read — a name opens the recipe read-only — depends-on: daily-recipes-tab

## Criteria → stubs

| #   | Morgane's criterion (short, her French kept)                                   | Stub                                 |
| --- | ------------------------------------------------------------------------------ | ------------------------------------ |
| 1   | « accède aux recettes du jour depuis le dossier du patient »                   | daily-recipes-tab                    |
| 2   | « Seules les recettes du jour proposées au patient sélectionné »               | daily-recipes-tab                    |
| 3   | « dans l'ordre des repas, sans historique des jours précédents »               | daily-recipes-tab                    |
| 4   | « Aucune modification ni validation », « Aucune recette proposée aujourd'hui » | daily-recipes-tab, daily-recipe-read |

## Out of scope

- A history of days. Regenerating or replacing a recipe from the console. Editing a recipe.
- The hand-assignment flow of `patient_recipe_assignments`. It is no longer the patient's source after `recipe-space`.
