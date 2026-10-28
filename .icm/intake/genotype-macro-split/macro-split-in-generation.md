# Stub: Generation follows the validated split over the day

- feature-slug: macro-split-in-generation
- epic: genotype-macro-split
- story: 10
- sequence: 3 of 3
- depends-on: macro-split-proposal
- complexity: low
- priority: P0

## Problem

A split that generation ignores changes no recipe. Story 10: the proportions guide the day's
meals, never one dish, and only validated values reach generation.

## Proposed change

The generation context block (`packages/services/src/ai/context.ts`) gains the validated split:
the three percentages, the protein target in g/day and the orientation.
`recipe-space/weekly-plan-generation` reads it per day and passes a day-level target to each
meal's call. A `macro` row that is not validated, or whose mode is `required` or `practitioner`
and undecided, is absent from the block. The post-generation check compares the day's planned
meals with the ranges and logs the deviation. It rejects nothing on the split alone. The split is
rank 4 of D-30.

## Acceptance criteria

- [ ] The context block carries the validated split and the orientation, or nothing when none is validated
- [ ] A `required` or `practitioner` row that is undecided reaches no generation
- [ ] The target applies per day. No single meal is forced to the day's percentages
- [ ] The three percentages need not total 100. REMI normalises nothing and passes the ranges as they are
- [ ] The orientation reaches the prompt as a soft preference. No eviction and no food limit is derived from a genotype
- [ ] Protéines reach the block in g/day and in %
- [ ] The day's deviation from the ranges is logged with the generation id
- [ ] Unit tests cover a validated split, an unvalidated one and DEFAULT

## Out of scope

- The prompt text and the recipe schema (`recipe-space`). Any rejection of a recipe on the split.

## Notes

- D-16, D-30 (rank 4), D-35. Files: `packages/services/src/ai/context.ts`, the generation service of `recipe-space`.
- cross-epic: `recipe-space/weekly-plan-generation`, `protocol-versions`.
