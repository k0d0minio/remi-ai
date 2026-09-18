# Build notes: reuse-and-duplicate

- commits: see the branch — one per layer (table · shared rule · service · actions · surfaces)
- ci: GREEN on the full gate — settled on `f0d13b6`, after the orphaned-table repair below
- preview: https://admin-git-claude-funny-pascal-toua7k-remi21.vercel.app

## What changed

- `packages/services/src/shared/protocol-reuse.ts` (new): the two pure rules the whole feature
  rests on — the per-field carries/blanks table, and the tolerant reader. Isomorphic because both
  paths need it: the copy picker blanks on the **server**, so another patient's wording never
  reaches the browser at all, and « Enregistrer comme modèle » blanks in the **browser**, into the
  preview she adapts. Exported from `/shared`.
- `packages/services/src/db/schema.ts` + `migrations/0018_rapid_lizard.sql`: one new table,
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

## The admin preview failed once, and why it is worth reading

The first full-gate run went red on `Vercel – admin`, at `applying migrations…`, before
`next build` ran. Not a code failure, and not a flake:

`ALLOW_NON_PRODUCTION_MIGRATIONS=true` is set preview-only on the admin project, so **every admin
preview build migrates the shared production database**. This branch's first preview therefore
applied its original `0017`, creating `protocol_templates` in the live database. `main` then landed
its own `0017`, so this branch regenerated its migration as `0018` — correct, and what
CONVENTIONS.md § "Regenerate a migration, never renumber it" requires. But `0018` carries the same
`CREATE TABLE`, and it collided with the table its own **withdrawn** predecessor had already
created.

The owner dropped the orphaned table, which puts the database back in the state the journal
describes; `0018` then applies as generated. Nothing in the diff changed as a result.

Two things to carry forward. `.icm/docs/ENV.md` still calls that variable "unset everywhere", which
is what made the trap invisible — parked as
[`triage/env-preview-migrations-row-is-stale`](../../../../intake/triage/env-preview-migrations-row-is-stale.md).
And the same thing will happen to any other in-flight branch that regenerates a migration after its
preview has already applied the original — **PR #110 is in exactly that position**, still numbered
`0017`.

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

## Release

- gate: Ready to merge ticked — merge authorised
- ci: GREEN on `8d2d4b0` (the last code-bearing head); re-settled with `ci-status.sh` after the
  close-out push, which is the verdict that authorised the merge
- reviews: code high (5 findings, all fixed on the branch) · security run — no findings at or above
  the confidence threshold · readiness run by hand — no `/production-readiness` skill exists in this
  session, so its three checks were done directly: no new env var in the diff (no `process.env`,
  `env()` or `requireEnv()` added, so no ENV.md / `turbo.json` / Vercel edit is owed), the migration
  is additive and carries no `down` (up-only is the repo-wide convention, 0000–0018), and the
  migration agrees with `schema.ts` because drizzle generated it from it
- parked: `env-preview-migrations-row-is-stale` · `protocol-template-name-unique-index`
- docs: `business/roles` § Operator — the reuse paths, the factual/personal rule and the audit
  event · announce: public (`changelog/2026-09-18-reuse-and-duplicate`)

### What the code review changed, and why it was fixed here rather than parked

Five findings, all in this ticket's own code and all small, so all five were fixed on the branch
rather than parked. The one worth a second look: the copy matched her ticks by **position** in the
source list, so a row archived between the picker's read and her confirm would shift the match onto
its neighbour and copy rows she never selected. It now matches the source row's own id, which
either resolves or drops out. The other four: Enter in a reuse input implicitly submitted the
section's form (`type="button"` does not cover implicit submission); the overwrite confirmation
derived from a template list that might not have loaded, so a failed load would replace a set
silently; the template save bypassed its pending state and could insert twice; and the picker's
empty state reported a filter that matched nothing as an empty roster.

### A correction to this file's own Notes for Release

The note above saying `business/initiatives` still reads "the practitioner space is parked" is
**stale** — the page was already corrected before this run, and now opens its second consequence
with "The practitioner space is the admin console, reorganised". Nothing was owed there, and
nothing was changed.

Context budget: within the Inputs table, plus `apps/docs/app/changelog/` (an existing entry, the
`_meta.ts` and the index) to match the announcement's shape.
