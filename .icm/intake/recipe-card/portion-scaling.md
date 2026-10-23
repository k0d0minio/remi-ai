# Stub: The patient sets the number of people and every quantity follows

- feature-slug: portion-scaling
- epic: recipe-card
- story: 25
- sequence: 3 of 4
- depends-on: recipe-card-view
- complexity: low
- priority: P0

## Problem

A recipe is generated for one portion. The patient cooks for a household.

## Proposed change

A people control on the card, from 1 to 12. Each quantity is multiplied and rounded to a sensible step for its unit (whole eggs, 5 g, 10 ml, 0.5 piece). The ingredient list and the constraints never change. Only numbers do. The last chosen value is saved as the patient's household size and pre-fills the next card and the shopping list.

## Acceptance criteria

- [ ] Changing the number of people updates every quantity at once.
- [ ] No ingredient is added or removed by scaling. The allergen flags and the gate result are unchanged.
- [ ] Rounding never shows a quantity of zero for an ingredient with a non-zero base.
- [ ] The chosen value persists for the patient and pre-fills the next recipe.
- [ ] The base portion count stays visible as « pour 1 personne » beside the control.

## Out of scope

- Unit conversion between families (grams to cups). Nutrition totals per portion.

## Notes

The rounding table lives once in `packages/services/src/shared/quantities.ts`. The shopping list reuses it. Files: the card component, `patient_profiles` gains `household_size` (one migration, small). Cross-epic: `shopping-list/shopping-list-build` reuses the scaling.
