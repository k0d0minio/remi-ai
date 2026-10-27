# Breakdown: lifestyle-advice — six categories of advice, in one place on the file

- epic-slug: lifestyle-advice
- source: story 17 « Conseils d'hygiène de vie », Morgane Paquet, 15 October 2026, https://drive.google.com/file/d/1-lyI5Uf9rIsnhFfbb1eu97BpnUKbb3ba/view
- story: 17

## What I understood

The file gets a section with six categories: activité physique, gestion du stress, sommeil, hydratation, comportements alimentaires / habitudes à table, autres conseils d'hygiène de vie. Each holds several advices. No category is mandatory. An advice has a mandatory text and optional frequency, moment and duration. The practitioner adds, edits, deactivates or deletes. A deactivated advice leaves the patient's view and stays in history. The patient reads validated advices after activation, read-only, as category 2 of « Mes recommandations » (story 23, another fork).

On main, `patient_recommendations` carries `habit` and `activity` categories as title and detail. Those two categories move into this section. This epic rests on D-27, D-30 and D-32.

### Questions for Morgane

1. « Supprimer » removes an advice from history and « désactiver » keeps it. Do you want both? Default: delete only before the protocol's first validation, deactivate after.
2. Do your existing « habit » and « activity » recommendations move into the six categories? Default: yes, into « Comportements alimentaires » and « Activité physique », and you review them once.
3. Frequency, moment and duration: free text, or lists? Default: free text.

### Questions for Jamie

1. Keep the `habit` and `activity` recommendation categories after the move? Default: no. The migration moves the rows and the two categories leave the enum.

## Build order

1. advice-table — the table, the service, the migration of the two old categories, the read model for the patient side — depends-on: none
2. advice-section — the console section with six categories, add several at once, edit, deactivate, delete, history fold — depends-on: advice-table

## Criteria → stubs

| #   | Morgane's criterion (short, her French kept)                                                                    | Stub                                                                           |
| --- | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| 1   | « Aucune catégorie n'est obligatoire »                                                                          | advice-section                                                                 |
| 2   | « Un conseil sans texte ne peut pas être enregistré »                                                           | advice-table                                                                   |
| 3   | « Plusieurs conseils peuvent coexister dans une même catégorie »                                                | advice-table                                                                   |
| 4   | « Le praticien peut ajouter, modifier, désactiver ou supprimer un conseil »                                     | advice-section                                                                 |
| 5   | « Un conseil désactivé n'est plus visible du patient mais reste dans l'historique »                             | advice-table                                                                   |
| 6   | « Les conseils sont restitués tels que validés, sans être transformés en prescription inventée »                | rule: README (D-30)                                                            |
| 7   | « Seuls les conseils validés sont visibles du patient, après activation de l'accompagnement, en lecture seule » | advice-table (read model), cross-epic patient-recommendations, care-activation |

## Out of scope

- The patient's page (patient-recommendations). This epic exposes the read model.
- Any model-generated advice.
- Reminders or scheduling of an advice.
