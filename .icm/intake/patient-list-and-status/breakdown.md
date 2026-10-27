# Breakdown: patient-list-and-status — the practitioner sees every patient and where each file stands

- epic-slug: patient-list-and-status
- source: story 5 « Liste des patients et statuts du dossier », Morgane Paquet, 12 October 2026, https://drive.google.com/file/d/1swyg0ryARgMXKAVpzcWCgCSk-HXWIJrj/view
- story: 5

## What I understood

The practitioner's list shows all their patients, sorted by appointment date or by name, the
choice remembered. Each file carries one of four statuses: « Dossier à compléter » (the
practitioner created it, mandatory fields missing), « Prêt pour consultation » (the
questionnaire's mandatory fields are filled), « Recommandations à valider » (a first food
recommendation is saved), « Accompagnement actif » (validated and activated). A patient who
signs up appears in the list only once every mandatory field is filled. The list flags missing
information and patient changes after validation. On `main` the roster at `(admin)/patients`
sorts on `last_edited_at` and `status` holds the retention lifecycle (`active`, `ended`), a
different fact. This epic owns the enum (D-31). Other epics fire the transitions. It rests on
D-27, D-30, D-31, D-32.

### Questions for Morgane

1. Story 5 names « Dossier à compléter ». Story 30 names « inscription à compléter ». Which label? Default: « Dossier à compléter ».
2. Today's patients, after the migration: which status? Default: « Accompagnement actif ».
3. The sort is remembered. What is the first default? Default: by appointment date.

### Questions for Jamie

1. `file_status`: a Postgres enum, or text with the enum in code as today? Default: text, enum in code.
2. The remembered sort: a column on `operators` or a cookie? Default: a column.

## Build order

1. file-status-enum — the four statuses, one home, the transition function, the migration — depends-on: none
2. patient-list — the scoped list, two sorts remembered, status and appointment date shown — depends-on: file-status-enum
3. list-appearance-rule — a self-registered file appears only when complete, a practitioner-created one at once — depends-on: patient-list
4. list-indicators — missing information and unacknowledged patient changes flagged on the row — depends-on: patient-list

## Criteria → stubs

| #   | Morgane's criterion (short, her French kept)                                                                                                                      | Stub                                                          |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| 1   | « Le praticien ne voit que ses propres patients »                                                                                                                 | patient-list (scope: patient-file-creation/care-relationship) |
| 2   | « Le tri par date de rendez-vous place les patients sans date en fin de liste »                                                                                   | patient-list                                                  |
| 3   | « Le tri par ordre alphabétique se fait sur le nom, puis le prénom »                                                                                              | patient-list                                                  |
| 4   | « Le patient s'inscrit via le lien du praticien et complète directement son questionnaire préparatoire »                                                          | patient-signup-account/signup-page                            |
| 5   | « Le dossier apparaît automatiquement dans la liste … uniquement lorsque tous les champs obligatoires … sont remplis, avec le statut « Prêt pour consultation » » | list-appearance-rule                                          |
| 6   | « Le statut passe à « Recommandations à valider » dès que le praticien enregistre une première recommandation alimentaire »                                       | file-status-enum (trigger: food-directives, story 13)         |
| 7   | « Le statut passe à « Accompagnement actif » uniquement après validation des recommandations et activation »                                                      | file-status-enum (trigger: care-activation, story 19)         |
| 8   | « Si le patient quitte le questionnaire … ses réponses sont automatiquement enregistrées … son dossier n'apparaît pas encore dans la liste »                      | list-appearance-rule                                          |
| 9   | « Si le praticien crée lui-même un dossier patient, celui-ci apparaît immédiatement … « Dossier à compléter » »                                                   | list-appearance-rule                                          |
| 10  | « Les dossiers comportant une modification patient non prise en compte affichent un indicateur visible dans la liste »                                            | list-indicators (signal: patient-change-signals, story 21)    |
| 11  | « Les informations manquantes signalées sur la fiche restent accessibles depuis la liste »                                                                        | list-indicators                                               |

## Out of scope

- The transitions' triggers: the first food recommendation (`food-directives`) and the activation (`care-activation`). They call the function this epic defines.
- The patient-change signal itself (`patient-change-signals`). This epic renders it.
- Filters, search, pagination beyond what the roster has today.
