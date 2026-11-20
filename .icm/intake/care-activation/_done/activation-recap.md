# Stub: The practitioner sees what will be activated, and what blocks it

- feature-slug: activation-recap
- epic: care-activation
- story: 19
- sequence: 1 of 3
- depends-on: none
- complexity: medium
- priority: P0

## Problem

Nothing on the patient file tells the practitioner what REMI will apply when the space opens. An eviction without a period, or a contradiction between two directives, must stop the activation. Today no such check exists.

## Proposed change

A recap panel on the patient file, opened from « Activer l'accompagnement ». It lists:

- the validated values: calculations, meal structure, goals, directives, interventions, lifestyle advice,
- each « Éviction totale » with its period or its durable status,
- the unrecognised elements, marked « non appliqué »,
- the blockers, each with the fix it needs.

The recap reads the working copy of the protocol (cross-epic: `protocol-versions/working-copy-and-validate`).

## Acceptance criteria

- [ ] The recap shows every validated value, every eviction with its period or durable status, and every unrecognised element.
- [ ] An eviction without a period and without a durable status appears as a blocker.
- [ ] The same element in « À favoriser » and « Éviction totale » appears as a blocker.
- [ ] A calculation marked « à revalider » appears as a blocker.
- [ ] An unrecognised element is listed as « non appliqué » and is not a blocker.
- [ ] With one or more blockers the confirmation button is disabled and each blocker names its fix.

## Out of scope

- The confirmation and the status flip: `activation-action`.
- The eviction period rules themselves: `eviction-safety`.

## Notes

D-30 (story 30's priority order), D-31 (status enum). Files: `apps/admin/app/(admin)/patients/[id]/` (a recap route or panel), a read model in `packages/services/src/services/`. Cross-epic: `protocol-versions/working-copy-and-validate`, `food-directives` (unrecognised elements), `eviction-safety` (period rules).
