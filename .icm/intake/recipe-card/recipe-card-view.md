# Stub: The patient reads a recipe with everything needed to cook it

- feature-slug: recipe-card-view
- epic: recipe-card
- story: 25
- sequence: 1 of 4
- depends-on: none
- complexity: medium
- priority: P0

## Problem

The token link shows a prose recipe. The patient needs quantities, units, times and numbered steps on a phone screen.

## Proposed change

A recipe page on `apps/web` under the patient account. It shows the name, the short description, preparation time, cooking time, the number of portions, the ingredient list with quantity and unit per line, the numbered steps with temperature and duration where present, the label « proposé par REMI » and the justification when the recipe carries one. The page opens from « Recettes » (today's list) and from « Mes favoris ». A recipe that is not the patient's own returns 404.

## Acceptance criteria

- [ ] The card shows name, description, preparation time, cooking time, portions, ingredients with quantity and unit, and numbered steps.
- [ ] A step with a temperature or a duration shows it on the step.
- [ ] A patient cannot open another patient's recipe.
- [ ] The card is readable on a phone with one dominant action per screen.
- [ ] A recipe whose gate result is not `confirmed` never renders.

## Out of scope

- Portions, favourites, sharing, the shopping list button.

## Notes

D-26, D-30. Files: `apps/web/app/[locale]/(patient)/recettes/[id]/page.tsx`, a card component in `packages/ui` if the console reuses it (story 32). Cross-epic: `recipe-space/recipe-structure` (the shape), `recipe-space/patient-recipes-today` (the entry point), `practitioner-daily-recipes/daily-recipe-read` (reuses the component).
