# Build notes: recipe-in-place

- commits: see the branch — services layer, migration, admin surfaces, tests
- ci: established with `ci-status.sh recipe-in-place` after the last push (below)

## What changed

- `packages/services/src/db/models/recipe.ts` + `schema.ts` + `migrations/0013_recipe_variants.sql`:
  a nullable self-reference `variantOfId` on `recipes`, `on delete restrict` like the assignment's
  recipe FK. Set once, on duplicate, never afterwards — `updateRecipe` cannot reach it because it
  is not in `recipeFields`. Every pre-existing row reads as having no origin.
- `db/services/recipes/`: `duplicateRecipe(id, overrides?, db?)` — copies body and tags, suffixes
  the title (without stacking the suffix on a variant of a variant), records the origin, and takes
  the adapted title/body so an edited copy is **one** insert rather than an insert chased by an
  update.
- `db/services/recipe-assignments/`: the three gestures — `assignRecipes` (bulk, supersedes the
  singular `assignRecipe`), `createAndAssignRecipe`, `duplicateAndAssignRecipe`. Each runs its
  writes through the seam's `transaction()` with the returned client threaded into every write.
  `withRecipes` now joins the origin, so a card can say « variante de … ».
- Both services' collection helpers take `db: DatabaseClient = getDatabase()`. That is what lets a
  gesture keep every write inside the unit instead of reaching for the global.
- `shared/audit.ts` + `apps/admin/components/audit/vocabulary.ts`: three actions —
  `recipe.created_and_assigned`, `recipe.duplicated_as_variant`, `recipe.assigned_bulk` — with
  their French labels and tones. One event per gesture, naming the recipe and the patient.
- `apps/admin`: the patient page's « Recettes » section takes a checkbox multi-select (one note,
  one date, one submit) and a « Proposer une recette » in-place create form, offered even when the
  library is empty. Assignment cards gain « Dupliquer en variante » and the provenance line.
  `/recipes/[id]` gains both as well, and its "whether Morgane wants an escape hatch" comment is
  answered and deleted.

## Acceptance criteria status

- [x] « Proposer une recette » opens a create form in place, empty library included — the old
      "go and write one in « Recettes »" dead end is gone.
- [x] Saving it creates the library row and the assignment in one submit.
- [x] No tags field on the in-place form; the recipe is created untagged.
- [x] « Dupliquer en variante » on an assignment card opens the recipe pre-filled and editable.
- [x] Saving it creates the row, assigns it, and archives that patient's assignment of the original.
- [x] Other holders are unaffected — covered by a test asserting exactly that.
- [x] `/recipes/[id]` duplicates without assigning.
- [x] The variant records its origin and both surfaces show « variante de … », linking to it.
- [x] The origin's holder count counts its own row only — `countRecipeAssignments` filters by
      `recipeId`, so this holds by construction, and a test pins it.
- [x] The assign form takes several recipes with one note and one date, one row per recipe.
- [x] A recipe already held is refused **by name**, and none of the batch is written.
- [ ] **One transaction per gesture — the call sites are right, the isolation is not.** Every
      gesture runs through `getDatabase().transaction()` with the client threaded into each write,
      which is the correct code under either driver. But both adapters implement `transaction` as
      `async (fn) => fn(client)`: the Neon HTTP driver has no interactive transactions. What holds
      today is that **both halves are validated before anything is written**, so an invalid title
      or date writes neither half (tested). What does not hold is rollback from a mid-flight
      database failure. Owner's call on 2026-09-17 was to park the driver move rather than ride it
      on a feature PR — it is `.icm/intake/triage/neon-websocket-driver-transactions.md`, and
      nothing in these services changes when it lands.
- [x] One audit event per gesture, naming the recipe and the patient, under a new action in
      `auditActions`; the journal filter is keyed off the same list.
- [x] The migration adds the nullable self-reference; pre-existing rows read as having no origin.
- [x] Services tests cover the three gestures, the already-held refusal and the variant link.

## Notes for Release

- **The unticked criterion above is the one thing to read first.** It is a known, owner-decided
  deferral with a stub, not an oversight. I did not write a test asserting rollback: with a
  pass-through `transaction` on both adapters such a test passes vacuously while being false in
  production, which is worse than no test.
- `assignRecipe` (singular) was **deleted**, not left beside `assignRecipes` — leanness rule,
  superseding deletes the superseded. Its barrel line went with it and both test files were
  migrated to the bulk call.
- The migration, its snapshot and the journal entry were **hand-written** to match what
  `pnpm db:generate` emits: this session has no `node_modules`, and the factory owns the checks.
  Worth a glance at `meta/0013_snapshot.json` against the schema — that pairing is what keeps the
  next `db:generate` from producing a spurious diff.
- `business/initiatives` still reads "the practitioner space is parked", which decisions #1 and #5
  of 2026-09-10 supersede. The spec flagged it; it is Release's page to fix.
- Smoke-test list for the Ready-to-merge tick is the PR's "Steps to test", plus one that is easy to
  miss: duplicate a recipe **two patients hold** and confirm the second patient's card is untouched.
