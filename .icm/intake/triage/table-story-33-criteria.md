# Stub: Table story 33's criteria in meal-improvement, and fix its stale cross-reference

- lane: chore
- found-by: the ticket audit against Morgane's mails · 2026-11-01
- complexity: low
- priority: P2

## Problem

Story 33 « Suppression de la photo » (27 October 2026) has four acceptance criteria: no photo
button, icon or field; the patient types freely and gets a suggestion; no image-analysis call;
a vague description gets a question. `meal-improvement/breakdown.md` tables none of them, because
the document is not in Drive `user-stories/`. « No image-analysis call » is a Notes line of
`meal-suggestion`, not an acceptance criterion. `patient-home-navigation/home-meal-block.md` cites
`meal-improvement/suggest-from-meal`, a stub that does not exist.

## Proposed change

Jamie files « 33 Suppression de la photo.docx » in Drive `user-stories/`. Then a chore run adds
the four rows to `Criteria → stubs` with the document's link in `source:`, adds « No call reads
an image » to the acceptance criteria of `meal-suggestion`, and points `home-meal-block` at
`meal-improvement/meal-suggestion`.

## Acceptance criteria

- [ ] `meal-improvement/breakdown.md` tables story 33's four criteria, each with its stub.
- [ ] `meal-suggestion.md` has an acceptance criterion that no image reaches a model.
- [ ] No open stub cites `meal-improvement/suggest-from-meal`.
