# Stub: The practitioner sets and validates the protein target without touching the real weight

- feature-slug: protein-target-validation
- epic: protein-needs
- story: 8
- sequence: 2 of 2
- depends-on: protein-estimate
- complexity: medium
- priority: P0

## Problem

An estimate alone is not usable. The practitioner must adapt it to the patient and say
when it is valid. A changed reference weight must never leak into the BMI or the calories.

## Proposed change

In the « Calculs » slot, show « Protéines : <n> g/jour » and a « Modifier » button. The
detail opens on « Modifier » only. It shows the EFSA reference 0.83 g/kg/day, the reference
weight, the coefficient and the final g/day. The practitioner edits any of the three
independently. A direct g/day value is kept as typed. After a later change of the coefficient
or the reference weight REMI proposes a new value and waits for validation. It never
recomputes a validated value silently. « Valider » writes `validated_value` and its
parameters and creates an audit event. An estimate marked « validation obligatoire » shows
no value to the suggestions until validated. Every value shows the label « Estimation »
until validated.

## Acceptance criteria

- [ ] The slot shows the g/day value and « Modifier ». The parameters show only after « Modifier ».
- [ ] The reference 0.83, the reference weight, the coefficient and the final value are visible in the detail.
- [ ] A change of the reference weight changes no real weight, no BMI and no energy estimate.
- [ ] A direct g/day value prevails after « Valider ».
- [ ] After a validated direct value, a change of the coefficient shows a proposal and changes nothing until « Valider ».
- [ ] A `pathology` or `malnutrition` estimate cannot reach the suggestions before « Valider ».
- [ ] The label « Estimation » shows until validation, then « Validé le <date> ».
- [ ] Each « Valider » creates an audit event with the reference weight, the coefficient and the final value.

## Out of scope

- Reading the value in the suggestions engine (`recipe-space`).

## Notes

- Decisions kept: D-30, D-32.
- Files: the patient file page in `apps/admin`, the calculations service.
- cross-epic: `protocol-versions` may later fold this validation into the protocol version. This stub validates one value.
