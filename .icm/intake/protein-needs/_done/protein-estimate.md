# Stub: REMI estimates the daily protein need and proposes the adaptations

- feature-slug: protein-estimate
- epic: protein-needs
- story: 8
- sequence: 1 of 2
- depends-on: none
- complexity: medium
- priority: P0

## Problem

Nothing on `main` estimates proteins. The practitioner computes them outside REMI.

## Proposed change

Add the pure function `proteinNeed({ referenceWeightKg, coefficient })` and
`proteinProposal(profile)` in `shared/calculations.ts`. The default reference weight is the
current weight. The default coefficient is 0.83 g/kg/day. The proposal lists adaptations
the practitioner must confirm: age 65 and over proposes 1 to 1.2 g/kg/day; `pregnancy_1`,
`pregnancy_2`, `pregnancy_3` add 1, 9 and 28 g/day; `lactation_first_6_months` adds
19 g/day and `lactation_after_6_months` 13 g/day; `pathology`, `malnutrition` and `other`
(« situation particulière ») mark the estimate « validation obligatoire ». When the BMI is under 18.5 or at 25 and above, the
proposal carries the note « Un poids de référence protéique différent peut devoir être
évalué ». Write the result to the `protein` row of `patient_calculations` as the estimate
with its parameters. When the weight is missing, write nothing and name it.

## Acceptance criteria

- [ ] `proteinNeed({ referenceWeightKg: 75, coefficient: 1.2 })` returns 90. The test runs in CI.
- [ ] With weight 65 kg and no adaptation the estimate is 54 g/day (65 × 0.83, rounded to the gram).
- [ ] At age 65 the proposal offers a coefficient from 1 to 1.2 g/kg/day. REMI applies none alone.
- [ ] Each pregnancy trimester and each lactation period adds its gram value to the proposal.
- [ ] `pathology`, `malnutrition` or `other` marks the estimate « validation obligatoire ».
- [ ] A BMI outside 18.5 to 25 adds the reference-weight note. REMI imposes no weight.
- [ ] A missing current weight produces no estimate and the text « Non renseigné : poids actuel ».
- [ ] The estimate row keeps the reference weight, the coefficient and the adaptations used.

## Out of scope

- The console inputs and the validation (stub 2).
- Any change to the real weight, the BMI or the energy estimate.

## Notes

- Decisions kept: D-30 (estimate until validated, missing data named), D-32.
- Files: `shared/calculations.ts` and its tests, the calculations service.
- cross-epic: `bmi/calculations-table` (the table and `special_situation`),
  `bmi/bmi-indicator` (the alert condition).
- Age is derived from `birth_date` on the day of the calculation, never stored.
