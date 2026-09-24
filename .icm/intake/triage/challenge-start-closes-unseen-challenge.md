# Stub: Starting a challenge closes the one open now, not the one she saw

- lane: bug
- found-by: general-feedback · release code review · 2026-09-24
- complexity: low

## Problem

`startChallenge` (`packages/services/src/db/services/patient-challenges/index.ts`) closes whichever
challenge is open at submit time; the form in `apps/admin/components/patients/challenge-section.tsx`
never posts the id of the challenge she was looking at. If another tab replaced it meanwhile, the
newer challenge is closed with the outcome she picked for the older one. Sibling of
`challenge-writes-double-submit.md` (the concurrent-submit throw).

## Proposed change

Post the expected current challenge id with the create form and refuse (`conflict`) when the open
challenge is no longer that one; a service test for it.
