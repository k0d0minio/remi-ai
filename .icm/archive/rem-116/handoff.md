# Handoff rem-116

## Next action

The operator tests the badge on the admin preview, then ticks Ready to merge.

## How to test

Open a patient file in the admin console and go to the Journal segment. Each meal card shows a
badge « prévu » or « mangé » next to the moment of the meal. A meal that the patient planned from
the link shows « prévu ».

## Blockers

- none

## Do not touch

- none

## Notes

- Scope (BAXTER, 2026-11-24): the badge only. The toggle command is an open question for Morgane,
  in `findings.md` and in the pull request summary.
- The labels are `mealIntentLabels` in `@remi/services/shared` (`meal-intent.ts`), with their test,
  because `apps/admin` has no test runner.
