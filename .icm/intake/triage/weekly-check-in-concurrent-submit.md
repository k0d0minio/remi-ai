# Stub: Guard the weekly check-in against two tabs submitting at once

- lane: bug
- found-by: check-in-and-progression · release code review · 2026-09-24
- complexity: medium

## Problem

`recordWeeklyCheckIn` (`packages/services/src/db/services/patient-goals/index.ts`) reads the
patient's last check-in date inside its transaction and refuses when the week is already answered,
but nothing in the database enforces it: two requests racing past the read both insert. The form
now disables its button while sending, so one tab cannot do it; two tabs submitting in the same
instant still can — two scores per goal for the same day, a doubled strip, and possibly two unseen
« en baisse » rows waiting for Morgane.

## Proposed change

A partial unique index on `patient_goal_check_ins (goal_id, checked_on) where written_by =
'patient'` (a new migration — never an edit to `0022`), and the violation turned into the
service's `conflict` Result the card already words as « déjà répondu ». Service test for the
refusal.
