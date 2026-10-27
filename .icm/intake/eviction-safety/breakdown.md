# Breakdown: eviction-safety — no excluded food reaches the plate, and no eviction is lifted by REMI

- epic-slug: eviction-safety
- source: story 14 « Sécurité des évictions totales », Morgane Paquet, 15 October 2026, https://drive.google.com/file/d/193tpWc5BMO5HL7kBl6W-oPDB0tU1B4aY/view
- story: 14

## What I understood

Every eviction has a period or a durable medical status (the columns live in food-directives/directive-fields). Every recipe, meal suggestion or dish must pass one check before it is shown: no ingredient concerned by an eviction, an allergy or an intolerance. When REMI cannot confirm compatibility, the proposal is excluded. Uncertain means excluded. At the end date of a temporary eviction, REMI asks the practitioner to re-evaluate: prolong, end, or make durable. Past the date with no decision, REMI suspends every suggestion for that patient until the practitioner decides. REMI never reintroduces a potentially contra-indicated food by itself. Evictions and contra-indications win over every preference and orientation.

The check is one function in `packages/services`, called by recipe-space, meal-improvement and restaurant-menu (another fork). Its inputs are the patient's exclusions: evictions from food-directives, allergies and intolerances from the questionnaire (another fork), and the declared regime. Allergies and intolerances the patient declares apply at once, with no practitioner validation (story 30). The function is code, not a prompt (D-16). This epic rests on D-16, D-30 and D-32.

### Questions for Morgane

1. How many days before an eviction's end date should REMI ask you to re-evaluate? Default: 7.
2. During a suspension, what does the patient see? Default: « Votre praticien met à jour vos recommandations », with no detail.
3. Do allergies and intolerances the patient declares count as durable evictions for the check, with no period? Default: yes, at once (story 30).
4. Does a suspension also hide the recipes already shown for the week, or only stop new ones? Default: it hides them too.

### Questions for Jamie

1. How does a generated recipe name its ingredients for the check? Default: the model picks from CIQUAL food codes we pass in the prompt. A free-text ingredient is uncertain, so the recipe is excluded.
2. Where does the suspension flag live? Default: a nullable `suggestions_suspended_at` on `patient_profiles`, set and cleared by this epic only.

## Build order

1. compatibility-gate — one function that returns compatible, excluded or uncertain for a candidate against the patient's exclusions, with uncertain treated as excluded — depends-on: none
2. eviction-expiry-review — the re-evaluation ask on the console before and at an eviction's end date, with the three answers — depends-on: compatibility-gate
3. suggestion-suspension — past the date with no decision, all suggestions for the patient stop until the practitioner decides — depends-on: eviction-expiry-review

## Criteria → stubs

| #   | Morgane's criterion (short, her French kept)                                                                                                                  | Stub                                        |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| 1   | « Une éviction totale ne peut pas être enregistrée sans période d'application ou statut d'exclusion durable »                                                 | cross-epic food-directives/directive-fields |
| 2   | « Une recette contenant un ingrédient évincé n'est jamais proposée »                                                                                          | compatibility-gate                          |
| 3   | « Étant donné une compatibilité non confirmable, la proposition n'est pas proposée »                                                                          | compatibility-gate                          |
| 4   | « À l'échéance d'une éviction temporaire, le praticien reçoit une demande de réévaluation (prolonger, terminer, passer en durable) »                          | eviction-expiry-review                      |
| 5   | « Sans confirmation du praticien à la date d'échéance, REMI suspend automatiquement toutes les suggestions de recettes… ne reprennent qu'après confirmation » | suggestion-suspension                       |
| 6   | « Un aliment potentiellement contre-indiqué n'est jamais réintroduit automatiquement »                                                                        | compatibility-gate                          |
| 7   | « Les évictions totales et contre-indications priment sur toutes les préférences et orientations »                                                            | rule: README (D-30), compatibility-gate     |

## Out of scope

- The generation of recipes or suggestions. This epic only decides what may be shown.
- A cross-contamination database. An unknown composition is uncertain, so excluded, and the patient is told to check (story 30).
- Any outbound notification to the practitioner. The ask lives on the console.
