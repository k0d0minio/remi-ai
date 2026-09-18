# check-in-goal-not-scoped-to-patient

- epic: triage
- lane: bug
- status: active
- created: 2026-09-17
- size: S
- depends-on: none

## Problem

`addCheckInAction` and `updateCheckInAction` (`apps/admin/lib/patients/actions.ts`) take a
`goalId` from the submitted form and pass it straight to `addGoalCheckIn` / `updateGoalCheckIn`,
which resolve the goal by id alone. Neither checks that the goal belongs to the patient whose page
the form was rendered on, so a tampered submission attaches a check-in to another patient's goal —
and the audit row it writes names the wrong patient, because its label comes from the same form.

Found in the Release review of `consultation-update` (#99), which introduced the same shape in its
composed write and fixed it there: `recordConsultation` now checks every submitted goal id against
`listPatientGoals(patientId)` before writing. These two are the pre-existing single-row path and
were left alone rather than widening that PR.

**Not a privilege boundary.** Both operator roles already manage every patient, so this is record
integrity and a truthful audit trail, not an access-control hole. That is why it is a bug stub and
not a security hold.

## Acceptance

- [ ] `addCheckInAction` and `updateCheckInAction` refuse a `goalId` that does not belong to the
      `patientId` on the form, with the same "no such goal for this patient" shape the composed
      write uses.
- [ ] A service test covers each, asserting nothing is written and no audit row is recorded.
- [ ] The check lives where it cannot be forgotten by the next caller — preferably in the service,
      taking the patient id, rather than repeated in each action.
