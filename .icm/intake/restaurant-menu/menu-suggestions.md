# Stub: REMI marks the dishes that fit, says why, and never calls an unknown dish safe

- feature-slug: menu-suggestions
- epic: restaurant-menu
- story: 29
- sequence: 2 of 2
- depends-on: menu-photo-reading
- complexity: medium
- priority: P2

## Problem

A list of dishes does not tell the patient which one to order.

## Proposed change

A second structured call judges each read dish against the validated protocol version and returns one of four states: `suggested` with a one-sentence justification, `not suggested` with the reason class, `allergens to confirm`, or `unknown composition`. Only the validated version is read. Code then runs each suggested dish's named ingredients through `eviction-safety/compatibility-gate`. A dish that names an evicted food, an allergen or an intolerance is never `suggested`. A dish whose composition is known but whose allergens are not confirmed is shown as « Allergènes à confirmer » and never as suggested. A dish with no readable composition is shown as « Composition inconnue » and never as safe. Above the list, always: « Vérifie auprès du serveur qu'aucun ingrédient à éviter n'est présent, même s'il n'est pas mentionné sur la carte. ».

## Acceptance criteria

- [ ] Each read dish shows one of the four states.
- [ ] Each suggested dish shows a short justification.
- [ ] No dish with an evicted food, a declared allergen or a declared intolerance is suggested.
- [ ] A dish with unknown composition is marked « Composition inconnue » and never marked safe.
- [ ] A dish whose composition is known but whose allergens are not confirmed is shown as « Allergènes à confirmer », never as suggested.
- [ ] Only the validated protocol version feeds the judgement. An unvalidated recommendation is never read.
- [ ] The waiter reminder is on every result screen.
- [ ] The call is one row in `ai_generations`.

## Out of scope

- Saving the choice. Nutrient estimates per dish.

## Notes

D-16, D-30. Files: `prompts/menu-judge.ts`, the restaurant result view. Cross-epic: `eviction-safety/compatibility-gate`, `protocol-versions` (the validated version).
