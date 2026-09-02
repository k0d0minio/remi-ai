# Spec: Recipe library — shared recipes, assigned per patient

- slug: recipe-library
- apps: admin, web, packages
- touches: packages/services/src/db/schema.ts, packages/services/src/db/migrations, packages/services/src/db/models/recipe.ts, packages/services/src/db/models/recipe-assignment.ts, packages/services/src/db/models/meal.ts, packages/services/src/db/models/index.ts, packages/services/src/db/services/recipes, packages/services/src/db/services/recipe-assignments, packages/services/src/db/adapters/neon.ts, packages/services/src/server/index.ts, packages/services/src/shared/index.ts, packages/services/src/shared/audit.ts, apps/admin/app/(admin)/recipes, apps/admin/app/(admin)/patients/[id]/page.tsx, apps/admin/components/recipes, apps/admin/components/patients, apps/admin/components/shell/nav-sections.ts, apps/admin/components/audit/vocabulary.ts, apps/admin/lib/recipes/actions.ts, apps/admin/lib/patients/actions.ts, apps/web/app/[locale]/(app)/(patient)/meals, apps/web/lib/fixtures/meals.ts, apps/web/lib/queries/meals.ts, apps/web/lib/content/types.ts, apps/web/lib/content/en.ts, apps/web/lib/content/fr.ts, apps/web/components/shell/nav-icons.ts
- complexity: complex
- demo: none

## Problem

Brainstorm § I (RECIPES) is the one piece of content Morgane genuinely reuses: the same dish goes
to several of her 10–15 patients, and what she personalises is the giving — "pourquoi pour toi" —
not the recipe. Today she writes the recipe into WhatsApp and pastes it again for the next patient.
Nothing accumulates, the same dish exists in five slightly different versions, and § 8's
WEEKLY_ADAPTATION record — which inspirations she gave this week, which rotated out — exists only
in her scroll history.

This is stub 2 of the `patient-surface` epic, the epic that builds what Morgane _hands over_. It
ladders up to the current initiative's "database and accounts under it" objective: real records
behind the surfaces, built manual-first so the AI round later changes read and write sites rather
than migrations. The epic's decisions of record bind it —
[`patient-record/breakdown.md § Decisions`](../../../../../.icm/intake/patient-record/breakdown.md)
#5 fixes the shape (a shared library plus per-patient assignment, chosen over per-patient rows),
and "no AI anywhere" holds: Morgane writes every recipe and every note.

A second problem sits in the way. A types-only v1 `Recipe` (with `Ingredient[]`, `minutes`,
`servings`, `method[]`, `honours[]`) still lives in `packages/services/src/db/models/recipe.ts` and
is re-exported from `@remi/services/shared`. It is not dead code: `apps/web`'s `/meals` route
renders it from fixtures. It matches nothing in § I's design, and it belongs to the rigid weekly
meal plan that `business/scope` lists as **deliberately replaced**. Leaving it in place would give
the estate two incompatible things called `Recipe`.

## Proposed change

Two tables behind the storage seam, an admin section for the library, an assignment card on the
patient page — and the retirement of the v1 recipe surface so one `Recipe` vocabulary survives.

### The library — `recipes`

A recipe is light, per § 7's explicit ban on dozens of fields:

- `title` — required, ≤ 140 characters.
- `body` — the free-text prose she already writes in chat: ingredients and steps in one field, no
  structure imposed. Required, ≤ 4000 characters.
- `tags` — a free-form `text[]`, trimmed, lowercased, de-duplicated, at most 6 tags of ≤ 32
  characters each. **No taxonomy is defined.** Whatever Morgane types becomes the vocabulary, and
  the library's tag filter lists exactly the tags that exist. Promoting a used tag to a closed enum
  is a later, additive change; inventing `season` and `régime` columns now would answer a question
  that is hers (see Open questions).
- `archived_at` — nullable. Archive, never delete: a recipe patients hold cannot be removed from
  the record.

The table is **not patient-scoped** — the first content table in the estate that belongs to no one
patient, which is precisely decision #5.

**No `minutes`, `servings`, `ingredients[]`, `method[]` or `honours[]`.** The absence is the
specification, the same way it is for pantry essentials: those are v1's fields, and § 7 warns that
a form with a dozen boxes is a form she stops filling in.

**No delete surface at all.** The library archives; there is no hard delete in the service or the
console. A row assigned to a patient is part of that patient's history.

### The assignment — `patient_recipe_assignments`

- `patient_id` — FK to `patient_profiles`, `on delete cascade`.
- `recipe_id` — FK to `recipes`, `on delete restrict` (the library never deletes, and the
  constraint is what keeps that true).
- `note` — "pourquoi pour toi", § H's justification logic applied to recipes. Optional, defaults to
  `""`, ≤ 500 characters.
- `assigned_on` — a date, defaulting to today, editable. **This is the weekly record.** Each week
  Morgane assigns the new inspirations and archives what rotates out, and the dated trail _is_ the
  WEEKLY_ADAPTATION history the AI round will later learn from.
- `archived_at` — nullable; archiving retires an assignment without deleting it.

The same recipe may be assigned to the same patient many times over the months — that repetition is
the trail, so there is no unique constraint on the pair. What is refused is a **second active**
assignment of the same recipe to the same patient: the service returns `conflict`. Re-assigning
after an archive is allowed and expected.

**No week entity, no week label.** § I says "new inspirations each week"; the assignment date
carries that, and building a week table would answer a question nobody asked (see Open questions).

### The services

Two folders behind the seam, both following the `pantry-essentials` service exactly — zod
validation at the boundary, the existing `Result` shape, registration as the one-line pair (the
table in `db/schema.ts`, its name in the `neon.ts` collection registry):

- `packages/services/src/db/services/recipes/` — list active (optionally filtered to recipes
  carrying a given tag), list archived, list the distinct tags in use, get one, create, update,
  archive, restore, and count a recipe's assignments. No delete.
- `packages/services/src/db/services/recipe-assignments/` — list a patient's active assignments
  (newest `assigned_on` first) and archived ones (newest archive first), each joined to its recipe
  for rendering; assign, update (note and date), archive, restore, and delete the assignment that
  should never have been written. Assignment writes touch the patient the way recommendations and
  pantry essentials do.

Tag filtering is done in the service over the fetched page, the way `pantry-essentials` sorts in
the service: the seam stays an equality-and-limit interface, and the library is tens of rows, not
thousands.

### The admin section

A new nav entry, **« Recettes »**, in the console's "Suivi" section beside Patients — a library
belongs to no one patient, so it does not live under one.

- `/recipes` — the active library: title, its tags, when it was last changed. A tag filter built
  from the tags actually in use, plus a title search. A "new recipe" form, and an archived section
  with restore.
- `/recipes/[id]` — the editor: title, prose body, tags; archive and restore. It also shows **how
  many patients currently hold this recipe**, because an edit here changes the recipe for every one
  of them. That count is stated plainly rather than guarded — whether Morgane wants a
  "duplicate to variant" escape hatch is hers to answer (see Open questions), and telling her the
  blast radius is what lets her answer it.

On `/patients/[id]`, a recipes card after the pantry-essentials card: the patient's active
assignments (recipe title, its body, her note, the date), each with inline edit of note and date
and an archive control; an "assign from the library" picker that lists **active** library recipes
only, with the note and date entered at assignment time; and a past-assignments section with
restore. Routes stay English, copy is French, phone-first — `CONVENTIONS.md`, and she may well be
typing during a consultation.

Every write goes through a server action (`apps/admin/lib/recipes/actions.ts` for the library,
`apps/admin/lib/patients/actions.ts` for the assignments) and records an audit entry, with nine
actions added to the closed `auditActions` vocabulary and to the console's French audit labels:
`recipe.created`, `recipe.updated`, `recipe.archived`, `recipe.restored`, `recipe.assigned`,
`recipe.assignment_updated`, `recipe.assignment_archived`, `recipe.assignment_restored`,
`recipe.assignment_removed`.

### Retiring v1

The v1 recipe surface is deleted, not renamed — `business/scope` already names rigid weekly plan
generation as deliberately replaced, so this removes something that is out of V2 rather than
parking it:

- `packages/services/src/db/models/recipe.ts` is rewritten as the V2 library model; `Ingredient`
  goes with the old one.
- `packages/services/src/db/models/meal.ts` (`Meal`, `MealSlot`, `MealStatus`) is deleted — the
  meals screen is its only consumer, and `Meal.recipeId` points at a model that no longer exists in
  that shape.
- `apps/web`'s `/meals` route, `lib/fixtures/meals.ts` and `lib/queries/meals.ts` are deleted, with
  the meals nav entry, its `meals` icon in `components/shell/nav-icons.ts`, and the `meals` content
  block in `lib/content/{types,en,fr}.ts`.
- The `@remi/services/shared` re-exports follow.

`apps/web`'s other fixture surfaces (`plan`, `steps`, `today`) are untouched — they are not this
stub's to judge. `apps/demo` keeps its own local `Recipe` mock type: the demo sandbox is mock-only
by its `AGENTS.md` and shares no vocabulary with the packages.

Nothing patient-facing is added: `/p/[token]` renders exactly as it does today.

## Acceptance criteria

- [ ] `recipes` exists in `packages/services/src/db/schema.ts` with `title`, `body`, a `tags` text
      array, `archived_at` and the shared timestamps, and no patient foreign key; a checked-in
      migration generated by `pnpm db:generate` applies it to a database holding existing rows
      without manual intervention.
- [ ] `patient_recipe_assignments` exists with `patient_id` (cascade), `recipe_id` (restrict),
      `note`, `assigned_on`, `archived_at` and the shared timestamps, in the same migration.
- [ ] A V2 `Recipe` model and a `RecipeAssignment` model exist in `packages/services/src/db/models/`,
      are re-exported through the models index and the `@remi/services/shared` type surface, and both
      collection names are registered in the `neon.ts` table registry.
- [ ] The recipes service is exported from `@remi/services/server` and covers: list active, list
      archived, list tags in use, get, create, update, archive, restore, count assignments — each
      returning the existing `Result` shape and rejecting an unknown id as `not_found`. No delete
      function exists.
- [ ] The recipe-assignments service is exported from `@remi/services/server` and covers: list active
      for a patient, list archived for a patient, assign, update note and date, archive, restore,
      delete — each returning the existing `Result` shape, rejecting an unknown patient or recipe id
      as `not_found`.
- [ ] Assigning a recipe a patient already actively holds returns `conflict`; assigning it again
      after that assignment is archived succeeds and creates a second dated row.
- [ ] `title` is required and rejected when empty or over 140 characters; `body` is required and
      rejected over 4000 characters; `tags` are trimmed, lowercased and de-duplicated on write and
      rejected above 6 tags or 32 characters per tag; an assignment `note` is optional, defaults to
      `""` and is rejected over 500 characters. No `minutes`, `servings`, `ingredients`, `method` or
      `honours` field exists anywhere in the tables, the models or the forms.
- [ ] Archiving a library recipe removes it from the active library and from the assignment picker
      without deleting the row or touching existing assignments; restoring returns it to both.
- [ ] The console has a « Recettes » nav entry in the "Suivi" section beside Patients, and
      `/recipes` lists the active library with a tag filter built from the tags in use, a title
      search, a create form, and an archived section with restore — French labels, usable at phone
      width.
- [ ] `/recipes/[id]` edits title, body and tags, archives and restores, and states how many patients
      currently hold the recipe.
- [ ] `/patients/[id]` shows a recipes card after the pantry-essentials card with the patient's active
      assignments (title, body, note, date), inline edit of note and date, archive, an assign-from-
      library picker listing only active recipes, and a past-assignments section with restore.
- [ ] Each write records its audit entry through `apps/admin/lib/audit.ts`; the nine `recipe.*`
      actions are in `auditActions` and carry French labels and an intent in the console's audit
      vocabulary.
- [ ] Service tests exercise both surfaces against the in-memory client: tag normalisation and
      rejection, tag filtering, archive/restore round trips on both tables, the active-duplicate
      `conflict`, re-assignment after archive, assignment ordering by date, and that deleting an
      assignment removes only its own row.
- [ ] The v1 vocabulary is gone: no `Ingredient`, `Meal`, `MealSlot` or `MealStatus` is exported from
      `@remi/services`, and `apps/web` has no `/meals` route, meals fixtures, meals queries, meals nav
      entry or `meals` content block in either locale. The remaining `apps/web` routes render
      unchanged.
- [ ] `/p/[token]` renders exactly as it does today — no recipe appears on the patient link, and no
      route, token or visibility behaviour changes.

## Out of scope

- **Rendering recipes on the patient link.** § J's "recettes inspiration" segment is the
  `patient-link-segments` stub, which renders these tables once they exist. Nothing patient-facing
  changes in this run.
- **"Duplicate to variant".** Editing a shared recipe edits it for everyone holding it; this run
  states the blast radius on the editor and stops there. Whether Morgane wants a per-patient variant
  is hers to answer — raised below, and it would arrive as a copy action, not a schema change.
- **A week entity or week labels.** Assignments carry a date; grouping them into named weeks is a
  second table and is not built until she asks for one.
- **A fixed tag taxonomy.** No `season` or `régime` enum, no tag admin, no rename or merge tooling.
  Tags are free text with a filter over what exists.
- **Deleting library recipes.** Archive only, enforced by the `on delete restrict` from assignments.
- **Any AI drafting of recipes or notes.** Morgane writes every word; these are the tables the AI
  round later writes into.
- **Photos or attachments on a recipe.** Blob storage is an unchosen vendor and an owner decision —
  the same gate that keeps the meal journal text-only (decision #6).
- **Bulk assignment across patients**, templates, or "assign this recipe to everyone". Each
  assignment is written for one patient with its own note.
- **The rest of `apps/web`'s v1 fixture surfaces** (`plan`, `steps`, `today`) and `apps/demo`'s mock
  recipes. Only the surface built on the shared `Recipe`/`Meal` types is retired here.
- **The meal journal and the multi-page link** — stubs 3 and 4 of this epic.

## Open questions

All three are Morgane's to answer, not this run's. None blocks an acceptance criterion, and nothing
built here assumes an answer.

- **Shared edits, or "duplicate to variant" from day one?** Editing a recipe changes it for every
  patient holding it — right for fixing a typo, wrong for personalising a variant. This run ships
  shared edits with the holder count shown on the editor so the consequence is visible. A duplicate
  action is additive if she wants one.
- **Does she want weeks marked, or is the assignment date enough?** This run stores a date per
  assignment and nothing more. Week labels would be a grouping over the same rows; a week entity
  would be a second table. Neither is built without her asking.
- **Which tags, if any?** The field is free text with a filter over what she actually uses, so the
  answer can be observed rather than guessed. If a stable set emerges, promoting it to a closed
  vocabulary is an additive change; if she uses none, the filter is empty and nothing was invented.

One decision was taken here rather than deferred, because it changes what gets built: the legacy v1
`Recipe`/`Ingredient` model and the `apps/web` `/meals` surface built on it are **retired outright**
(Jamie, 2026-09-02) rather than renamed or relocated — `business/scope` already lists the rigid
weekly plan as deliberately replaced, so the v1 vocabulary is deleted with the screen it fed.
