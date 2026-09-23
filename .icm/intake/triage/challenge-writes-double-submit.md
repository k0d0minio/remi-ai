# Stub: Guard challenge close/start against a concurrent second submit

- lane: bug
- found-by: challenges · release code review · 2026-09-23
- complexity: medium

## Problem

`packages/services/src/db/services/patient-challenges/index.ts` checks that a challenge is open,
then updates it by id with no "still open" condition — the storage seam's `update` has no
conditional `where`. Two tabs closing the same challenge with different outcomes: the second
silently rewrites the closed row's outcome and the trail holds two `challenge.closed` rows. Two
simultaneous « Lancer le challenge » submits: the second rewrites the first close, then throws on
the `patient_challenges_one_open` index — uncaught, so the console shows an error page rather than
the form's message. The forms disable their button while pending, so a single tab cannot do it.

## Proposed change

Give the seam a conditional update (or re-read the row inside the transaction and refuse when
`closedOn` is set), and turn the unique-index violation in `startChallenge` into a `conflict`
Result. Service tests for both.
