# Breakdown: meal-improvement — the patient shows a meal, REMI says what is good and one thing to improve

- epic-slug: meal-improvement
- source: story 28 « Suggestion d'amélioration », Morgane Paquet, 15 October 2026, https://drive.google.com/file/d/1DKlD-yiXNf4zWV5xXr995OCSOrC7pO8E/view
- story: 28

## What I understood

Morgane calls this « une fonctionnalité centrale de REMI ». The patient photographs or describes what they plan to eat. REMI answers in two blocks, « Ce qui est déjà bien » and « Ce que tu pourrais améliorer », with at most one priority improvement, simple to apply, tied to a validated recommendation or goal. A meal that is already right gets a confirmation. An evicted food is flagged first. A vague input gets a question, not a guess. Under each suggestion, « Ça me convient » or « Pas pour moi ». A refusal allows one second, different suggestion. Two per meal, then no more. No detailed history for the MVP. Story 31 puts the entry at the centre of the home screen.

On `main`, `patient_meal_entries` holds the September loop: « Je vais manger / J'ai mangé », Morgane's hand-written feedback, learnings. The table stays as the record of a meal the patient entered (`description`, `eaten_on`, `slot`, `written_by`, `patient_comment`). The product stops writing `intent` and `feedback`: story 30 retires the intent pair and REMI's suggestion replaces the hand feedback. A new table holds the suggestions. Photos are new (D-29, supersedes D-12) and go through the files seam. The model call goes through `recipe-space/ai-gateway-adapter`. Rests on D-16, D-18, D-26, D-29, D-30. Supersedes D-6's console gate and D-12.

### Questions for Morgane

1. Does the patient submit only a planned meal (« Qu'as-tu prévu de manger ? »), never a meal already eaten? Default: yes, planned only.
2. Do you want to see your patients' meals and REMI's suggestions in your console? Default: no, not in the MVP.
3. How long does REMI keep the photo? Default: 30 days, then the file is deleted and the text stays.
4. REMI speaks to the patient with « tu », as in your button texts? Default: yes, « tu » across the patient space.
5. After two refused suggestions, what does REMI say? Default: « Merci pour ton retour. Bon appétit. » and nothing more.
6. Must the explanation name the recommendation in your words, as the patient reads it under « Mes recommandations »? Default: yes, the same words.

### Questions for Jamie

1. The vision model: the `balanced` role must accept images behind the gateway. Default: yes, set in `ai-gateway-adapter`.
2. Image path to the model: a server-side read from Blob passed as base64, or a short signed URL? Default: base64 from the server, size capped at 1600 px on the longest side, resized in the browser before upload.
3. A rate limit per patient? Default: 20 meals a day.

## Build order

1. meal-capture — text and photo in, a meal entry and a photo in the file store, the suggestions table — depends-on: none
2. meal-suggestion — one structured call, the two blocks, the gate on the improvement, the clarification question — depends-on: meal-capture
3. suggestion-feedback — « Ça me convient » / « Pas pour moi », the one second suggestion, the cap of two — depends-on: meal-suggestion

## Criteria → stubs

| #   | Morgane's criterion (short, her French kept)                                                                                          | Stub                |
| --- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| 1   | « une photo ou une description textuelle »                                                                                            | meal-capture        |
| 2   | « les points positifs et, uniquement si nécessaire, une amélioration prioritaire »                                                    | meal-suggestion     |
| 3   | amélioration « simple à appliquer (ajout, remplacement ou retrait) », explication liée à « une recommandation ou un objectif validé » | meal-suggestion     |
| 4   | éviction totale « signalé en priorité », aucune suggestion incompatible                                                               | meal-suggestion     |
| 5   | photo ou description « trop vague » → « demande une précision »                                                                       | meal-suggestion     |
| 6   | « Ça me convient » et « Pas pour moi » sur chaque suggestion                                                                          | suggestion-feedback |
| 7   | après « Pas pour moi », « une deuxième suggestion différente »                                                                        | suggestion-feedback |
| 8   | « 2 suggestions au total par repas »                                                                                                  | suggestion-feedback |
| 9   | « aucun historique détaillé des choix du patient »                                                                                    | suggestion-feedback |

## Out of scope

- The home screen that hosts the entry: `patient-home-navigation` (story 31).
- The restaurant menu: `restaurant-menu` (story 29).
- Nutrient totals of the meal, calories shown to the patient, a meal diary, Morgane's hand feedback.
- A console view of meals and suggestions, pending question 2.
