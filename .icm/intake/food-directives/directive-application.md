# Stub: Every recipe and suggestion reads the patient's validated directives from one place

- feature-slug: directive-application
- epic: food-directives
- story: 13
- sequence: 4 of 4
- depends-on: directive-resolution
- complexity: medium
- priority: P0

## Problem

Three epics generate food for the patient (recipes, the meal improvement, the restaurant bonus). Each must favour, limit or exclude the same foods in the same way. Without one read model, each would read the rows its own way.

## Proposed change

A service `activeDirectives(patientId)` returns the validated, non-archived directives as three lists with their resolved terms and food associations: favour (ordered by position), limit (with level), exclude (with period or durable status). A directive that is not validated is absent from the result. The generation context block (`packages/services/src/ai/context.ts`) gains the three lists. The post-generation check in eviction-safety reads the exclude list from the same function. The favour list raises the priority of its food sources. The limit list lowers quantity or frequency according to its level. Exclude wins over both.

## Acceptance criteria

- [ ] `activeDirectives` returns validated directives only. A pending, uncertain, unknown or archived row is absent.
- [ ] The context block carries « À favoriser », « À limiter » with level, and « Éviction totale » with period or durable status.
- [ ] A term in both favour and limit resolves in favour of limit. Exclude wins over both.
- [ ] A change to a directive reaches the next generation only after the protocol is validated (story 20).
- [ ] Unit tests cover the three lists and the precedence.

## Out of scope

- The generation itself (recipe-space, meal-improvement, restaurant-menu).
- The compatibility verdict (eviction-safety/compatibility-gate).

## Notes

- D-16: safety is checked in code after generation. D-30: the priority order.
- Files: `packages/services/src/ai/context.ts`, `patient-food-directives/`.
- cross-epic: protocol-versions (validation gates the read), eviction-safety/compatibility-gate (reads the exclude list), recipe-space, meal-improvement, restaurant-menu (readers).
