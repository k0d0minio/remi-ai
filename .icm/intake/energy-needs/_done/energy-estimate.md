# Stub: REMI estimates the resting metabolism and the daily energy need

- feature-slug: energy-estimate
- epic: energy-needs
- story: 9
- sequence: 1 of 2
- depends-on: none
- complexity: medium
- priority: P0

## Problem

Nothing on `main` estimates energy. The practitioner computes it outside REMI.

## Proposed change

Add the pure functions `restingMetabolism({ sex, weightKg, heightCm, ageYears })` and
`energyNeed(restingMetabolism, activityLevel)` in `shared/calculations.ts`. Mifflin-St Jeor:
female `10 × poids + 6,25 × taille − 5 × âge − 161`, male `… + 5`. The NAP table:
`low` 1.4, `moderate` 1.6, `high` 1.8, `very_high` 2.0, with Morgane's French descriptions
as labels. Round both results to the kcal. The weight is always the current weight. Write
the result to the `energy` row of `patient_calculations` as the estimate with its
parameters. When the sex for the calculation, the age, the height, the weight or the
activity level is missing, write nothing and name the datum. Read `activity_level` and the
sex for the calculation from `patient_profiles`. When the questionnaire epic has not added
the two columns yet, this stub adds them.

## Acceptance criteria

- [ ] Female, 35, 165 cm, 65 kg, moderate: resting metabolism 1 345 kcal, need 2 152 kcal/day. The test runs in CI.
- [ ] Male, 40, 180 cm, 80 kg, low: resting metabolism 1 730 kcal, need 2 422 kcal/day.
- [ ] The four NAP levels carry the coefficients 1.4, 1.6, 1.8 and 2.0 and her French descriptions.
- [ ] A change of the protein reference weight changes no energy estimate.
- [ ] A missing activity level produces no estimate and the text « Non renseigné : niveau d'activité physique ».
- [ ] A sex other than female or male for the calculation produces no estimate and names « sexe utilisé pour le calcul ».
- [ ] The estimate row keeps the sex, the age, the height, the weight and the NAP used.

## Out of scope

- The console display and the target (stub 2).
- A macronutrient split.

## Notes

- Decisions kept: D-30, D-32.
- Files: `shared/calculations.ts` and tests, the calculations service, `schema.ts` only
  when the two columns are missing.
- cross-epic: `bmi/calculations-table` (the table), `preparatory-questionnaire` (owns
  `activity_level` and the sex used for the calculation; whichever merges first adds the
  columns, the other reuses them).
- The control values: 10 × 65 + 6.25 × 165 − 5 × 35 − 161 = 1 345.25; × 1.6 = 2 152.4.
