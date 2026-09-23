# Decisions: challenges

The `D-n` ids this run rests on, mirrored from the scope's Decisions table
(`_shared/scope-template.md` → `D-n` ids are permanent), plus any the run itself had to make.
`validate-decisions.sh <slug>` traces the scope's ids into `spec.md` and `notes.md`; this file
is the run's own ledger, so a session need not open the scope to know what was settled and a
decision made mid-run has one home.

## From the scope

- D-2 — The patient link becomes read + write on the same token (intake README, decisions of record).
- D-9 — Check-ins are in-page, with no outbound channel (intake README).
- D-19 — The patient link gets what she asked for on 14 September, before any model: `challenges`
  among them (september-sources scope).

## Made in this run

- D-25 — One open challenge per patient; creating a new one closes the current with an outcome
  she picks in the create form (pre-selected from the patient's tap). Define, operator, 2026-09-23.
- D-26 — The patient's taps are sequential and undoable until close: « Prêt(e) pour le prochain »
  appears only after « Challenge acquis »; clearing « acquis » clears « prêt(e) ». Define, operator.
- D-27 — « Prêt(e) pour le prochain » is an awaiting item on the at-a-glance view and a badge on the
  patient list, cleared by closing or creating. Outcomes are Acquis / Non acquis / Abandonné.
  Define, operator.
- D-28 — Her labels verbatim (« Challenge acquis », « Prêt(e) pour le prochain »); the link's
  instruction card is relabelled « La consigne de la semaine » / « This week's focus ». Define,
  operator.
