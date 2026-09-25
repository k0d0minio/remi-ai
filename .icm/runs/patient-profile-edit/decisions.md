# Decisions: patient-profile-edit

The `D-n` ids this run rests on, mirrored from the scope's Decisions table
(`_shared/scope-template.md` → `D-n` ids are permanent), plus any the run itself had to make.
`validate-decisions.sh <slug>` traces the scope's ids into `spec.md` and `notes.md`; this file
is the run's own ledger, so a session need not open the scope to know what was settled and a
decision made mid-run has one home.

## From the scope

No `scope.md` for `patient-loop` (cut before the front existed); the epic's decisions of record
(`.icm/intake/README.md` § Decisions of record) that bind this run:

- D-2 — The patient link becomes read + write on the same token; the token is the whole credential.
- D-6 — Generated recipes pass an automated check (allergies, intolerances, diet, recommendations, time and difficulty) — the fields this run makes patient-kept.
- D-23 — `patient-profile-edit` carries the 18+ rule and « age, not date of birth » as an open point (`birth_date` is stored today).

## Made in this run

Settled with the operator in Define, 2026-09-25:

- D-25 — Time and budget use the old version's words: faible / moyen / important · économique / standard / confort. Her own vocabulary, already in the V2 onboarding.
- D-26 — The patient edits allergies freely (add, change, remove); the console's « modifié par la patiente le … » marker and the audit trail are the safeguard, not a confirmation step.
- D-27 — D-23 is out of scope here: the patient does not edit identity, `birth_date` stays, age stays derived; the 18+ check belongs to `beyond-december/patient-accounts`.
- D-28 — Existing free-text `food_budget` values that name no level move into `preferences` as « Budget : <text> »; nothing typed is lost.
