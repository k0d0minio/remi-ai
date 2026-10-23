# Stub: One function decides whether a recipe or dish may be shown to a patient

- feature-slug: compatibility-gate
- epic: eviction-safety
- story: 14
- sequence: 1 of 3
- depends-on: none
- complexity: high
- priority: P0

## Problem

Three features will show food to a patient. Each must apply the same exclusions in the same way. A rule written three times drifts, and a prompt is not a guarantee.

## Proposed change

A pure function in `packages/services`, `checkCompatibility(candidate, exclusions)`. The candidate is a list of ingredients, each a CIQUAL food code or a free-text name. The exclusions are the patient's active evictions (validated directives of kind `exclude`, with period or durable status), the declared allergies and intolerances (applied at once, with no practitioner validation), and the declared regime. The result is `compatible`, `excluded` with the matching ingredient and reason, or `uncertain` with the ingredient REMI could not resolve. Callers treat `uncertain` as `excluded`. The function never removes an exclusion, never expires one by itself, and never reintroduces a food. A fixture set covers gluten with cross-contamination, a nut family with « Tous », a trace-level association, a free-text ingredient and a coeliac patient (gluten strict).

## Acceptance criteria

- [ ] A candidate with an ingredient under an eviction returns `excluded` and names the ingredient.
- [ ] A candidate with an ingredient REMI cannot resolve returns `uncertain`, and every caller hides it.
- [ ] A declared allergy or intolerance excludes with no practitioner validation.
- [ ] A declared regime excludes the foods it forbids (story 30).
- [ ] An eviction past its end date is still applied. The function never lifts one.
- [ ] Unit tests cover the fixture set above and run green in CI.

## Out of scope

- Reading the patient's rows. The function takes its inputs. A thin loader beside it assembles them from food-directives and the profile.
- The suspension (suggestion-suspension).

## Notes

- D-16: safety in code after generation. D-30: exclusions win over everything.
- Files: `packages/services/src/ai/compatibility.ts` and its test, a loader in `patient-food-directives/`.
- cross-epic: food-directives/directive-application (the exclude list), preparatory-questionnaire (structured allergies and intolerances), recipe-space, meal-improvement, restaurant-menu (callers).
