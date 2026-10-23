# Stub: A recipe name opens the recipe as the patient reads it, read-only

- feature-slug: daily-recipe-read
- epic: practitioner-daily-recipes
- story: 32
- sequence: 2 of 2
- depends-on: daily-recipes-tab
- complexity: low
- priority: P1

## Problem

A name alone does not let the practitioner judge the proposal. Morgane asks for « une consultation en lecture seule ».

## Proposed change

A tap on a name in « Recettes du jour » opens the recipe in the console with the same card component as the patient's, read-only: description, times, ingredients for one portion, steps, the justification when present. No favourite, no share, no portion control.

## Acceptance criteria

- [ ] The recipe opens from the tab and shows the same content the patient sees.
- [ ] No control on the console card writes anything.
- [ ] The view is scoped to the practitioner's own patients.

## Out of scope

- The patient's portions, favourites, sharing, shopping list.

## Notes

Files: `apps/admin/app/(admin)/patients/[id]/recettes/[recipeId]/page.tsx`, the card in `packages/ui`. Cross-epic: `recipe-card/recipe-card-view` (the component).
