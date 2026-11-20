# Stub: The practitioner writes « À favoriser », « À limiter » and « Éviction totale » in one line each

- feature-slug: directive-fields
- epic: food-directives
- story: 13
- sequence: 2 of 4
- depends-on: term-base
- complexity: medium
- priority: P0

## Problem

Today a food directive is prose in a `nutrition` recommendation. REMI cannot read it. The practitioner wants one line per category, split on « ; », saved as rows REMI can apply.

## Proposed change

A table `patient_food_directives`: patient, kind `favour` | `limit` | `exclude`, raw term as typed, resolved term (nullable), resolution state, limit level, `exclusion_until` (date, nullable), `exclusion_durable` (boolean), position, archived at. One migration. On the console patient page, three fields labelled « À favoriser », « À limiter », « Éviction totale ». A save splits each field on « ; », trims, and writes one row per term. The practitioner may add, edit or deactivate any row at any time. A save with the same term in « À favoriser » and « Éviction totale » is refused with a message that names the term. An « Éviction totale » row with no `exclusion_until` and no durable status is refused. Each save writes an audit event.

## Acceptance criteria

- [ ] The migration adds `patient_food_directives`.
- [ ] A field value « brocoli ; magnésium ; crucifères » saves three rows of the field's kind.
- [ ] Each of the three fields accepts a food, a nutrient, a compound or a family.
- [ ] The practitioner can add, edit and deactivate a directive. A deactivated row keeps its history.
- [ ] A term present in both « À favoriser » and « Éviction totale » blocks the save, and the message names the term.
- [ ] An « Éviction totale » without a period and without a durable status blocks the save.
- [ ] Every save writes an audit event (D-32).

## Out of scope

- Term recognition and the unknown flag (directive-resolution). This stub stores the raw term and the resolution state `pending`.
- The limit levels' effect on generation (directive-application).

## Notes

- D-27: the editor is in `apps/admin`, practitioner role. D-30: the exclusion rules bind.
- The period or durable status is the same rule story 14 states. The columns live here. eviction-safety reads them.
- Files: `schema.ts`, a migration, `packages/services/src/db/services/patient-food-directives/`, the console patient page protocol section, `packages/services/src/db/services/section-save.ts`.
- cross-epic: eviction-safety/eviction-expiry-review reads `exclusion_until`.
