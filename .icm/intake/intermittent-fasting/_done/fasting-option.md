# Stub: The practitioner sets « Aucun jeûne », « Suppression du petit-déjeuner » or « Suppression du dîner »

- feature-slug: fasting-option
- epic: intermittent-fasting
- story: 12
- sequence: 1 of 2
- depends-on: none
- complexity: low
- priority: P0

## Problem

Some practitioners recommend an intermittent fast. REMI has no place to record which meal
is removed.

## Proposed change

Add a `fasting` value per patient on the meal configuration: `none` (default),
`skip_breakfast`, `skip_dinner`. In the « Repas » section, add a radio group « Jeûne
intermittent » with the three French labels. « Aucun jeûne intermittent » is selected by
default. Only an operator with the practitioner or admin role sees and sets it. No field
asks a time or a duration. A change saves at once and creates an audit event.

## Acceptance criteria

- [ ] A new patient shows « Aucun jeûne intermittent » selected.
- [ ] The three options are radio buttons. One is selected at a time.
- [ ] The practitioner selects an option in one click, with no second confirmation.
- [ ] No input asks a time, a window or a duration.
- [ ] The practitioner changes or removes the option at any time. The value survives a reload.
- [ ] The patient's own space shows no control for it.
- [ ] Each change creates an audit event.

## Out of scope

- The effect on the recipes (stub 2).

## Notes

- Decisions kept: D-27 (roles in `apps/admin`), D-32.
- Files: `schema.ts` and a migration (one column), the meal-slots service, the « Repas » section.
- cross-epic: `meal-structure/meal-configuration` creates the table this column extends. Merge after it.
