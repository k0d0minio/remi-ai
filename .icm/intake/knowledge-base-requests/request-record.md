# Stub: The practitioner asks for an unknown term to be added and sees the request's status

- feature-slug: request-record
- epic: knowledge-base-requests
- story: 15
- sequence: 1 of 2
- depends-on: none
- complexity: medium
- priority: P0

## Problem

A directive term REMI does not know, or knows without reliable associations, blocks that one directive. The practitioner needs a way to ask for it without leaving the file, and to see what happened to the ask.

## Proposed change

A table `term_requests`: term as typed, normalised term, reason `unknown` | `associations`, requesting practitioner, source patient file, optional comment, status `pending` | `validated` | `refused`, reviewed by, reviewed at, optional refusal line. One migration. A service `requestTerm(...)`: when a `pending` row exists for the same normalised term and reason, it returns that row and creates nothing. The directive field shows the status next to the flagged term: « En attente », « Validé », « Refusé ». Each request writes an audit event. No e-mail, no in-app notification.

## Acceptance criteria

- [ ] The migration adds `term_requests`.
- [ ] A request records the term, the reason, the practitioner, the date, the source file and the optional comment.
- [ ] A second request for the same normalised term and the same reason, while one is pending, creates no row and shows « En attente ».
- [ ] The practitioner sees « En attente », « Validé » or « Refusé » beside the term on the directive field.
- [ ] No notification is sent.
- [ ] Every request writes an audit event (D-32).

## Out of scope

- The admin's review (admin-review).
- Any change to the term base. A request never writes a term.

## Notes

- D-30: a pending term never influences a recipe.
- Files: `schema.ts`, a migration, `packages/services/src/db/services/term-requests/`, the directive field in the console.
- cross-epic: food-directives/directive-resolution renders the button and the status.
