# Stub: The practitioner switches each meal on or off and picks its orientation

- feature-slug: meal-configuration
- epic: meal-structure
- story: 11
- sequence: 1 of 2
- depends-on: none
- complexity: medium
- priority: P0

## Problem

REMI holds no structure of the patient's day. A generator cannot know which meals to fill or
how.

## Proposed change

Add `patient_meal_slots`: one row per patient and `meal` (`breakfast`, `lunch`, `snack`,
`dinner`), with `enabled` and `orientation` (`protein_fat`, `complete_balanced`,
`light_plant`, `carb_leaning`, `free`), unique on patient and meal. Create the four rows
with her defaults on first open: breakfast on « Protéiné et lipidique », lunch on « Complet
et équilibré », snack off « Plutôt glucidique », dinner on « Léger à dominante végétale ».
Add a « Repas » section to the patient file: one line per meal, a switch and a select with
the five French labels and their descriptions. Save on change. Record each change as an
audit event.

## Acceptance criteria

- [ ] The first open of « Repas » shows the four meals with her default states and orientations.
- [ ] The snack is off by default.
- [ ] Each meal switches on and off. Each orientation changes to any of the five.
- [ ] The five orientations show her French label and her one-line description.
- [ ] A change saves without a separate button and survives a reload.
- [ ] The practitioner changes the configuration at any time, before and after activation.
- [ ] Each change creates an audit event.

## Out of scope

- The rules the generator applies (stub 2).
- The fasting option (`intermittent-fasting/fasting-option`).

## Notes

- Decisions kept: D-25, D-32.
- Files: `schema.ts`, a new migration, a meal-slots service, the patient file page in `apps/admin`.
- Shared files first: `intermittent-fasting/fasting-option` adds a column to this table.
- cross-epic: `patient-file-view` owns the file layout. This stub adds one section.
