# Breakdown: supplement-interventions — what to take, how much, when, how

- epic-slug: supplement-interventions
- source: story 18 « Compléments, plantes, huiles essentielles et autres interventions », Morgane Paquet, 15 October 2026, https://drive.google.com/file/d/1yc0JvtBvZTtgvq4eLfKdj4AJ9xsIknVt/view
- story: 18

## What I understood

The practitioner records each intervention as its own row, in any number, with « + Ajouter une recommandation ». Her field table: type (complément alimentaire, plante / phytothérapie, huile essentielle, autre), name (optional), dose (optional), route, moment of intake, frequency, duration or dates, reason (optional), precautions (optional), status (actif, suspendu, terminé). Type, route, moment and frequency are mandatory. The patient's declared medications and supplements show beside the form so she can check interactions herself. REMI invents no dose and no interaction. The patient reads validated, active interventions only, after activation, read-only (story 23, another fork).

On main, `patient_supplements` holds name, dose, timing, reason, position and `archived_at`. It keeps those and gains type, route, moment and frequency as lists with a free option, start and end, precautions and a status. Existing rows become type « complément alimentaire », status « actif », or « terminé » when archived. The declared medications and supplements live in `patient_profiles.medications` and `.supplements` today and in the questionnaire tomorrow (another fork). This epic rests on D-27, D-30 and D-32.

### Questions for Morgane

1. A row with type « complément alimentaire » and no name: is that useful, or should name be mandatory? Default: name stays optional, as written.
2. « Certains jours » in the frequency: a weekday picker or free text? Default: free text.
3. The declared medications: one free-text line as the patient typed it, with no drug database? Default: yes, as declared.

### Questions for Jamie

1. Do archived rows become status « terminé », with `archived_at` kept as the end date? Default: yes.

## Build order

1. intervention-fields — the columns, the enums, the migration of existing rows, the read model — depends-on: none
2. intervention-form — « + Ajouter une recommandation », mandatory and optional fields, modify, suspend, end, declared medications beside the form — depends-on: intervention-fields

## Criteria → stubs

| #   | Morgane's criterion (short, her French kept)                                                                                | Stub                                                                                                 |
| --- | --------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| 1   | « Plusieurs interventions peuvent coexister pour un même patient »                                                          | intervention-fields                                                                                  |
| 2   | « Type, voie, moment de prise et fréquence sont obligatoires ; nom, dose, objectif, durée et précautions sont facultatifs » | intervention-form                                                                                    |
| 3   | « Le moment de prise propose : matin, midi, soir, avant / pendant / après repas, au coucher, horaire libre »                | intervention-fields                                                                                  |
| 4   | « La fréquence propose : chaque jour, certains jours, ponctuellement, personnalisée »                                       | intervention-fields                                                                                  |
| 5   | « Le statut par défaut est “Actif” »                                                                                        | intervention-fields                                                                                  |
| 6   | « Le praticien peut modifier, suspendre ou terminer une intervention sans la perdre de l'historique »                       | intervention-form                                                                                    |
| 7   | « Aucune dose ni interaction n'est inventée par REMI »                                                                      | rule: README (D-30)                                                                                  |
| 8   | « Le patient ne voit que les interventions validées et actives »                                                            | intervention-fields, patient-recommendations/recommendations-page, care-activation/activation-action |

## Out of scope

- An automatic interaction check or a drug database. The declared list is shown, not analysed.
- The patient's page (patient-recommendations).
- A supplement reference table.
