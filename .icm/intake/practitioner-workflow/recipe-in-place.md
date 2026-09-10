# Stub: Recipes in place — create, adapt and assign from the patient page

- feature-slug: recipe-in-place
- sequence: 3 of 6
- depends-on: none
- priority: P1
- size: M
- sources: feedback § 2 row 5 · § 5 bullet 5 ("attribuer au patient directement lors de la
  création") · § 7 · § 9.4 · decisions #5 (2026-09-10) and #5 (2026-09-01) ·
  `apps/admin/components/patients/assign-recipe-form.tsx` ·
  `apps/admin/app/(admin)/recipes/[id]/page.tsx` (the "dupliquer en variante" comment) ·
  `packages/services/src/db/services/recipes/index.ts`

## What this is

Today a recipe is written in `/recipes`, then assigned from the patient page by picking it from a
select; if the library is empty the patient page says go write one elsewhere. Her § 2: "les
recettes doivent être faciles à créer, dupliquer, adapter et attribuer directement à un patient".
Decision #5 keeps the library (Morgane reuses recipes across 10–15 patients) and adds the three
missing gestures:

- **Create from the patient page.** The recipes section's "Proposer une recette" opens the recipe
  form in place; saving creates the library row **and** the assignment (with the per-patient note
  and today's date) in one action. No trip to `/recipes`.
- **Duplicate as a variant.** From an assignment or from `recipes/[id]`: copy the recipe (title
  suffixed, tags carried), open it for editing, and — when started from a patient — assign the
  variant to that patient in the same save. This is the escape hatch the two code comments have
  been asking for, answered: editing a shared recipe still changes it for everyone; adapting for one
  person is a variant.
- **Assign several at once.** The assign form takes a multi-select over the active library with
  one note, instead of one recipe per submit (the bulk principle from `bulk-entry`, applied here).

Generation (`ai-assist/recipe-generation`) writes into exactly this path — library row + assignment
+ automated check — so this stub is its manual twin and its prerequisite.

## Worth knowing

- One transaction for create + assign; audited as one event naming both.
- The library detail page's "N personnes l'ont en ce moment" stays true for variants — a variant is
  a new library row, not a fork of an assignment.
- The library grows fast once variants exist; a "variant of" reference (nullable self-FK) keeps the
  family visible and is cheap to add now — Define decides whether to add it or leave provenance in
  the title.
- The recipe body is single-field prose today. Generation will want ingredients and steps
  separately; whether that split lands here or in `recipe-generation` is Define's call — flag it,
  do not do both.

## Open questions — flag these on pickup

- Does a variant keep a link to its origin in the UI ("variante de …"), or is it just another
  recipe to her?
- Tags: does she use them? If not, they should not be on the in-place form.
- When she adapts a recipe already assigned to a patient, should the old assignment archive
  automatically, or stay alongside the variant?

## Prompt

Run `/pipeline new .icm/intake/practitioner-workflow/recipe-in-place.md` in the remi-ai repo and
follow the pipeline from there. Read the stub and its epic's `breakdown.md` (§ Decisions binds)
first. Scope: create a recipe from the patient page with the assignment in the same save;
duplicate a recipe as a variant (from an assignment or the library) and assign it in the same
gesture; assign several library recipes at once; the library stays. One transaction per gesture,
audited. No AI, nothing on the patient link. Raise the stub's open questions rather than answering
them.
