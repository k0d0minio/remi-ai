# Decisions: check-in-and-progression

The `D-n` ids this run rests on, mirrored from the scope's Decisions table
(`_shared/scope-template.md` → `D-n` ids are permanent), plus any the run itself had to make.
`validate-decisions.sh <slug>` traces the scope's ids into `spec.md` and `notes.md`; this file
is the run's own ledger, so a session need not open the scope to know what was settled and a
decision made mid-run has one home.

## From the scope

No `scope.md` for `patient-loop` (cut before the front existed); the decisions of record in
`.icm/intake/README.md` bind instead:

- D-2 — The patient link becomes read + write on the same token.
- D-9 — Check-ins are in-page, with no outbound channel; a simple progression view on both sides.
- D-17 — The 11 September call and her 14 September answer rank first.
- D-19 — `check-in-and-progression` carries her weekly 0–5 score as an open point.

## Made in this run

- D-30 — The check-in is her weekly 0–5 score per active goal, all goals on one card, optional word
  each; goals only — recommendation check-ins and their table are dropped. Define, operator, 2026-09-24.
- D-31 — The score is how the week went for that goal (0 = pas bien du tout, 5 = très bien); worse =
  lower than the patient's previous score on that goal. Define, operator, 2026-09-24.
- D-32 — The check-in card sits beside the general-feedback box on the home, two separate cards (settles
  the same point in `general-feedback`). Define, operator, 2026-09-24.
- D-33 — A patient's worse score raises an awaiting-attention count on the patient page, cleared by
  « Vu ». Define, operator, 2026-09-24.
- D-34 — "Recipes tried" is dropped from « Ma progression » until `recipe-feedback-and-favourites`
  records it. Define, operator, 2026-09-24.
