# Stub: The patient turns one or several recipes into one list, for the right number of people

- feature-slug: shopping-list-build
- epic: shopping-list
- story: 26
- sequence: 1 of 3
- depends-on: none
- complexity: medium
- priority: P0

## Problem

The patient reads quantities on each card and adds them by hand. The story wants one list, aggregated and scaled.

## Proposed change

A « Liste de courses » action on a card and on a multi-select of today's recipes and favourites. Before building, REMI asks the number of people, pre-filled with the household size. A new table `patient_shopping_lists` stores the recipe ids, the people count and the items as rows: name, quantity, unit, food code when known, checked flag. Identical ingredients are merged by food code, else by normalised name and unit family. Quantities are scaled with the rounding table of `portion-scaling`. The same ingredient in two unit families stays two lines. The list only ever contains ingredients of gated recipes.

## Acceptance criteria

- [ ] The patient chooses one or several recipes and a number of people before the list is built.
- [ ] Every quantity is proportional to the number of people.
- [ ] An ingredient present in several recipes appears once with the summed quantity.
- [ ] No unit is converted across families. Grams stay grams. Pieces stay pieces.
- [ ] A test proves a list never contains an ingredient the recipes do not contain.
- [ ] Deleting a patient removes their lists.

## Out of scope

- The screen, ticking, the e-mail.

## Notes

D-25: this stub owns its migration. D-30 (inherited through the recipes). Files: `schema.ts`, one migration, `packages/services/src/server/shopping/*`, `shared/quantities.ts`. Cross-epic: `recipe-space/recipe-structure`, `recipe-card/portion-scaling`.
