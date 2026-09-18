# Build notes: bulk-entry

- commits: `a16717f` implementation · `7985c12` + `0ddf128` + `02b6e7f` formatting ·
  `f36809f` lint · `c154355` types
- ci: GREEN on `c154355` (ci-status.sh); re-established after this file was pushed

## What changed

- `packages/services/src/db/services/section-save.ts` (new): the diff behind all three saves.
  `planSectionSave` takes what is in force plus the submitted rows pre-grouped by whatever owns
  `position`, and returns inserts, updates and archives without touching the database — so a bad
  row is refused before the first write and the counts are known before anything is applied. A
  submitted row whose id is no longer in force is planned as an insert, which is the last-write-wins
  policy the spec accepts, written down rather than implied.
- `patient-recommendations`, `patient-supplements`, `pantry-essentials`: one `save…` function each.
  Recommendations group by category, because rank is per category there; the other two are one flat
  run. Each applies archives, then updates, then inserts inside `getDatabase().transaction()`, and
  short-circuits when the section comes back unchanged.
- `apps/admin/lib/patients/actions.ts`: three batch actions. Rows arrive as ordinary form data —
  one input per field per row, including an empty `row-id` for a new row, so `getAll` returns each
  column in DOM order and the columns line up index for index. One audit event per save, carrying
  the counts; `*.batch_saved` added to the audit vocabulary and to the console's label map.
- `apps/admin/components/patients/`: `use-section-rows.ts` (local row state), `section-edit-frame`
  (the chrome and the single form), `section-row-controls` (move/remove), and one component per
  section. The read views (`RecommendationGroups`, `SupplementProtocol`, `PantryList`) are unchanged
  and are passed in as children, so they stay server-rendered.
- The single-row add/update/move/archive actions and their forms are untouched.

## Acceptance criteria status

- [x] Whole-section edit mode, entered from the section, left by saving or cancelling — cancel
      changes no stored row, and reopening re-seeds from the rows in force.
- [x] Add, remove and reorder locally, with no server call until the save.
- [x] One save applies a mixed edit — covered by a test per service asserting exactly that
      (two changed, one added, one removed, order altered, in a single call).
- [x] **One transaction — met, after two corrections.** The adapter arrived on `main` from
      PR #99 (see the spec's Dependency section), so `getDatabase().transaction()` now opens a
      real `BEGIN` / `COMMIT` / `ROLLBACK`. That exposed a second, real defect in this run: the
      three batch saves called `getDatabase()` _inside_ the transaction callback, which hands
      back the pool-bound client — so every write would have landed **outside** the unit while
      looking atomic. The adapter's own comment names that exact trap. Fixed by threading the
      `tx` client through, the pattern `recipe-assignments` established: the collection accessor
      now takes a `DatabaseClient`, and the batch save passes `tx` to every write and to
      `touchPatient`. Proven by a test that fails a write part-way and asserts the section is
      byte-identical afterwards.
- [x] One audit event per save, naming operator, patient and counts — not one per row.
- [x] Recommendations edit mode is one block per category, each with its own add-row, and offers
      no `supplement` category for new rows.
- [x] A row stored under `supplement` still renders, still saves, is not re-categorised — its
      block appears whenever such rows exist, and a service test covers the save.
- [x] Every prescribed supplement row on screen at once; nom and dose on the row, moment and
      raison behind that row's fold.
- [x] Pasting lines into the essentials section produces one row per non-empty line before any
      save — the rows land in local state, editable and removable first.
- [x] Optional fields folded closed by default, open per row. A closed `<details>` hides its
      inputs, it does not remove them from the form, so they still submit.
- [x] Removing a row archives it — `planSectionSave` returns archives, never deletes.
- [x] The single-row actions still exist and work unchanged.
- [x] Each edit mode is one `<form>` with one submit and the rows ride in it as form fields.
- [x] Each batch action re-asserts `requireOperator()`; every row is validated through the service
      before the first write, and a bad row refuses the whole save naming its index.

## Notes for Release

- **The tx-threading fix is the thing to look at closely.** A batch save that reaches for
  `getDatabase()` inside its own transaction writes outside it, silently. All three services are
  fixed and one is covered by an injected-failure test; a reviewer should confirm the other two
  read the same way. The duplicate triage stub this session cut for the adapter has been removed
  from this branch — `main`'s `neon-websocket-driver-transactions` is the real one.
- **`main`'s `neon-websocket-driver-transactions` stub is still active though the work shipped**
  in PR #99. Bookkeeping drift on `main`, not this run's to fix, but worth retiring.
- **Concurrency is last-write-wins**, as the stub allows for the beta: two operators editing the
  same section race, the later save wins, and the audit event names who did it and what changed.
  No locking, no conflict detection.
- **No-JS degradation is partial and deliberate.** Edit mode needs hydration — the toggle is a
  client button. Without JS the read view and the single-row add forms still work, which is the
  console's existing no-JS path. What the criterion asks for is that the rows submit as form data
  rather than a client-built payload, and they do.
- `section-save.ts` sits as a loose file under `db/services/`, where every sibling is a folder per
  entity. It is not an entity — it is the shared write algorithm — so no folder was invented for
  it. Worth a reviewer's opinion; moving it to `db/section-save.ts` beside `client.ts` is the
  alternative.
- **Husky could not run in this session** until `pnpm install` was run mid-build: `node_modules`
  was absent, so lint-staged never formatted anything and three CI rounds went on formatting that
  the pre-commit hook exists to prevent. Worth knowing for the next remote session on this repo.
- Smoke test on the admin preview, signed in, on one patient with a few rows already encoded:
  open each of the three sections, add a row, edit one, remove one, move one, save; check the read
  view and the journal (one row per save, not one per line); reopen and confirm the order held.
  For essentials, paste several lines and confirm one row per line before saving. For
  recommendations, use a patient with an old `supplement`-category row if you have one.
