# Stub: A generated recipe is structured data the card, the list and the plan can read

- feature-slug: recipe-structure
- epic: recipe-space
- story: 24
- sequence: 2 of 5
- depends-on: ai-gateway-adapter
- complexity: medium
- priority: P0

## Problem

`recipes` holds prose. A prose recipe cannot scale its portions, feed a shopping list or be checked ingredient by ingredient by the compatibility gate. The story needs quantities, units, steps and a seven-day plan per patient.

## Proposed change

Two new tables. `patient_recipes`: one generated recipe for one patient, with name, short description, preparation time, cooking time, base portions, ingredients as rows (quantity, unit, name, food code when matched, allergen flags), numbered steps with temperature and duration when needed, meal slot, season tags, prompt version, generation id, gate result, and an optional justification. `patient_meal_plan`: one row per day and enabled meal, pointing at the recipe, with the day in Europe/Brussels. `recipes` stays Morgane's library and becomes the template base (D-34): it gains the same structured shape and a `verified` flag. Generation reads it. The patient screen never reads it. A `patient_recipes` row names the template it started from.

## Acceptance criteria

- [ ] The zod schema of a generated recipe is the single definition the prompt, the table and the card share.
- [ ] A recipe row stores ingredients and steps as structured rows, never as one text.
- [ ] A plan row is unique per patient, day and meal slot.
- [ ] Deleting a patient removes their recipes and plan rows. The library `recipes` is untouched.
- [ ] A recipe row carries the gate result and is never shown while the result is not `confirmed`.
- [ ] A recipe row names the template it started from.
- [ ] A template in `recipes` feeds generation only when its `verified` flag is set.
- [ ] RETENTION.md says what a generated recipe holds and when it leaves.

## Out of scope

- Generation, display, scaling, favourites, sharing.

## Notes

D-25: this stub owns its migration and runs after `ai-gateway-adapter`. D-34: the templates are verified, more than twenty, in `recipes`. Files: `packages/services/src/db/schema.ts`, one migration, `packages/services/src/shared/` for the shared schema, `.icm/docs/RETENTION.md`. Cross-epic: `recipe-card/*`, `shopping-list/shopping-list-build` and `practitioner-daily-recipes/daily-recipes-tab` read these tables.
