# Stub: Each directive term shows its official name, or a visible flag, and never passes as validated by accident

- feature-slug: directive-resolution
- epic: food-directives
- story: 13
- sequence: 3 of 4
- depends-on: directive-fields
- complexity: medium
- priority: P0

## Problem

A typed term can be a synonym, a misspelling, a term with no reliable food associations, or a word REMI does not know. The story forbids a silent guess. The practitioner must see what REMI recognised and accept every correction.

## Proposed change

On save, each row runs `resolveTerm`. Four states show on the field: recognised (official name shown next to the typed word), correction proposed (REMI shows « Vouliez-vous dire … ? » and a button « Accepter »; the row stays `pending` until accepted), uncertain (recognised term with no `significant` association: a visible flag « associations à vérifier »), unknown (a visible flag « non reconnu »). An uncertain or unknown row shows « Demander l'ajout », which calls knowledge-base-requests. Only a recognised row with a `significant` association can reach the validated state. Nothing a model returns enters this step: the resolver is code and the synonym table.

## Acceptance criteria

- [ ] A recognised term displays its official name beside the typed word.
- [ ] A proposed correction is applied only after the practitioner clicks « Accepter ».
- [ ] An unknown term shows « non reconnu », stays unvalidated and shows « Demander l'ajout ».
- [ ] A term with no reliable association shows « associations à vérifier », stays unvalidated and shows « Demander l'ajout ».
- [ ] A row that is not recognised never reaches the validated state.
- [ ] Unit tests cover the four states and the accepted correction.

## Out of scope

- The request record itself (knowledge-base-requests/request-record). This stub calls its service.
- Any model call.

## Notes

- D-30: an unknown element is never validated.
- Files: the console protocol section, `packages/services/src/db/services/patient-food-directives/`, `food-terms/`.
- cross-epic: knowledge-base-requests/request-record (the button's target).
