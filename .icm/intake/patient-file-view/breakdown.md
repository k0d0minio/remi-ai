# Breakdown: patient-file-view — the practitioner opens a file and sees what is declared, what is missing and what is validated

- epic-slug: patient-file-view
- source: story 6 « Consultation du dossier patient avant le rendez-vous », Morgane Paquet, 12 October 2026, https://drive.google.com/file/d/1atD5dku9ymYmKxfQb-CFYLL77Pnw4BTI/view
- story: 6

## What I understood

The file page shows the questionnaire answers, the status and the appointment date. Every
empty field reads « Non renseigné » and a list at the top names the missing information,
mandatory apart from optional. Allergies, intolerances, avoided foods and medications are
highlighted. A calculations summary sits under the patient data. The page distinguishes what
the patient declared, what is absent, what the practitioner entered or corrected, and what is
validated. The practitioner corrects a patient's datum in place. Changes the patient made
after validation are marked. On `main` `(admin)/patients/[id]` is the « en un coup d'œil »
page built in September around goals, challenges, check-ins, the meal journal and the living
summary. Story 30 rules several of those out. This epic rebuilds the page around the
questionnaire. It rests on D-27, D-30, D-31, D-32.

### Questions for Morgane

1. Does the current « en un coup d'œil » page stay as a second view, or does the new file page replace it? Default: the new page replaces it. The anamnesis and the living summary stay as sections.
2. « Aliments évités » in the highlight: the évictions totales of story 13, or a list the patient declares? Default: the évictions totales plus the declared allergies and intolerances.
3. Which patient fields may you correct: all, or health and profile data but not identity? Default: all, each correction logged.

### Questions for Jamie

1. Rebuild in place at `(admin)/patients/[id]/page.tsx`, or a new route beside it? Default: in place.

## Build order

1. file-page-frame — the page around the answers, the status, the date, the missing list, « Non renseigné » everywhere — depends-on: none
2. safety-highlights — allergies, intolerances, avoided foods and medications in one block at the top — depends-on: file-page-frame
3. provenance-markers — declared, absent, practitioner-entered and validated told apart, in-place correction — depends-on: file-page-frame
4. calculations-summary-slot — the summary under the data, filled by the three calculation epics — depends-on: file-page-frame
5. post-validation-change-markers — fields the patient changed after validation marked with old, new and date — depends-on: provenance-markers

## Criteria → stubs

| #   | Morgane's criterion (short, her French kept)                                                      | Stub                                                             |
| --- | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| 1   | « La fiche est accessible dès l'inscription, même si le questionnaire est incomplet »             | file-page-frame                                                  |
| 2   | « Chaque champ vide est affiché « Non renseigné », jamais complété par REMI »                     | file-page-frame                                                  |
| 3   | « La liste des informations manquantes distingue les champs obligatoires des champs facultatifs » | file-page-frame                                                  |
| 4   | « Le statut du dossier est visible sur la fiche »                                                 | file-page-frame                                                  |
| 5   | « Le praticien ne peut voir et accèder que les fiches de ses propres patients »                   | file-page-frame (scope: patient-file-creation/care-relationship) |
| 6   | « Le praticien peut compléter ou corriger lui-même une donnée du patient »                        | provenance-markers                                               |
| 7   | « Toutes les réponses enregistrées sont visibles »                                                | file-page-frame                                                  |
| 8   | « Les modifications du patient après validation sont signalées sur la fiche »                     | post-validation-change-markers                                   |
| 9   | « Aucune valeur absente n'est supposée ni extrapolée »                                            | rule: README (D-30)                                              |

## Out of scope

- The calculations themselves (`bmi`, `protein-needs`, `energy-needs`). This epic gives them a slot.
- The change signal's storage and acknowledgement (`patient-change-signals`, story 21). This epic renders it.
- The protocol sections (stories 11 to 18) and the activation control (story 19). They add to this page in their own epics.
- Removing the September features story 30 rules out from the console. That needs its own owner. See the breakdown's note to the main session.
