# Stub: The practitioner sees the estimate and validates a calorie target apart from it

- feature-slug: calorie-target-validation
- epic: energy-needs
- story: 9
- sequence: 2 of 2
- depends-on: energy-estimate
- complexity: medium
- priority: P0

## Problem

The estimate is a maintenance value. The practitioner must set the target for this
patient, above, equal or below it, and REMI must never set a restriction alone.

## Proposed change

In the « Calculs » slot, show « Métabolisme de repos », « Besoins énergétiques estimés »,
« Objectif calorique validé » and a « Modifier » button. The detail opens on « Modifier »
and offers « Voir le détail du calcul » for the formulas. The practitioner records the goal
(« maintien », « perte de poids », « prise de poids », « prise de masse musculaire ») and
the special situation (pregnancy and trimester, lactation, pathology, malnutrition). The
practitioner corrects the activity level or another real datum, which recomputes the
estimate. The practitioner types a target in kcal/day or a difference in kcal/day from the
estimate. « Valider » writes `validated_value` and its parameters and creates an audit
event. A new estimate after a validated target shows a proposal and waits for a new
« Valider ». REMI sets no restriction from the BMI or from a weight-loss goal.

## Acceptance criteria

- [ ] The slot shows the resting metabolism, the estimated need and the validated target as three values.
- [ ] A change of the activity level recomputes the estimate and leaves the validated target as it was.
- [ ] The goal is one of the four values and is kept after save.
- [ ] A target of 2 000 kcal/day against an estimate of 2 300 saves both. The estimate stays 2 300.
- [ ] A difference of −300 kcal/day against 2 300 saves a target of 2 000.
- [ ] A weight-loss goal with no typed target leaves the target empty. REMI writes no target alone.
- [ ] After a validated target, a recomputed estimate changes the target only after a new « Valider ».
- [ ] « Voir le détail du calcul » shows the formula and the values used. The slot hides it by default.
- [ ] Each « Valider » creates an audit event with the goal, the situation, the estimate and the target.

## Out of scope

- The use of the target in generation (`recipe-space`).

## Notes

- Decisions kept: D-30, D-32.
- Files: the patient file page in `apps/admin`, the calculations service.
- cross-epic: `bmi/calculations-table` (`special_situation`), `protocol-versions`.
