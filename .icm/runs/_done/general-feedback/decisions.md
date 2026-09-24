# Decisions: general-feedback

The `D-n` ids this run rests on, mirrored from the scope's Decisions table
(`_shared/scope-template.md` → `D-n` ids are permanent), plus any the run itself had to make.
`validate-decisions.sh <slug>` traces the scope's ids into `spec.md` and `notes.md`; this file
is the run's own ledger, so a session need not open the scope to know what was settled and a
decision made mid-run has one home.

## From the scope

- D-2 — The patient link becomes read + write on the same token; patient accounts wait.
- D-9 — Check-ins are in-page, with no outbound channel; a simple progression view on both sides.
- D-19 — The patient link gets what she asked for on 14 September, before any model: `challenges`,
  `patient-documents-and-links`, `general-feedback` (one free-text box, weekly framing, listed in
  the console).

## Made in this run

- D-35 — The prompt is her § 6 example verbatim, both sentences. Define, operator, 2026-09-24.
- D-36 — The feedback box sits beside the one-tap check-in on the home; it does not replace it
  (answers the same open point in `check-in-and-progression`). Define, operator.
- D-37 — A patient message's unread mark clears on a reply (every earlier unread one) or on
  « Marquer comme lu »; opening the page clears nothing. Define, operator.
- D-38 — Run ahead of `patient-documents-and-links`; whichever merges second renumbers its
  migration. Define, operator.
- Renumbered at Release (2026-09-24): Define picked D-30–D-33 while `check-in-and-progression` picked the same ids in parallel and merged first (#125); this run's four are D-35–D-38. Its D-32 (the two home cards side by side) and this run's D-36 say the same thing.
