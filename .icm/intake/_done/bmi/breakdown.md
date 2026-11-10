# Breakdown: bmi — REMI computes the BMI and flags the values outside the normal range

- epic-slug: bmi
- source: story 7 « Calcul de l'IMC », Morgane Paquet, 12 October 2026, https://drive.google.com/file/d/1mhip0m9haJqVpay7NyJpaimPvM6OKhMJ/view
- story: 7

## What I understood

REMI computes the BMI from the current weight and the height, on the WHO formula and the
four WHO classes. The result is an indicator, never a diagnosis. A BMI under 18.5 or at 25
and above is flagged to the practitioner. REMI never adjusts anything from it. The
practitioner cannot type a BMI. A correction of the weight or the height recomputes it. No
other parameter changes it. When a datum is missing, REMI computes nothing and names the
datum.

On `main`, `patient_profiles` holds `height_cm` and `weight_kg` and no calculation. This epic
adds the one home for every automatic calculation, `patient_calculations`, which stories 8
and 9 reuse. An estimated value and a practitioner-validated value live in separate columns,
with the parameters used and an audit event (D-32). The « Calculs » summary slot sits in the
patient file (cross-epic: `patient-file-view`). The rule « estimation » until validation is
story 30's (D-30).

### Questions for Morgane

1. Does the BMI alert also show in the patient list, or only in the file? Default: file only.
2. Is the BMI shown with one decimal, as in your example (23,9)? Default: one decimal.

### Questions for Jamie

1. One `patient_calculations` table with a `kind` column, or columns on the profile? Default: one table, one row per patient and kind, the history in `audit_events`.

## Build order

1. calculations-table — the `patient_calculations` table, the special-situation columns, the BMI function with tests — depends-on: none
2. bmi-indicator — the BMI in the console: classes, alert, recalculation, missing data — depends-on: calculations-table

## Criteria → stubs

| #   | Morgane's criterion (short, her French kept)                                                                             | Stub               |
| --- | ------------------------------------------------------------------------------------------------------------------------ | ------------------ |
| 1   | « Le calcul est effectué seulement si la taille et le poids actuel sont renseignés et valides »                          | bmi-indicator      |
| 2   | « Les classes affichées sont : < 18,5 … ≥ 30 obésité »                                                                   | bmi-indicator      |
| 3   | « Tout IMC < 18,5 ou ≥ 25 déclenche un signalement au praticien, sans ajustement nutritionnel automatique »              | bmi-indicator      |
| 4   | « Le poids de référence protéique et l'objectif calorique validé peuvent être modifiés sans changer l'IMC »              | bmi-indicator      |
| 5   | « Le résultat est identifié comme indicateur, et non comme diagnostic »                                                  | bmi-indicator      |
| 6   | « Le recalcul est déclenché après correction du poids actuel ou de la taille ; … un autre paramètre … ne déclenche pas » | bmi-indicator      |
| 7   | « Exemple de contrôle : femme, 35 ans, 165 cm, 65 kg … → IMC 23,9 »                                                      | calculations-table |
| 8   | « Si une donnée nécessaire est manquante, REMI n'effectue pas le calcul et indique la donnée manquante »                 | bmi-indicator      |

## Out of scope

- The protein reference weight and the calorie target (`protein-needs`, `energy-needs`).
- A BMI for a patient under 18. The 18+ rule stands (D-23).
- Any adjustment of the protocol from the BMI. The alert is the whole effect.
