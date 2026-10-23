# Stub: REMI prepares seven days of recipes that fit the validated protocol and pass the gate

- feature-slug: weekly-plan-generation
- epic: recipe-space
- story: 24
- sequence: 3 of 5
- depends-on: recipe-structure
- complexity: high
- priority: P0

## Problem

The patient expects recipes adapted to the protocol without checking the constraints. Nothing generates them today. Morgane assigns recipes by hand.

## Proposed change

For a patient whose file is « Accompagnement actif », REMI keeps seven days of plan ahead. One structured call per recipe starts from a verified template recipe for the meal slot and the season (D-34) and reads the validated protocol: energy and protein targets, the macronutrient split (DEFAULT or genotype), the priority goals, the meal structure and its per-meal orientation, intermittent fasting, the directives « À favoriser », « À limiter », « Éviction totale », the declared diet, allergies and intolerances, the season, and the recipes of the previous two weeks. Every generated recipe goes through `eviction-safety/compatibility-gate`. A `confirmed` recipe is stored. An `uncertain` or `excluded` recipe is discarded and regenerated once. Generation runs at activation and once a day. When a new protocol version is validated, the days after today are regenerated. Past and present days stay.

## Acceptance criteria

- [ ] An active patient has a plan row for every enabled meal of the next seven days.
- [ ] No stored recipe contains an ingredient in total eviction, a declared allergen or a declared intolerance.
- [ ] A recipe the gate cannot confirm is never stored as shown.
- [ ] « À favoriser » sources appear more often. « À limiter » sources appear less often or in smaller quantity. The log shows the counts per week.
- [ ] A disabled meal and a fasted meal receive no recipe. The collation receives one only when enabled.
- [ ] No recipe name repeats within the week or against the previous two weeks for the same patient.
- [ ] Ingredients out of season in Belgium for the month are not the main ingredient.
- [ ] A new validated protocol version regenerates the days after today within the hour. Already shown days do not change.
- [ ] Every stored recipe names the verified template it started from.
- [ ] Every call is one row in `ai_generations`.
- [ ] Steps are numbered and name temperature and duration where cooking needs them.

## Out of scope

- The screen. The justification. Photos. Variants and favourites.

## Notes

D-16, D-30 (the priority order resolves conflicts in the prompt and in the gate), D-25, D-34 (a verified template starts every generation). The context assembler in `ai/context.ts` grows the protocol blocks the story names and stays pseudonymous. Files: `packages/services/src/ai/prompts/recipe.ts`, `packages/services/src/server/recipes/*`, a cron route in `apps/web/app/api/`. Cross-epic: `eviction-safety/compatibility-gate` (called here), `care-activation` (the trigger), `protocol-versions` (the regeneration trigger), `meal-structure`, `intermittent-fasting`, `food-directives`, `energy-needs`, `protein-needs`, `preparatory-questionnaire` (genotype split), `priority-goals`.
