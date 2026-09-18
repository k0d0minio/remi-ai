# Stub: Check-in actions accept a goal that belongs to another patient

- lane: bug
- found-by: the `consultation-update` Release review (#99) · 2026-09-17
- size: S

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

## Proposed change

Check the submitted goal id against the patient's own goals in the service — the same « no such goal for this patient » shape the composed write uses — so no caller can forget it.

## Acceptance criteria (rough)

- [ ] `addCheckInAction` and `updateCheckInAction` refuse a `goalId` that does not belong to the
      `patientId` on the form, with the same "no such goal for this patient" shape the composed
      write uses.
- [ ] A service test covers each, asserting nothing is written and no audit row is recorded.
- [ ] The check lives where it cannot be forgotten by the next caller — preferably in the service,
      taking the patient id, rather than repeated in each action.

## Prompt

Run `/pipeline bug check-in-goal-not-scoped-to-patient` in the remi-ai repo. The lane pre-seeds from this stub and moves it to `triage/_done/` when it opens the PR. Scope is the Proposed change and nothing wider; a question left open above is raised, not answered in code.
