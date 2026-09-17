# Release: recipe-in-place

- gate: Ready to merge ticked — merge authorised
- ci: GREEN on <merge-head sha> (ci-status.sh, after the last push)
- pr: #95 — https://github.com/k0d0minio/remi-ai/pull/95 · merged: <yes — when>
- code-review: high (spec complexity: complex) — 4 findings, all in this run's own code, all fixed
  on the branch: the bulk selection not clearing after a save, a variant title pre-filled by a
  naive concat instead of the shared rule, a batch order left to the adapter, and a `pending` flag
  that could stick on a throw. None was stop-class.
- production-readiness: run (the diff adds a migration and touches `db/`). No new environment
  variable, so `.icm/docs/ENV.md`, `env.ts` and `turbo.json` are untouched by design; no new
  service adapter; every new server action re-asserts `requireOperator()`. The migration adds a
  nullable column plus a self-FK — safe against existing rows, and old code ignores the column, so
  the admin build's `db:migrate` can run ahead of the deploy. **No `down` migration**: this repo
  has none for any of its thirteen migrations, so that is the standing convention rather than a
  regression introduced here.
- security-review: run (the diff touches patient PII through server actions). No findings. All four
  new actions guard with `requireOperator()`; every input is validated by zod in the service layer;
  no new route, no `app/api/` change; the audit label carries the patient's pseudonym, which is the
  non-identifying handle the console already uses for `patient.created`.
- parked: neon-websocket-driver-transactions.md
- technical docs: no technical docs impact — no page enumerates tables or migrations, and the
  entrypoint catalogue in `technical/packages` is unchanged by adding one shared symbol.
- business docs: `business/initiatives` — the "practitioner space is parked" bullet was false as of
  the 2026-09-10 decisions and this change is what makes it plainly so; replaced with what was
  actually decided. `business/scope`'s recipe lines are the patient-facing V2 features and are
  untouched by this practitioner-side change.
- release notes: both
- sent: <none | ship note sent 2026-09-17>
- closed out: <RESULT — filled by close-out.sh>

## Acceptance check (vs spec)

- [x] « Proposer une recette » opens a create form in place, empty library included.
- [x] Saving it writes the library row and the assignment in one submit.
- [x] No tags field on the in-place form.
- [x] « Dupliquer en variante » opens the recipe pre-filled and editable — and after review, the
      pre-fill uses the same `variantTitle` rule the service enforces, so it never offers a title
      the save would refuse.
- [x] Saving the duplicate creates the row, assigns it, and archives that patient's assignment of
      the original.
- [x] Other holders are unaffected — pinned by a test.
- [x] `/recipes/[id]` duplicates without assigning.
- [x] The variant records its origin; both surfaces show « variante de … », linking to it.
- [x] The origin's holder count counts its own row only.
- [x] The assign form takes several recipes with one note and one date, one row per recipe.
- [x] A recipe already held is refused by name, and none of the batch is written.
- [ ] **One transaction per gesture — not met.** Every gesture runs through
      `getDatabase().transaction()` with the client threaded into each write, which is the correct
      call site under either driver, but both adapters implement `transaction` as
      `async (fn) => fn(client)`: the Neon HTTP driver has no interactive transactions. What holds
      is that both halves are validated before anything is written, so an invalid title or date
      writes neither (tested). What does not hold is rollback from a mid-flight database failure.
      Owner decision of 2026-09-17 was to park the driver move rather than ride a product-wide
      driver change on a feature PR; the owner then ticked **Ready to merge** with this box
      visibly unticked. Stub: `.icm/intake/triage/neon-websocket-driver-transactions.md`.
- [x] One audit event per gesture, naming the recipe and the patient, under a new `auditActions`
      entry.
- [x] The migration adds the nullable self-reference; pre-existing rows read as having no origin.
- [ ] **Services tests cover the three gestures, the already-held refusal and the variant link —
      but not "the rollback on failure" this criterion also names.** Same cause as above: with a
      pass-through `transaction` on both adapters, a rollback test passes without proving
      anything, so it was not written rather than written to mislead. It is in the triage stub's
      acceptance list. 221 tests pass across 20 files.

## Note on the two unmet criteria

Release's step 1 says an acceptance criterion Build flagged unmet sends the run back to Build. That
rule exists to stop known-broken work shipping. These two are not that: they are one owner-decided
deferral, recorded in the build notes before the gate was read, carried as unticked boxes in the PR
body, and ticked **Ready to merge** anyway. Proceeding is the owner's call being honoured, not a
gate being crossed — but it is recorded here rather than smoothed over, because the feature is
complete and the durability guarantee behind it is not yet what the spec asked for.
