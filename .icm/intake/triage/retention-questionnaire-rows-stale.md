# Stub: RETENTION.md says no page shows the questionnaire answers

- lane: chore
- found-by: patient-file-view/file-page-frame, pull request of the BMI by the book · 2026-11-10
- complexity: low
- priority: P2

## Problem

`.icm/docs/RETENTION.md` § What is held about a patient says « no — no page shows them yet » on six questionnaire rows. The console patient file now shows every answer. The column is about the patient's link, so the « no » stays true. The words « no page shows them yet » are stale.

## Proposed change

Change the six cells to « no » plus where the answers show today: the console patient file, and the patient's own questionnaire.

## Acceptance criteria

- [ ] No row of `RETENTION.md` says « no page shows them yet » for a questionnaire answer.
- [ ] Each changed row names where the answer shows today.
