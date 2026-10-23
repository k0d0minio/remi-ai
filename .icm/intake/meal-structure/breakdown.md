# Breakdown: meal-structure — the practitioner sets which meals exist and their orientation

- epic-slug: meal-structure
- source: story 11 « Chrononutrition : organisation des repas », Morgane Paquet, 15 October 2026, https://drive.google.com/file/d/1krDbdqYl_eSa_36PwvnoY5LmaNi-veqS/view
- story: 11

## What I understood

The practitioner configures the day's meals in a few clicks: four slots, each on or off,
each with one of five orientations. The defaults are her table: breakfast « Protéiné et
lipidique », lunch « Complet et équilibré », snack off and « Plutôt glucidique », dinner
« Léger à dominante végétale ». An orientation is a soft preference. No strict
macronutrient quota exists per meal. The proportions are judged over the whole day. REMI
adapts an orientation to the validated diet (a « plutôt glucidique » snack becomes low-carb
under a validated ketogenic diet) and shows the adaptation without imposing it. A
practitioner recommendation that contradicts a medical restriction is flagged and needs a
confirmation. Total evictions and contra-indications prevail over every orientation (D-30).
The practitioner may change the configuration at any time.

On `main` nothing holds a meal structure. The recipe library and the meal journal of
September do not read one. This epic adds `patient_meal_slots` and a pure resolution
function the generation engine (`recipe-space`) reads. Story 12 extends the same table.

### Questions for Morgane

1. Can the practitioner add a fifth slot, for example a second snack? Default: no, four slots.
2. When the snack is switched on, does it start as « Plutôt glucidique », as your table says? Default: yes.
3. Does the meal configuration reach the recipes only after the protocol validation of story 19? Default: yes.

### Questions for Jamie

1. One row per patient and meal (`patient_meal_slots`), or one jsonb on the profile? Default: one row per meal.

## Build order

1. meal-configuration — the table, the defaults, the console control — depends-on: none
2. meal-orientation-rules — the resolution function the generator reads, the diet adaptation, the conflict flag — depends-on: meal-configuration

## Criteria → stubs

| # | Morgane's criterion (short, her French kept) | Stub |
|---|---|---|
| 1 | « Les valeurs par défaut s'affichent à la création de la configuration » | meal-configuration |
| 2 | « Chaque repas peut être activé ou désactivé et son orientation modifiée » | meal-configuration |
| 3 | « La collation est désactivée par défaut » | meal-configuration |
| 4 | « Aucun quota de macronutriments strict n'est imposé repas par repas ; … à l'échelle de la journée » | meal-orientation-rules |
| 5 | « Régime validé incompatible … REMI adapte l'orientation … sans l'imposer au praticien » | meal-orientation-rules |
| 6 | « Recommandation du praticien en conflit avec une restriction médicale, REMI signale le conflit et demande confirmation » | meal-orientation-rules |
| 7 | « Les orientations de repas respectent les restrictions prioritaires (évictions totales et contre-indications) » | meal-orientation-rules |
| 8 | « Le praticien peut modifier à tout moment la configuration des repas » | meal-configuration |

## Out of scope

- Meal times and durations. Story 11 names none.
- The fasting option (`intermittent-fasting`).
- The generation itself (`recipe-space`).
