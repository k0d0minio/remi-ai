# Build notes: reuse-and-duplicate

- commits: see the branch — one per layer (table · shared rule · service · actions · surfaces)
- ci: pending the push; read back with `ci-status.sh reuse-and-duplicate`

## What changed

- `packages/services/src/shared/protocol-reuse.ts` (new): the two pure rules the whole feature
  rests on — the per-field carries/blanks table, and the tolerant reader. Isomorphic because both
  paths need it: the copy picker blanks on the **server**, so another patient's wording never
  reaches the browser at all, and « Enregistrer comme modèle » blanks in the **browser**, into the
  preview she adapts. Exported from `/shared`.
- `packages/services/src/db/schema.ts` + `migrations/0017_*.sql`: one new table,
  `protocol_templates` (operator_id, kind, name, rows jsonb, shared, timestamps). The generated
  migration touches nothing else, which is criterion 9's second half.
- `packages/services/src/db/models/protocol-template.ts` (new): `rows` is typed `unknown` on the
  stored shape on purpose — the column is a blob an older row shape may have written, so claiming
  it already matches would let a caller skip the tolerant reader and be wrong. `ProtocolTemplateView`
  is what callers above the service see, with `owned` resolved against the operator asking.
- `packages/services/src/db/services/protocol-templates/` (new): list (own + shared), save with
  overwrite-by-name, rename, delete, set-shared. Ownership is enforced here rather than at the four
  call sites — `not_permitted`, never a silent no-op.
- `packages/services/src/shared/audit.ts` + `apps/admin/components/audit/vocabulary.ts`: seven new
  actions with their French labels and intents. The copy and the share flag are `warning` for the
  same reason `context.exported` is: data moved somewhere it had not been.
- `apps/admin/lib/patients/reuse.ts` (new): the server actions. Separate from `actions.ts` because
  nothing here writes to a patient — copying and inserting fill an **unsaved** grid, and it is still
  the section's own batch action that writes. The audit event is the one exception, and fires at the
  copy rather than at the save (see below).
- `apps/admin/components/patients/copy-from-patient.tsx`, `template-controls.tsx` (new), wired into
  `recommendation-section`, `supplement-section`, `pantry-section` and `assign-recipe-form`.

## Two things worth a reviewer's eye

**The copy audit event fires at the copy, not at the section's save.** Spec's criterion 11, and the
reason is that she can abandon an unsaved grid: the data crossed records at the copy, and waiting
for a save that may never come would leave that with no trace at all. The count on the event is
re-derived server-side from the source's own rows rather than taken from what the browser posted.

**The reuse controls render inside the section's `<form>`.** So every control is `type="button"`
and nothing in them carries a `name` — a named input would ride along with the section's own rows
on save, and a stray submit would save the section mid-pick. Each write builds its own `FormData`.

## Acceptance criteria status

- [x] « Reprendre de … » in each of the three protocol sections — `CopyFromPatient` in all three edit modes; `listCopySourcesAction` returns pseudonym + last consultation (`patient_notes.occurredAt`), filtered by typing, most recently seen first
- [x] Choosing a patient lists their active rows with checkboxes, appended unsaved — `readCopyRowsAction` then `addRows`; cancelling the section writes nothing to either patient
- [x] Factual fields carry, personal ones arrive blank; archived never offered — `blankPersonalFields` per the spec's table, and the services' `list*` already exclude archived rows
- [x] Assigned recipes join the picker — `kind="recipe"` in `assign-recipe-form`; the chosen recipes tick in the assign selection, which *is* that section's unsaved grid, with a blank note and today's date. Recipes archived from the library are filtered out, since the form has no checkbox for them
- [x] « Enregistrer comme modèle » opens an editable preview with the personal fields blanked, saves under a name, writes nothing to the patient
- [x] « Insérer un modèle » lists her templates of that kind and appends the rows unsaved
- [x] Rename and delete from the same list; a name already used asks to overwrite (a confirm checkbox, compared case- and accent-insensitively the way the service compares it) and replaces the rows
- [x] Private until shared; a shared set is listed for every operator; only the owner renames, overwrites, deletes or un-shares — enforced in the service and covered by its tests
- [x] One new `protocol_templates` table with a migration; no other table gains a column
- [x] A template missing a field the row shape has gained inserts it at its default, no migration, no error — `readProtocolRow`, tested both ways (missing field defaults, unknown field dropped)
- [x] The copy writes one audit event naming the source patient and the row count, at the copy
- [x] Save, rename, overwrite, delete and share each write one audit event
- [x] A patient's own page never offers that patient — `listCopySourcesAction` excludes the target

## Notes for Release

- **Tests were written, not run** — the contract's rule, and the harness is CI's. Two new files:
  `shared/protocol-reuse.test.ts` (the copy rule and the tolerant reader, written from criteria 3
  and 10) and `db/services/protocol-templates/index.test.ts` (overwrite-by-name, privacy, and the
  three owner-only mutations, written from criteria 7 and 8).
- **`packages:build` could not be run.** The block-local-checks hook rejects it despite the
  allowance documented in its own header, so the services package's declaration emit is unverified
  locally and CI is the first place it is exercised. Two things were fixed by reading rather than
  compiling: `ProtocolField` is exported, because it names the return of `protocolKindFields` and a
  private name in a public signature fails the dts emit; and two `as Record<string, string>` casts
  were dropped in favour of indexing `ProtocolRow` with its own `keyof`.
- `business/initiatives` still reads "the practitioner space is parked". The decisions of
  2026-09-10 (D-1, D-5) supersede that, as `recipe-in-place`'s spec already noted — the page is
  Release's to fix, not this run's.

Context budget: beyond the Inputs table — the four row-kind services and their components, which
`touches:` named and the diff edits; plus `db/test-helpers.ts` and one existing service test, read
to match the test shape.
