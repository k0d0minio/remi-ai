# Stub: The practitioner sees the BMI, its class and an alert outside the normal range

- feature-slug: bmi-indicator
- epic: bmi
- story: 7
- sequence: 2 of 2
- depends-on: calculations-table
- complexity: low
- priority: P0

## Problem

The practitioner computes the BMI by hand. Nothing flags a value outside the normal range.

## Proposed change

In the « Calculs » slot, show the BMI with one decimal and its WHO class. Compute it only
when `height_cm` and `weight_kg` are present and plausible. When one is missing, show
« Non renseigné : <taille | poids actuel> » and no value. Flag a BMI under 18.5 or at 25
and above with a visible marker and the text « À évaluer par le praticien ». Label the
value « Indicateur, pas un diagnostic ». Recompute on every save of the weight or the height.
Offer no input for the BMI.

## Acceptance criteria

- [ ] With height 165 cm and weight 65 kg the file shows « IMC 23,9 · Corpulence normale ».
- [ ] With the height missing the file shows « Non renseigné : taille » and no BMI.
- [ ] A BMI of 17.9 or 25.0 shows the alert marker. A BMI of 22.0 shows none.
- [ ] The alert changes no protocol value. No automatic adjustment exists.
- [ ] The text « Indicateur, pas un diagnostic » is next to the value.
- [ ] A save of the weight recomputes the BMI. A save of the protein reference weight or the calorie target does not.
- [ ] No field lets the practitioner type a BMI.

## Out of scope

- The alert in the patient list (Question 1 for Morgane).
- Any effect on protein or energy values.

## Notes

- Decisions kept: D-30 (missing data is named, never invented).
- Files: the patient file page in `apps/admin`, the calculations service.
- cross-epic: `protein-needs/protein-estimate` reads the same alert condition.
