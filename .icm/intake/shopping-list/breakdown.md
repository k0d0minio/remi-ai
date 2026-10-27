# Breakdown: shopping-list — from recipes to the shop, with no calculation and no copying

- epic-slug: shopping-list
- source: story 26 « Liste de courses », Morgane Paquet, 15 October 2026, https://drive.google.com/file/d/1jHRJ44QefdTCD7SQIeUq0hbeSSZtSm0W/view
- story: 26

## What I understood

The patient picks one or several recipes, says for how many people, and REMI builds one list. Identical ingredients across recipes are added together. Units stay honest. The patient ticks what is bought and can send the list to their own e-mail. Because the list comes from gated recipes, no excluded ingredient can appear on it. Story 31 places the action on a recipe or a selection and keeps the current list reachable from « Recettes », with no extra tab.

Nothing on `main` does this. The epic reads the structured ingredients of `recipe-space/recipe-structure` and the rounding of `recipe-card/portion-scaling`. The e-mail goes through the email seam (Resend). The `web` Vercel project does not carry `RESEND_API_KEY` and `EMAIL_FROM` today. The e-mail stub adds them to the catalogue. Rests on D-26, D-30.

### Questions for Morgane

1. The patient sees today's recipes and the favourites. Is a list built from those only? Default: yes.
2. Pantry staples such as salt, oil and pepper: on the list or skipped? Default: on the list, grouped at the end under « Déjà à la maison ? ».
3. Group the list by shop section (fruits et légumes, frais, épicerie)? Default: no, one alphabetical list for the MVP.
4. The e-mail: needed for 1 December or for the open day? Default: the open day.

### Questions for Jamie

1. Aggregation key: the CIQUAL food code when the generation matched one, else the normalised ingredient name plus the unit family. Default: as stated.
2. One current list per patient, or a history? Default: a history. The newest list is « en cours ».
3. The e-mail sender for the product: `EMAIL_FROM` on the `web` project. Default: the same address as the console, on the verified domain.

## Build order

1. shopping-list-build — the selection, the people count, the aggregation and the table — depends-on: none
2. shopping-list-screen — the list reachable from « Recettes », tick bought items — depends-on: shopping-list-build
3. shopping-list-email — « Envoyer par e-mail » through the email seam — depends-on: shopping-list-screen

## Criteria → stubs

| #   | Morgane's criterion (short, her French kept)                                        | Stub                 |
| --- | ----------------------------------------------------------------------------------- | -------------------- |
| 1   | « Le patient indique le nombre de personnes avant la génération »                   | shopping-list-build  |
| 2   | « Les quantités sont proportionnelles au nombre de personnes »                      | shopping-list-build  |
| 3   | « Un même ingrédient […] apparaît une seule fois, avec la quantité totale agrégée » | shopping-list-build  |
| 4   | « Les unités sont affichées sans conversions trompeuses »                           | shopping-list-build  |
| 5   | « Le patient peut cocher les articles déjà achetés »                                | shopping-list-screen |
| 6   | « un ingrédient exclu n'y est jamais ajouté »                                       | shopping-list-build  |
| 7   | « s'envoyer la liste de courses par e-mail »                                        | shopping-list-email  |

## Out of scope

- A shop-section layout, prices, a retailer link, sharing the list with another person.
- A list from recipes the patient cannot see (future days). Story 24 shows today only.
