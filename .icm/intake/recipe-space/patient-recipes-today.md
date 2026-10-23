# Stub: The patient opens « Recettes » and sees today's recipe for each meal

- feature-slug: patient-recipes-today
- epic: recipe-space
- story: 24
- sequence: 4 of 5
- depends-on: weekly-plan-generation
- complexity: medium
- priority: P0

## Problem

The token link shows a static list of assigned recipes. The story wants today's proposals, by meal, behind the patient account, and nothing before activation.

## Proposed change

A « Recettes » screen on `apps/web`, under the patient account, as the second tab of story 31. It lists today's plan in the order petit-déjeuner, repas de midi, collation (only when enabled), repas du soir. Each item shows the name, the preparation time and the label « proposé par REMI ». A tap opens the card (`recipe-card`). Below the day, the entry « Mes favoris ». Before activation the screen shows the waiting message of story 22 and no recipe. The token segment `[locale]/p/[token]/recettes` is removed.

## Acceptance criteria

- [ ] A patient whose file is not « Accompagnement actif » sees no recipe on any route.
- [ ] Today is the patient's day in Europe/Brussels.
- [ ] The meals appear in the fixed order and the collation appears only when the structure enables it.
- [ ] A day with no plan row shows « Aucune recette proposée aujourd'hui ».
- [ ] Each recipe shows « proposé par REMI ».
- [ ] The screen is usable on a phone with the fixed bottom navigation of story 31.
- [ ] The old token route for recipes returns 404.

## Out of scope

- The card itself, favourites, sharing, the shopping list.

## Notes

D-26, D-27. Files: `apps/web/app/[locale]/(patient)/recettes/page.tsx` (the route group is `patient-signup-account`'s), removal of `apps/web/app/[locale]/p/[token]/recettes/`. Cross-epic: `patient-signup-account` (the session), `care-activation` (the status), `patient-home-navigation` (the tab bar), `recipe-card/recipe-card-view`.
