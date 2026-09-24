# Decisions: patient-documents-and-links

The `D-n` ids this run rests on, mirrored from the scope's Decisions table
(`_shared/scope-template.md` → `D-n` ids are permanent), plus any the run itself had to make.
`validate-decisions.sh <slug>` traces the scope's ids into `spec.md` and `notes.md`; this file
is the run's own ledger, so a session need not open the scope to know what was settled and a
decision made mid-run has one home.

## From the scope

- D-2 — the patient link's token reads and writes; patient accounts wait.
- D-12 — the meal journal stays text-only; photos parked (the vendor is now D-18's).
- D-18 — files: a files seam with Vercel Blob as its one adapter, EU region.
- D-19 — the link gets challenges, documents and links, general feedback before any model.

## Made in this run

- D-25 — accepted types PDF, JPEG, PNG, WebP; 10 MB cap; enforced in the seam (Define, operator, 2026-09-24).
- D-26 — a document belongs to the patient and attaches to at most one of a goal or the patient's
  recipe assignment; deleting the parent sets it null (Define, operator, 2026-09-24).
- D-27 — the patient sees a document's title and date added, no author (Define, operator, 2026-09-24).
- D-28 — recipe-tagged files and links show under « Mes recettes » and in « Mes documents » (Define,
  operator, 2026-09-24).
