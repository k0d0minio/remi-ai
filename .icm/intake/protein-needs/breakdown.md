# Breakdown: protein-needs — REMI estimates the protein need, the practitioner validates it

- epic-slug: protein-needs
- source: story 8 « Calcul des besoins protéiques », Morgane Paquet, 12 October 2026, https://drive.google.com/file/d/1wqZ9_c3_MYSIbRcvayxFItvAKM5rYU2i/view
- story: 8

## What I understood

REMI estimates the daily protein need as a reference weight times a coefficient. The
default is the current weight times 0.83 g/kg/day, the EFSA reference. The practitioner may
change the reference weight, the coefficient or the final g/day independently. The last
validated final value prevails for the suggestions. A change of the reference weight never
changes the real weight, the BMI or the energy estimate. REMI proposes adaptations and the
practitioner confirms them: 1 to 1.2 g/kg/day at 65 and over, additions for pregnancy by
trimester and for lactation, and a mandatory validation for pathology, malnutrition or any
special situation. A BMI outside 18.5 to 25 raises a note that a different reference weight
may need evaluation. REMI imposes no replacement weight. Every value is an estimate until
the practitioner validates it, and the suggestions use it as a guide, not a rule.

On `main` nothing computes proteins. This epic writes the `protein` row of
`patient_calculations` (cross-epic: `bmi/calculations-table`) and reads the special
situation stored there. The nutrition rules of September stay as they are.

### Questions for Morgane

1. For a pregnant or lactating patient, do the additions apply on top of the estimate before validation? Default: yes.
2. Is « pathologie, dénutrition ou situation particulière » a list you pick from, plus a free note? Default: yes, a list and a note.
3. Is the protein result shown in whole grams? Default: yes.

### Questions for Jamie

1. Does the suggestions engine read `validated_value` only, and ignore the estimate? Default: yes.

## Build order

1. protein-estimate — the function, the adaptations proposed, the BMI note, the `protein` row — depends-on: none
2. protein-target-validation — the summary, « Modifier », the three independent inputs, the validation and its record — depends-on: protein-estimate

## Criteria → stubs

| # | Morgane's criterion (short, her French kept) | Stub |
|---|---|---|
| 1 | « La valeur de référence (0,83), le poids de référence, le coefficient et la valeur finale sont consultables » | protein-target-validation |
| 2 | « Modifier le poids de référence protéique sans affecter le poids réel, l'IMC ou les besoins énergétiques » | protein-target-validation |
| 3 | « Saisir directement un objectif protéique en g/jour, qui prévaut après validation » | protein-target-validation |
| 4 | « Alerte si l'IMC est hors de la plage 18,5 à < 25 » | protein-estimate |
| 5 | « 65 ans ou plus, REMI propose le coefficient 1 à 1,2 ; le praticien confirme » | protein-estimate |
| 6 | « Grossesse : +1 g/j, +9 g/j, +28 g/j. Allaitement : +19 g/j puis +13 g/j » | protein-estimate |
| 7 | « Pathologie, dénutrition ou situation particulière : validation du praticien obligatoire » | protein-target-validation |
| 8 | « Si une donnée nécessaire est manquante, REMI n'effectue pas le calcul » | protein-estimate |
| 9 | « Toutes les valeurs restent des estimations tant que le praticien ne les a pas validées » | protein-target-validation |
| 10 | « Les modifications du praticien …, leur validation et les paramètres utilisés sont enregistrés » | protein-target-validation |
| 11 | « Exemple : patient à 100 kg, poids de référence 75 kg, 1,2 g/kg/j → 90 g/j ; l'IMC continue à utiliser les 100 kg » | protein-estimate |

## Out of scope

- How the suggestions engine spreads the proteins across meals (`recipe-space`).
- Protein content of foods (CIQUAL is on `main` already).
