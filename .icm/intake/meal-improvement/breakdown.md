# Breakdown: meal-improvement — the patient shows a meal, REMI says what is good and one thing to improve

- epic-slug: meal-improvement
- source: story 28 « Suggestion d'amélioration », Morgane Paquet, 15 October 2026, https://drive.google.com/file/d/1DKlD-yiXNf4zWV5xXr995OCSOrC7pO8E/view, and story 33 « Suppression de la photo », Morgane Paquet, 27 October 2026, sent as an attachment on the e-mail thread « Update: REMI AI », not yet in Drive
- story: 28

## What I understood

Morgane calls this « une fonctionnalité centrale de REMI ». Story 33 keeps it as « la fonctionnalité la plus importante » and removes the photo: the patient types what they plan to eat, the dish and its ingredients. A photo or a voice input may come in a later version if users ask. The patient describes what they plan to eat. REMI answers in two blocks, « Ce qui est déjà bien » and « Ce que tu pourrais améliorer », with at most one priority improvement, simple to apply, tied to a validated recommendation or goal. A meal that is already right gets a confirmation. An evicted food is flagged first. A vague input gets a question, not a guess. Under each suggestion, « Ça me convient » or « Pas pour moi ». A refusal allows one second, different suggestion. Two per meal, then no more. No detailed history for the MVP. Story 31 puts the entry at the centre of the home screen.

On `main`, `patient_meal_entries` holds the September loop: « Je vais manger / J'ai mangé », Morgane's hand-written feedback, learnings. The table stays as the record of a meal the patient entered (`description`, `eaten_on`, `slot`, `written_by`, `patient_comment`). The product stops writing `intent` and `feedback`: story 30 retires the intent pair and REMI's suggestion replaces the hand feedback. A new table holds the suggestions. The meal is text only (D-12, confirmed by story 33). The model call goes through `recipe-space/ai-gateway-adapter`. Rests on D-12, D-16, D-26, D-30. Supersedes D-6's console gate.

Story 33's own acceptance criteria are not in Drive yet. The `Criteria → stubs` table gains its rows when the document is filed (Jamie's question 2).

### Questions for Morgane

1. Does the patient submit only a planned meal (« Qu'as-tu prévu de manger ? »), never a meal already eaten? Default: yes, planned only.
2. Do you want to see your patients' meals and REMI's suggestions in your console? Default: no, not in the MVP.
3. REMI speaks to the patient with « tu », as in your button texts? Default: yes, « tu » across the patient space.
4. After two refused suggestions, what does REMI say? Default: « Merci pour ton retour. Bon appétit. » and nothing more.
5. Must the explanation name the recommendation in your words, as the patient reads it under « Mes recommandations »? Default: yes, the same words.
6. The patient types the dish. Does REMI ask for the ingredients when the dish name alone is enough for a suggestion? Default: no. REMI asks only when the text is too vague.

### Questions for Jamie

1. A rate limit per patient? Default: 20 meals a day.
2. File « 33 Suppression de la photo.docx » in the Drive folder `user-stories/`, so its criteria can be tabled? Default: yes, before Spec approved.

## Build order

1. meal-capture — the typed meal, a meal entry, the suggestions table — depends-on: none
2. meal-suggestion — one structured call, the two blocks, the gate on the improvement, the clarification question — depends-on: meal-capture
3. suggestion-feedback — « Ça me convient » / « Pas pour moi », the one second suggestion, the cap of two — depends-on: meal-suggestion

## Criteria → stubs

| #   | Morgane's criterion (short, her French kept)                                                                                          | Stub                |
| --- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| 1   | « une photo ou une description textuelle » (story 33: the description only)                                                           | meal-capture        |
| 2   | « les points positifs et, uniquement si nécessaire, une amélioration prioritaire »                                                    | meal-suggestion     |
| 3   | amélioration « simple à appliquer (ajout, remplacement ou retrait) », explication liée à « une recommandation ou un objectif validé » | meal-suggestion     |
| 4   | éviction totale « signalé en priorité », aucune suggestion incompatible                                                               | meal-suggestion     |
| 5   | description « trop vague » → « demande une précision » (story 33: no photo)                                                           | meal-suggestion     |
| 6   | « Ça me convient » et « Pas pour moi » sur chaque suggestion                                                                          | suggestion-feedback |
| 7   | après « Pas pour moi », « une deuxième suggestion différente »                                                                        | suggestion-feedback |
| 8   | « 2 suggestions au total par repas »                                                                                                  | suggestion-feedback |
| 9   | « aucun historique détaillé des choix du patient »                                                                                    | suggestion-feedback |

## Out of scope

- The home screen that hosts the entry: `patient-home-navigation` (story 31).
- The restaurant menu: `restaurant-menu` (story 29).
- Nutrient totals of the meal, calories shown to the patient, a meal diary, Morgane's hand feedback.
- A photo or a voice input of the meal (story 33). The menu photo stays in `restaurant-menu`.
- A console view of meals and suggestions, pending question 2.
