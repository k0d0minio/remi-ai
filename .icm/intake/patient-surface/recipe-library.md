# Stub: Recipe library — shared recipes, assigned per patient, refreshed weekly

- feature-slug: recipe-library
- sequence: 2 of 4
- depends-on: none
- priority: P1
- size: M
- sources: v2 brainstorm § I (RECIPES) + WEEKLY_ADAPTATION (§ 8) · scope answers 2026-09-01
  (patient-record/breakdown.md § Decisions, #5)

## What this is

Recipes are the decision of record where Jamie chose the heavier shape on purpose (#5): a **shared
library** plus **per-patient assignment**, because Morgane reuses recipes across her 10–15
patients and personalises the giving, not the dish.

**The library.** A recipe is light, per § 7's explicit ban on dozens of fields: title, a free-text
body (ingredients and steps as prose — she writes them in chat today and pastes), and at most a
few coarse tags where a filter will genuinely need them. Library entries archive rather than
delete. Admin gets a new section for it — its own nav entry beside Patients, since a library
belongs to no one patient.

**The assignment.** Giving a recipe to a patient adds: a personal note ("pourquoi pour toi" —
§ H's justification logic applied to recipes), a date, and a status (active / archived). The
**weekly refresh is the WEEKLY_ADAPTATION record**: each week Morgane assigns the new
inspirations, archives what rotates out, and the dated assignment trail *is* the adaptation
history the AI round will later learn from. On the patient page, an "assign from library" picker
plus the patient's current and past assignments.

The patient link renders active assignments (title, body, her note) in `patient-link-segments`
(§ J: "recettes inspiration").

## Worth knowing

- A types-only v1 `Recipe` (with `Ingredient[]`) still exists in
  `packages/services/src/db/models/recipe.ts` and is re-exported from shared. It matches nothing
  in this design; the build must replace or retire it, not work around it — v1 is explicitly not
  V2's spec.
- Tags: start from what § I actually filters on (season, régime) and only if the UI uses them at
  launch. An unused taxonomy is the § 7 failure in disguise.
- Two tables (library + assignment), both behind the seam, both audited, migrations generated.

## Open questions — flag these on pickup

- Editing an assigned recipe edits it for every patient holding it. Fine for fixing a typo; wrong
  for personalising a variant. Does Morgane want "duplicate to variant" from day one, or accept
  shared edits during the beta? Ask her.
- Weekly cadence: § I says new inspirations each week. Does she want the tool to *mark* weeks
  (assignments grouped by week label) or is the assignment date enough? Don't build a week entity
  without her asking for one.
- Tags at launch: which, if any?

## Prompt

Run `/pipeline new .icm/intake/patient-surface/recipe-library.md` in the remi-ai repo and follow
the pipeline from there. Read the stub and its epic's `breakdown.md` first — and the decisions of
record in `.icm/intake/patient-record/breakdown.md`; #5 fixes the library+assignment shape. Scope:
a shared recipe library (title, prose body, minimal tags, archive-not-delete) with its own admin
section, plus per-patient assignments (personal note, date, active/archived) managed from the
patient page — tables, migrations, services behind the seam; deal with the legacy types-only v1
`Recipe` model rather than leaving two vocabularies. Nothing renders on the patient link in this
stub. Raise the stub's open questions rather than answering them.
