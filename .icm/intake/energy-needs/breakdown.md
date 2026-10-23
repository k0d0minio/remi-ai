# Breakdown: energy-needs — REMI estimates the energy need, the practitioner validates the calorie target

- epic-slug: energy-needs
- source: story 9 « Calcul énergétique », Morgane Paquet, 12 October 2026, https://drive.google.com/file/d/18sw_UXoztwUzQ2gx3RhP2Do0nNPGrc_K/view
- story: 9

## What I understood

REMI estimates the resting metabolism with Mifflin-St Jeor (1990), on the current weight,
the height, the age and the sex used for the calculation. It multiplies by the EFSA
activity coefficient (1.4, 1.6, 1.8, 2.0) to get the estimated daily need. Morgane names
this a hybrid choice, not the EFSA calculation itself. REMI shows two values apart: the
« besoins énergétiques estimés » on the real weight, and the « objectif calorique validé »
the practitioner chooses. The practitioner records a goal (maintien, perte de poids, prise
de poids, prise de masse musculaire) and a special situation, corrects the activity level
or another real datum, and types a target or a kcal/day difference. REMI never applies a
calorie restriction alone, not from the BMI and not from a weight-loss goal. A validated
target is never overwritten without a new confirmation. The suggestions use the validated
target as a guide, not a rigid obligation.

On `main` nothing computes energy. `patient_profiles` has no activity level. The
questionnaire epic owns `activity_level` and « sexe utilisé pour le calcul »; this epic
reads them. The `energy` row of `patient_calculations` is the home (cross-epic:
`bmi/calculations-table`). The special situation is the column that stub adds.

### Questions for Morgane

1. When the sex is « autre », does the patient choose a « sexe utilisé pour le calcul », female or male, as story 4 says? Default: yes.
2. Does the goal (maintien, perte, prise, masse) change the estimate? Default: no. It labels the target you choose.
3. Is the age taken from the birth date on the day of the calculation? Default: yes.

### Questions for Jamie

1. Round the resting metabolism and the need to the kcal? Default: yes, 1 345 and 2 152.
2. If `activity_level` is not on `main` when this epic starts, does `energy-estimate` add the column and the questionnaire epic reuse it? Default: yes.

## Build order

1. energy-estimate — Mifflin-St Jeor, the NAP table, the `energy` row, the missing-data rule — depends-on: none
2. calorie-target-validation — the two values, the goal and the situation, the target or the difference, no automatic restriction — depends-on: energy-estimate

## Criteria → stubs

| # | Morgane's criterion (short, her French kept) | Stub |
|---|---|---|
| 1 | « Le calcul n'est effectué qu'avec les données nécessaires disponibles (sexe, âge, taille, poids actuel, niveau d'activité) » | energy-estimate |
| 2 | « Le métabolisme de repos et les besoins énergétiques estimés en kcal/jour sont affichés » | calorie-target-validation |
| 3 | « Les besoins énergétiques estimés restent basés sur le poids actuel, même si le poids de référence pour les protéines est modifié » | energy-estimate |
| 4 | « Le niveau d'activité est modifiable par le praticien, avec recalcul » | calorie-target-validation |
| 5 | « L'objectif (maintien / perte de poids / prise de poids / prise de masse musculaire) est renseignable et conservé » | calorie-target-validation |
| 6 | « Saisir et valider un objectif calorique inférieur, égal ou supérieur …, ou un ajustement exprimé en kcal/jour » | calorie-target-validation |
| 7 | « REMI n'applique aucune restriction calorique automatiquement ; la cible … enregistrée séparément des besoins estimés » | calorie-target-validation |
| 8 | « Une cible manuelle validée n'est pas écrasée sans nouvelle confirmation » | calorie-target-validation |
| 9 | « Exemple de contrôle : femme, 35 ans, 165 cm, 65 kg, activité modérée → 1 345 kcal ; 2 152 kcal/jour » | energy-estimate |
| 10 | « Besoins estimés à 2 300 kcal/j ; le praticien valide une cible à 2 000 kcal/j. L'estimation reste 2 300 » | calorie-target-validation |

## Out of scope

- The split of the day's energy across meals (`meal-structure`, `recipe-space`).
- The macronutrient split (45 / 30 / 25 and the genotype table), which the questionnaire and `recipe-space` carry.
