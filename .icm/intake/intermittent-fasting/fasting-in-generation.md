# Stub: REMI skips the removed meal, keeps the daily targets, and flags what two meals cannot cover

- feature-slug: fasting-in-generation
- epic: intermittent-fasting
- story: 12
- sequence: 2 of 2
- depends-on: fasting-option
- complexity: medium
- priority: P0

## Problem

Without a rule, a generator fills the removed meal, or shrinks the day's targets to fit two
meals, or inflates the portions. All three are wrong.

## Proposed change

Add the pure function `mealsToGenerate(slots, fasting)` in `shared/meals.ts`: the enabled
meals minus the removed one. Add `coverageCheck(dailyTargets, meals)`: it spreads the
validated energy and protein targets over the kept meals by the practitioner's
orientations, with a per-meal ceiling, and returns `feasible` or the shortfall. When the
check returns a shortfall, the patient file shows « Objectifs journaliers difficiles à
couvrir sur <n> repas : <détail> » and REMI changes no target. The generator
(`recipe-space`) calls both functions before it writes a day.

## Acceptance criteria

- [ ] With `skip_breakfast`, `mealsToGenerate` returns no breakfast. With `skip_dinner`, no dinner.
- [ ] With `none`, the result equals the enabled meals.
- [ ] A removed meal that is also disabled in the configuration gives the same result and no conflict.
- [ ] `coverageCheck` keeps the daily targets as they are. No output lowers a target.
- [ ] A spread that needs a meal above the ceiling returns a shortfall, not larger portions.
- [ ] A shortfall shows the French message in the patient file and creates no change to the protocol.
- [ ] The tests cover the three options and both targets.

## Out of scope

- The recipes themselves and the prompt (`recipe-space`).
- Any patient-facing message about fasting.

## Notes

- Decisions kept: D-30 (validated targets are the frame, never lowered alone).
- Files: `shared/meals.ts` and tests, the patient file page.
- cross-epic: `recipe-space` calls these functions. `energy-needs/calorie-target-validation`
  and `protein-needs/protein-target-validation` provide the targets. Runs before
  `meal-structure/meal-orientation-rules`.
