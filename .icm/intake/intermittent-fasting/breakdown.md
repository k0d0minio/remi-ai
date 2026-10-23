# Breakdown: intermittent-fasting — the practitioner removes one meal, REMI fills the others

- epic-slug: intermittent-fasting
- source: story 12 « Jeûne intermittent », Morgane Paquet, 15 October 2026, https://drive.google.com/file/d/1KPiBPsjBaTb6Vd7pVQSlGqhbNa2s46HE/view
- story: 12

## What I understood

One option on the patient's configuration, off by default: « Aucun jeûne intermittent »,
« Suppression du petit-déjeuner » or « Suppression du dîner ». One value at a time. Only the
practitioner sets it, and may change or remove it at any time. REMI asks for no times and
no fasting duration. REMI proposes no recipe for the removed meal and spreads the validated
daily needs over the kept meals. It never compensates with oversized portions. When the
daily targets cannot be met on two meals, REMI flags it to the practitioner and never lowers
the targets alone. The other validated recommendations, the total evictions and the
contra-indications still apply (D-30).

On `main` nothing holds this. The option is one column on `patient_meal_slots`
(cross-epic: `meal-structure/meal-configuration`), because it is one more fact about the
day's meals. The generator reads it (cross-epic: `recipe-space`).

### Questions for Morgane

1. Does the fasting option reach the recipes only after the protocol validation, like every recommendation? Default: yes.
2. When the removed meal is also switched off in the meal configuration, is one result enough, with no conflict shown? Default: yes.

### Questions for Jamie

1. Store the option on `patient_meal_slots` as one patient-level column, or on `patient_profiles`? Default: a `fasting` column on the patient's meal configuration row set.

## Build order

1. fasting-option — the column, the three-value control, practitioner only, audit — depends-on: none
2. fasting-in-generation — the meals to generate, the spread of the daily targets, the coverage flag — depends-on: fasting-option

## Criteria → stubs

| # | Morgane's criterion (short, her French kept) | Stub |
|---|---|---|
| 1 | « Par défaut, aucun jeûne intermittent n'est appliqué » | fasting-option |
| 2 | « Désactivé par défaut et peut être activé directement par le praticien » | fasting-option |
| 3 | « Une seule option est active à la fois » | fasting-option |
| 4 | « Suppression du petit-déjeuner … REMI ne propose aucune recette pour ce repas » | fasting-in-generation |
| 5 | « Suppression du dîner … REMI ne propose aucune recette pour ce repas » | fasting-in-generation |
| 6 | « Aucun horaire ni aucune durée de jeûne ne sont demandés ou contrôlés par REMI » | fasting-option |
| 7 | « Les suggestions respectent les autres recommandations validées, notamment les évictions totales et les contre-indications » | rule: README (D-30) |
| 8 | « Les besoins nutritionnels journaliers validés restent inchangés ; REMI répartit les apports entre les repas maintenus » | fasting-in-generation |
| 9 | « REMI ne compense pas automatiquement … par des portions excessives ; … il le signale au praticien » | fasting-in-generation |
| 10 | « Si leur couverture sur deux repas n'est pas réalisable, REMI le signale au praticien plutôt que de réduire automatiquement les objectifs » | fasting-in-generation |
| 11 | « Le praticien peut modifier ou désactiver le jeûne intermittent à tout moment » | fasting-option |

## Out of scope

- Fasting windows, times, durations, a patient-side timer.
- A patient-set fasting option. Only the practitioner sets it.
