# Stub: A patient's new allergy, intolerance or diet applies to recipes at once

- feature-slug: immediate-safety-fields
- epic: patient-change-signals
- story: 21
- sequence: 4 of 4
- depends-on: patient-change-table
- complexity: medium
- priority: P0

## Problem

Story 30 rules that a patient's declared allergies, intolerances and diet apply immediately, independent of the practitioner's validation. Generation must read them live, not from the validated version.

## Proposed change

The generation context (cross-epic: `recipe-space`, `meal-improvement`) reads allergies, intolerances and diet from the live profile, and everything else from `getValidatedProtocol`. A patient change to one of these three fields hides every proposed recipe that contains an excluded ingredient from the current day onward, and raises a signal like any other change.

## Acceptance criteria

- [ ] A new patient allergy or intolerance applies to the next suggestion without a practitioner action.
- [ ] A changed diet applies to the next suggestion without a practitioner action.
- [ ] A proposed recipe that contains a newly excluded ingredient is no longer shown to the patient.
- [ ] The change raises a signal on the file and in the list.

## Out of scope

- Practitioner evictions: they stay in the validated version (`eviction-safety`).

## Notes

D-30 rule: « Les allergies, intolérances et évictions totales déclarées par le patient sont prises en compte immédiatement ». Question 2 of the breakdown decides whether a patient can declare an eviction. Cross-epic: `recipe-space`, `meal-improvement`, `eviction-safety`.
