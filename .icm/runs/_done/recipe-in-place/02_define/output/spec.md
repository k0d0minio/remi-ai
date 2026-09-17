# Spec: Recipes in place — create, adapt and assign from the patient page

- slug: recipe-in-place
- apps: admin, packages
- touches: apps/admin/app/(admin)/patients/[id]/page.tsx, apps/admin/components/patients/, apps/admin/components/recipes/, apps/admin/lib/patients/actions.ts, apps/admin/lib/recipes/actions.ts, apps/admin/app/(admin)/recipes/[id]/page.tsx, packages/services/src/db/models/recipe.ts, packages/services/src/db/schema.ts, packages/services/src/db/migrations/, packages/services/src/db/services/recipes/, packages/services/src/db/services/recipe-assignments/, packages/services/src/shared/audit.ts
- complexity: complex

## Problem

Giving a patient a recipe costs Morgane three page loads today. The patient page's « Recettes »
section can only pick from a select over the existing library, and when the library has nothing to
offer it tells her to go and write one in « Recettes » — a dead end in the middle of a consultation.
Adapting a recipe for one person has no answer at all: editing the shared row changes it for the ten
other patients holding it, which `recipes/index.ts` and `recipes/[id]/page.tsx` both say in a comment
and neither resolves. And the assign form takes one recipe per submit, so a week's inspirations are
four round-trips through the same three fields.

Her § 2 names it directly — « les recettes doivent être faciles à créer, dupliquer, adapter et
attribuer directement à un patient » — and her § 7 asks for assignment « directement lors de la
création ». It is the epic's product rule, that a practitioner never encodes the same information
twice, applied to the one section where she today encodes it in a different app.

This advances the current initiative's second objective — a usable version the partner clinic's team
can test on 1 December — by way of its precondition: nothing downstream gets real data until
encoding a patient takes minutes. Note that `business/initiatives` still reads "the practitioner
space is parked"; the decisions of 2026-09-10 (`practitioner-workflow/breakdown.md` § Decisions #1
and #5) supersede that, and the page is the thing to fix at Release, not this spec.

## Proposed change

Three gestures on the console's existing surfaces, and the model change that makes the third one
honest. The library stays shared and reusable (decision #5) — every gesture here writes into it.

**Create from the patient page.** The « Recettes » section gains « Proposer une recette », which
opens the recipe form in place rather than linking away. It carries title, body, the per-patient note
and the date; saving writes the library row and the assignment in one action. The section offers it
whether or not the library has anything in it, so the empty-library dead end goes away.

**Duplicate as a variant.** From an assignment card on the patient page, and from `/recipes/[id]`.
The copy carries the body and the tags, suffixes the title, and records the recipe it came from.
Started from a patient, the same save assigns the variant to that patient and archives that patient's
assignment of the original — the variant replaces what it adapts, for that person only; every other
holder of the original is untouched. Started from the library, it is a copy opened for editing and
nothing is assigned, because there is no patient in context.

**Assign several at once.** The assign form's single select becomes a multi-select over the active
library, with one note and one date for the batch and one assignment row per recipe chosen. This is
`bulk-entry`'s principle applied to the section that needs it most.

**Provenance.** A recipe gains a nullable self-reference to the recipe it was duplicated from. It is
set on duplicate and never afterwards; it is what keeps the growing library legible once variants
exist, and it cannot be backfilled if added later.

Each gesture is one transaction through the seam's `transaction` (`db/client.ts`) and one audit
event naming both the recipe and the patient.

## Acceptance criteria

- [ ] The patient page's « Recettes » section offers « Proposer une recette », which opens a create
      form in place — no navigation to `/recipes` — and offers it even when the library is empty.
- [ ] Saving that form creates the library row and an active assignment for that patient, carrying
      the note and the date entered, in one submit.
- [ ] The in-place create form has no tags field; the recipe is created untagged and can be tagged
      afterwards from `/recipes`.
- [ ] An assignment card on the patient page offers « Dupliquer en variante », which opens the
      recipe pre-filled: body copied, tags carried, title suffixed, all editable before saving.
- [ ] Saving that duplicate creates a new library row, assigns it to that patient, and archives that
      patient's assignment of the original — the original row moves to « Recettes précédentes » and
      the variant appears under « Recettes », without leaving the page.
- [ ] Other patients holding the original are unaffected: their assignments stay active and the
      original's body is unchanged.
- [ ] `/recipes/[id]` offers « Dupliquer en variante »: it creates the copy and opens it for editing,
      and assigns nothing.
- [ ] A duplicated recipe records the recipe it came from; `/recipes/[id]` and the patient's
      assignment card both show « variante de <titre d'origine> », linking to the origin.
- [ ] The origin's « N personnes l'ont en ce moment » counts holders of that row only — a variant
      does not count towards its origin.
- [ ] The assign form takes several active-library recipes in one selection, with one note and one
      date, and writes one assignment row per recipe chosen on a single submit.
- [ ] Selecting a recipe the patient already holds actively is refused with a message naming that
      recipe, and none of the batch is written.
- [ ] Each of the three gestures writes inside one transaction: a failure part-way leaves neither a
      library row nor an assignment behind.
- [ ] Each gesture records exactly one audit event, naming the recipe and the patient, under a new
      action added to `auditActions`; the events are visible under their own filter in the journal.
- [ ] A migration adds the nullable self-reference to `recipes`; every recipe that existed before it
      reads as having no origin, and the library, the picker and the patient page render unchanged
      for them.
- [ ] Services tests cover the three gestures, the rollback on failure, the already-held refusal and
      the variant link; the database layer's coverage floor (`/CONVENTIONS.md` → Testing) holds.

## Out of scope

- **Splitting the recipe body into ingredients and steps.** The stub flags it as either this run's or
  `recipe-generation`'s, not both. It belongs to `ai-assist/recipe-generation`, the consumer that
  needs the structure; the body stays single-field prose here, and a variant that is prose copies as
  prose.
- Anything AI: generation, suggestion, prefill (`ai-assist`). This stub is generation's manual twin
  and writes the path generation will reuse — it calls no model.
- Anything the patient sees. Nothing on the patient link changes (`patient-loop`).
- Patient groups and assigning to several patients at once — parked with decision #5.
- Duplicating several recipes at once, and per-recipe notes inside one batch: one shared note and one
  shared date per submit.
- A reverse « variantes de cette recette » list on the origin page. The forward link only; the
  reverse view is a tweak once the library is big enough to want it.
- Backfilling provenance for recipes created before this run — it is not recoverable, and a guess
  would be worse than a blank.
- Editing a shared recipe still changes it for every holder. That is the library's shape, and the
  variant is the answer to it, not a change to it.

## Open questions

- none. The stub raised three, all answered by the owner at Define and built into the criteria
  above: a variant keeps a stored link to its origin **and** shows « variante de … »; tags are
  **omitted** from the in-place create form; duplicating from a patient **archives** that patient's
  assignment of the original in the same save.
