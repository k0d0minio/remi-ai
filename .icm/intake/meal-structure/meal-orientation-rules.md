# Stub: The generator reads soft orientations, adapted to the diet, never above a restriction

- feature-slug: meal-orientation-rules
- epic: meal-structure
- story: 11
- sequence: 2 of 2
- depends-on: meal-configuration
- complexity: medium
- priority: P0

## Problem

A configuration is a preference. Applied as a quota it contradicts a validated diet or a
medical restriction. The generator needs one function that says what each meal may be.

## Proposed change

Add the pure function `resolveMealOrientations(slots, protocol)` in `shared/meals.ts`. It
returns, per enabled meal, the orientation to use, a flag `adapted` with the reason, and no
per-meal macronutrient quota. The day-level proportions stay the generator's. When the
validated diet is incompatible with an orientation (a « Plutôt glucidique » snack under a
validated ketogenic diet), the function returns a low-carb snack with `adapted: true` and
the reason. The console shows « Adapté au régime : <reason> » next to the meal and leaves
the practitioner's choice in place. When a practitioner orientation conflicts with a
medical restriction, the console shows « Conflit avec <restriction> » and asks
« Confirmer ? ». Without a confirmation the orientation is not used. Total evictions and
contra-indications are applied before any orientation (D-30).

## Acceptance criteria

- [ ] `resolveMealOrientations` returns one entry per enabled meal and none for a disabled meal.
- [ ] No output carries a per-meal macronutrient quota.
- [ ] With a validated ketogenic diet and a « Plutôt glucidique » snack, the output is a low-carb snack with `adapted: true`. The stored choice is unchanged.
- [ ] The console shows « Adapté au régime » on the adapted meal and does not change the select.
- [ ] A conflict with a medical restriction shows « Conflit avec … » and « Confirmer ? ». Until confirmed, the output marks the meal `unconfirmed`.
- [ ] A total eviction removes the food from every meal whatever the orientation. The test proves it.
- [ ] The tests cover the five orientations and the four meals.

## Out of scope

- The generation prompt and the recipes (`recipe-space`).
- The source of the medical restrictions (`food-directives`, `eviction-safety`).

## Notes

- Decisions kept: D-30 (priority order: restrictions first, then the validated diet, then the nutritional parameters).
- Files: `shared/meals.ts` and tests, the patient file page.
- cross-epic: `recipe-space` reads this function. `food-directives` and `eviction-safety`
  provide the restrictions it checks. `intermittent-fasting/fasting-in-generation` removes
  the skipped meal before this function runs.
