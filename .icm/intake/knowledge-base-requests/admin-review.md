# Stub: The admin reviews term requests and validates, completes or refuses them

- feature-slug: admin-review
- epic: knowledge-base-requests
- story: 15
- sequence: 2 of 2
- depends-on: request-record
- complexity: medium
- priority: P1

## Problem

A request has no reader. Until someone validates the term and its food associations, the directive stays unapplied. The REMI team needs one list and one screen per request.

## Proposed change

In `apps/admin`, for the admin role only: a page « Demandes d'ajout » listing requests by status and date, and a detail page per request. On the detail: the term, the reason, the practitioner, the source file, the comment. Three actions. « Valider » creates the term in `food_terms` as validated, or completes an existing term, with its associations entered as rows (food, level, provenance, confidence). « Compléter » adds associations to a known term. « Refuser » closes the request with an optional line. Each action writes an audit event and updates the request's status. Until this stub ships, Jamie loads validated terms by hand on Morgane's word.

## Acceptance criteria

- [ ] An admin sees the list of requests with status, term, reason, practitioner and date. A practitioner does not see the page.
- [ ] The detail shows the term, the reason, the practitioner, the source file and the comment.
- [ ] « Valider » writes a validated term and its associations into the term base.
- [ ] « Compléter » adds associations to an existing term.
- [ ] « Refuser » sets the status « Refusé » and keeps the optional line.
- [ ] A term is usable in a directive only after « Valider ». Before that, the directive stays unvalidated.
- [ ] Every action writes an audit event (D-32).

## Out of scope

- A bulk import of terms. One request at a time.
- Any notification to the practitioner.

## Notes

- D-27: admin role in `apps/admin`. Role checks come from the auth epic (another fork). Until roles exist, the operator account is the admin.
- Files: `apps/admin/app/(admin)/demandes-ajout/`, `term-requests/`, `food-terms/`.
- cross-epic: food-directives/term-base (the tables written).
