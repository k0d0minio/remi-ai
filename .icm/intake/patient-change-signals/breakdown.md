# Breakdown: patient-change-signals — the practitioner misses no change the patient makes

- epic-slug: patient-change-signals
- source: story 21 « Modifications du patient après validation », Morgane Paquet, 15 October 2026, https://drive.google.com/file/d/1d8YYWcEnE0cdqM3GGA-obNGEaOeio0lR/view
- story: 21

## What I understood

The patient may change their profile at any time, also after the protocol is validated. Each change raises a signal for the practitioner: the field, the old value, the new value, the date. The signal shows on the file and as an indicator in the patient list. A calculation that rests on a changed field is shown as « estimation à revalider ». The signal clears when the practitioner acknowledges it. Validated recommendations do not change by themselves. Story 30 adds one rule: allergies, intolerances, evictions and the diet the patient declares apply at once to recipes and suggestions, and are signalled. On `main` a patient write through the link is attributed and audited (`patient_link_writes`, `audit_events`) but nothing compares old and new, and the console shows no indicator. Rests on D-26, D-30, D-32.

### Questions for Morgane

1. Which patient fields raise a signal: every field, or the health ones only (weight, height, activity, diet, allergies, intolerances, medications, supplements, genotype, goal weight)? Default: the health ones. E-mail and phone do not.
2. Story 30 says the patient's declared evictions apply at once. Can a patient declare an eviction, or only allergies, intolerances and diet? Default: only allergies, intolerances and diet. Evictions stay yours.
3. When a patient adds an allergy, do today's proposed recipes that contain it disappear at once? Default: yes.
4. Does acknowledging a signal require you to open the field, or is one click « Pris en compte » enough? Default: one click.

### Questions for Jamie

1. Write the signal from the patient-side server action, or from a database trigger? Default: the server action, through one `recordPatientChange` helper every patient write calls.

## Build order

1. patient-change-table — the `patient_changes` table, its migration, the write helper — depends-on: none
2. change-signals-in-console — the signals on the file, the indicator in the list, « Pris en compte » — depends-on: patient-change-table
3. recalculate-flag — calculations marked « estimation à revalider » after a change — depends-on: patient-change-table
4. immediate-safety-fields — allergies, intolerances and diet apply at once to generation — depends-on: patient-change-table

## Criteria → stubs

| # | Morgane's criterion (short, her French kept) | Stub |
|---|---|---|
| 1 | « Chaque modification déclenche un signalement visible dans le dossier et dans la liste des patients » | change-signals-in-console |
| 2 | « Le signalement indique le champ modifié, l'ancienne valeur, la nouvelle valeur et la date » | patient-change-table |
| 3 | « Le signalement disparaît quand le praticien l'a pris en compte » | change-signals-in-console |
| 4 | « Les recommandations déjà validées restent inchangées » | rule: README (D-30) |
| 5 | « Seules les recommandations validées sont appliquées aux prochaines recettes » | cross-epic: protocol-versions/working-copy-and-validate |
| 6 | « Un calcul basé sur une donnée modifiée est affiché comme estimation à revalider » | recalculate-flag |
| 7 | « Le praticien peut prendre en compte la modification, mettre à jour les recommandations et valider une nouvelle version » | change-signals-in-console |
| 30 | « Les modifications des allergies, intolérances, évictions et du régime alimentaire déclarées par le patient sont appliquées immédiatement et signalées au praticien » | immediate-safety-fields |

## Out of scope

- The patient's edit screens: `preparatory-questionnaire` and `patient-home-navigation/profile-tab`.
- The new version after the practitioner updates: `protocol-versions`.
