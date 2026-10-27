# Breakdown: recipe-card — a recipe the patient can cook, scale, keep and pass on

- epic-slug: recipe-card
- source: story 25 « Fiche recette, portions et favoris », Morgane Paquet, 15 October 2026, https://drive.google.com/file/d/1kP6o2XwjUIs4CG7g6GB6DhvyWborK5JR/view
- story: 25

## What I understood

The patient opens a recipe and finds everything needed to cook it: name, description, times, ingredients with quantities, numbered steps, portions. The patient changes the number of people and every quantity follows. The patient keeps a recipe as a favourite, finds it in « Mes favoris », and removes it. The patient shares a recipe from the card or from the favourites through the phone's share sheet. The shared page carries the recipe, the REMI logo, « REMI, la nutrition sur mesure » and a link to the platform, and nothing about the patient.

On `main` the token link renders Morgane's prose recipes with no quantities to scale and no favourites (the four-button feedback stub was parked). This epic reads the structured recipe of `recipe-space/recipe-structure`. It rests on D-26 (the screen lives behind the patient account) and D-30. Story 24 repeats criteria 10, 11 and 14 to 17 of this story. They are built once, here.

### Questions for Morgane

1. Is sharing needed for the 1 December test, or for the open day? Default: the open day.
2. What does the shared page show besides the recipe? Default: the logo, the sentence « REMI, la nutrition sur mesure » and one link to remiai.be. No sign-up form.
3. When a new protocol version makes a favourite incompatible, hide it with a note or remove it? Default: hide it with « Plus compatible avec tes recommandations ». Never delete.
4. Does REMI remember the last number of people the patient chose? Default: yes, as the patient's household size.

### Questions for Jamie

1. Where does the public share page live? Default: `apps/web`, route `/r/<id>`, `noindex`, no locale prefix.
2. Does a share link expire? Default: no. The patient can revoke it later. Revocation is not in the MVP.
3. Does the share page read the live recipe or a snapshot? Default: a jsonb snapshot taken at share time, so a regeneration never changes a shared page.

## Build order

1. recipe-card-view — the card: fields, steps, label, justification when present — depends-on: none
2. favourites — keep and remove a recipe, « Mes favoris », a favourite re-checked on a new protocol version — depends-on: recipe-card-view
3. portion-scaling — the people control, quantities follow, constraints never change — depends-on: recipe-card-view
4. recipe-sharing — the share sheet, the public page, no personal data — depends-on: favourites

Stubs 2 and 4 each add a table. They run in this order and never in parallel (D-25).

## Criteria → stubs

| #   | Morgane's criterion (short, her French kept)                                       | Stub                                |
| --- | ---------------------------------------------------------------------------------- | ----------------------------------- |
| 1   | « Les quantités sont recalculées selon le nombre de portions choisi »              | portion-scaling                     |
| 2   | « Les consignes de sécurité […] restent inchangées lors du recalcul »              | portion-scaling                     |
| 3   | « Les favoris sont persistants dans le compte du patient »                         | favourites                          |
| 4   | « Une recette enregistrée en favori reste compatible avec les évictions validées » | favourites                          |
| 5   | « Le patient peut retirer une recette de ses favoris »                             | favourites                          |
| 6   | « étapes de préparation […] claires, précises, cohérentes et réalisables »         | recipe-space/weekly-plan-generation |
| 7   | partager « depuis sa fiche ou ses favoris », « sans compte REMI »                  | recipe-sharing                      |
| 8   | « ne révèle aucune donnée personnelle, information de santé ou recommandation »    | recipe-sharing                      |
| 9   | « Le logo REMI, la mention […] et le lien vers la plateforme »                     | recipe-sharing                      |

## Out of scope

- Generation and the plan: `recipe-space`.
- The shopping list button on the card: `shopping-list`. This epic leaves the slot.
- Editing a recipe. A patient never edits a recipe.
- Comments or ratings on a recipe. Story 30 rules out feedback questionnaires.
