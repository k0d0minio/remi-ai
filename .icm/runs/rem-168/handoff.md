# Handoff rem-168

## Next action

The operator tests the preview of PR #254 on mobile and desktop, then ticks Ready to merge.

## How to test

Sign in as a patient with a complete questionnaire on the preview, and open the last step: `/fr/questionnaire?section=fin`.
The page shows « Tout est prêt pour ta consultation ! » with a green check, three numbered steps with the consultation date and « Avec ton praticien », and the closing line in blue.
« Terminer » fills the width and leads to the waiting screen. « Modifier mes réponses » returns to the questions.

## Blockers

- none

## Do not touch

- none

## Notes

- The practitioner has no first name in the data. The page shows « Avec ton praticien » (Jamie, 2026-11-27). Follow-up: REM-214 in Triage.
- With no consultation date, step 1 shows no date line. REM-209 owns the blocking of the finish.
- The Vercel `app` preview of the head commit was skipped by its Ignored Build Step (`turbo-ignore --fallback=HEAD^1`): the last commit of each push touches `.icm/` only. A Redeploy of the branch in Vercel builds the preview.
