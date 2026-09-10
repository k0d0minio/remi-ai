# Stub: Reuse and duplicate — a protocol block copied from another patient or a template

- feature-slug: reuse-and-duplicate
- sequence: 4 of 6
- depends-on: bulk-entry, recipe-in-place
- priority: P1
- size: M
- sources: feedback § 5 bullet 4 ("fonctions de duplication / réutilisation pour les
  recommandations, compléments et recettes récurrentes") · product rule (never encode the same
  information twice) · brainstorm § 7 (no exhaustive practitioner base)

## What this is

Ten patients with "augmenter les protéines, favoriser les oméga-3, limiter les sucres raffinés" is
the same three rows typed ten times. This stub makes a block reusable in two ways, both landing in
the multi-row edit mode `bulk-entry` built, so she reviews before saving:

- **Copy from another patient.** In a section's edit mode, "Reprendre de …" opens a picker of her
  other patients; choosing one lists that patient's active rows of the same kind (recommendations,
  supplements, essentials, or assigned recipes) with checkboxes; the chosen rows are appended to
  the grid, unsaved, for her to adapt. Nothing is linked back — a copy is a copy.
- **Personal templates.** A named set of rows of one kind ("Base anti-inflammatoire",
  "Compléments fatigue") she saves from any grid ("Enregistrer comme modèle") and inserts into any
  other. One small table (`protocol_templates`: kind, name, rows as JSON, operator, timestamps) —
  deliberately not a normalised "practitioner base", which brainstorm § 7 rules out.

Recipes reuse through the library and variants already (`recipe-in-place`); here they only join the
"copy from another patient" picker so an assignment set can be reused too.

## Worth knowing

- Copying from another patient reads health data across records; it is an operator acting inside
  her own console, so no new permission, but the audit event names the source patient.
- Template rows are the grid's row shape serialised; when the row shape changes, templates need a
  migration or a tolerant reader — say which in the PR.
- Keep the picker plain: pseudonym + last consultation date, filtered by typing. No roster
  redesign.

## Open questions — flag these on pickup

- Are templates per operator or shared across the console's operators? (Only Morgane encodes
  today; the answer changes the table's key.)
- Does she want "copy" to carry the detail/reason text, or only titles she then rewrites?

## Prompt

Run `/pipeline new .icm/intake/practitioner-workflow/reuse-and-duplicate.md` in the remi-ai repo
and follow the pipeline from there. Read the stub and its epic's `breakdown.md` (§ Decisions
binds) first. Scope: in the multi-row edit mode of recommendations, supplements and essentials
(and the assign-recipes surface), a "copy from another patient" picker that appends chosen rows
unsaved, and personal named templates saved from and inserted into any grid, backed by one small
templates table; audited. No AI, nothing on the patient link. Raise the stub's open questions
rather than answering them.
