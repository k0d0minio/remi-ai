# Stub: Reuse and duplicate — a protocol block copied from another patient or a template

- feature-slug: reuse-and-duplicate
- scope: practitioner-workflow
- personas: practitioner
- initiative: a patient experience validated on real terrain, in time for the December open day / objective: a usable patient version for the partner clinic to test on 1 December
- depends-on: bulk-entry, recipe-in-place
- sequence: 5 of 7
- priority: P1
- size: M
- sources: feedback § 5 bullet 4 ("fonctions de duplication / réutilisation pour les
  recommandations, compléments et recettes récurrentes") · product rule (never encode the same
  information twice) · brainstorm § 7 (no exhaustive practitioner base)

## Problem

Ten patients with « augmenter les protéines, favoriser les oméga-3, limiter les sucres raffinés » is the same three rows typed ten times. Her § 5 asks for duplication and reuse; the product rule is that she never encodes the same information twice.

## Proposed change

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

## Acceptance criteria (rough)

- [ ] In a section's multi-row edit mode, « Reprendre de … » picks one of her other patients, lists that patient's active rows of the same kind with checkboxes, and appends the chosen rows to the grid unsaved
- [ ] A named set of rows of one kind can be saved as a personal template from any grid and inserted into any other, backed by one small `protocol_templates` table
- [ ] Assigned recipes join the copy-from-patient picker so an assignment set can be reused
- [ ] Copying across records writes an audit event naming the source patient

## Out of scope (this feature)

- Any AI; anything on the patient link; a normalised practitioner base (brainstorm § 7); patient groups (`beyond-december/patient-groups`)

## Notes for Define

- **Decisions that bind** ([`README.md § Decisions of record`](../README.md)): D-5 (the library stays) · the product rule (never encode the same information twice) · brainstorm § 7 (no exhaustive practitioner base).

- Copying from another patient reads health data across records; it is an operator acting inside
  her own console, so no new permission, but the audit event names the source patient.
- Template rows are the grid's row shape serialised; when the row shape changes, templates need a
  migration or a tolerant reader — say which in the PR.
- Keep the picker plain: pseudonym + last consultation date, filtered by typing. No roster
  redesign.

**Open for Define** — settled with the operator before the spec is approved, never assumed:

- Are templates per operator or shared across the console's operators? (Only Morgane encodes
  today; the answer changes the table's key.)
- Does she want "copy" to carry the detail/reason text, or only titles she then rewrites?

## Prompt

Run `/pipeline new reuse-and-duplicate` in the remi-ai repo. Define reads this stub, its epic's `breakdown.md` and the decisions of record in `.icm/intake/README.md`, and asks the points under **Open for Define** rather than answering them. Scope is the Proposed change and nothing under Out of scope.
