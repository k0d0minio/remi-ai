# Breakdown: protocol-versions — the practitioner edits freely, validates on purpose, and keeps the history

- epic-slug: protocol-versions
- source: story 20 « Mise à jour du profil et des recommandations, historique », Morgane Paquet, 15 October 2026, https://drive.google.com/file/d/1kdI4k14cpfNepSj5_lXmdy1wkDQjCm3Y/view
- story: 20

## What I understood

The practitioner may change the patient's profile and every recommendation at any time. A change is not applied until the practitioner validates. Until then the file says « Modifications non validées ». Each validation creates a dated, immutable version: version, date, content. The previous version stays readable. Only the validated version reaches recipe generation and meal suggestions. Recipes already generated are kept. On `main` the protocol tables (`patient_recommendations`, `patient_supplements`, `patient_goals`, `patient_instructions`) write live, and archiving is the only history. This epic adds the version layer under them and is the read source for `care-activation`, `patient-recommendations`, `recipe-space` and `meal-improvement`. Rests on D-30, D-32. The patient's own changes are `patient-change-signals`. « modifier à tout moment le profil du patient » is `patient-file-view/provenance-markers`. The add, modify and deactivate controls live in `food-directives`, `priority-goals`, `supplement-interventions` and `lifestyle-advice`. `working-copy-and-validate` turns their live tables into the working copy.

### Questions for Morgane

1. Does a version hold your recommendations only, or also the patient's profile data (weight, allergies)? Default: your recommendations and the validated calculations only. The profile has its own change signals (story 21).
2. After a new validation, do today's proposed recipes stay? Default: yes. The new version applies from the next generation.
3. Do you want a comparison between two versions, or the full content of each? Default: the full content of each. No comparison in the MVP.

### Questions for Jamie

1. Store a version as one JSON snapshot or as normalised rows? Default: one `jsonb` snapshot per version, checked by a zod schema on write and on read.

## Build order

1. protocol-version-table — the `protocol_versions` table, its migration, the snapshot schema — depends-on: none
2. working-copy-and-validate — « Modifications non validées », the « Valider » action, the validated read API — depends-on: protocol-version-table
3. protocol-history-view — the read-only history on the patient file — depends-on: protocol-version-table

## Criteria → stubs

| #   | Morgane's criterion (short, her French kept)                                                                                  | Stub                                             |
| --- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| 1   | « Les changements non validés sont signalés (“Modifications non validées”) et ne sont pas appliqués »                         | working-copy-and-validate                        |
| 2   | « Après validation, les prochaines recettes et suggestions utilisent les nouvelles recommandations »                          | working-copy-and-validate                        |
| 3   | « Les recettes déjà générées ne sont pas supprimées »                                                                         | working-copy-and-validate                        |
| 4   | « Chaque validation crée une nouvelle entrée datée dans l'historique ; la version précédente reste consultable avec sa date » | protocol-version-table                           |
| 5   | « L'historique est consultable en lecture seule par le praticien »                                                            | protocol-history-view                            |
| 6   | « Un élément désactivé reste dans l'historique »                                                                              | protocol-version-table                           |
| 7   | « Les changements effectués par le patient sur son profil sont signalés au praticien »                                        | patient-change-signals/change-signals-in-console |

## Out of scope

- The patient's changes and their signals: `patient-change-signals`.
- « Modifier à tout moment le profil du patient »: `patient-file-view/provenance-markers`.
- The add, modify and deactivate controls for each category: `food-directives`, `priority-goals`, `supplement-interventions`, `lifestyle-advice`.
- The first validation's button and e-mail: `care-activation`.
- A diff between versions (question 3).
