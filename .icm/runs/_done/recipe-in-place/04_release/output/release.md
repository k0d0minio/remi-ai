# Release: recipe-in-place

- gate: Ready to merge ticked — merge authorised
- ci: **not established on the merge head.** GREEN on 2b293a9 (the last head that built every
  affected app). On 5311350 the required `Format, lint, typecheck` never registered — zero
  Actions runs dispatched for that push after 900s, which `.icm/_shared/ci.md` calls a broken
  workflow, not a pass — so `ci-status.sh` returns PENDING.
- pr: #95 — https://github.com/k0d0minio/remi-ai/pull/95 · merged: **no — blocked, see below**
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
- parked: neon-websocket-driver-transactions.md · db-migrate-connection-retry.md ·
  previews-migrate-the-shared-database.md
- technical docs: no technical docs impact — no page enumerates tables or migrations, and the
  entrypoint catalogue in `technical/packages` is unchanged by adding one shared symbol.
- business docs: `business/initiatives` — the "practitioner space is parked" bullet was false as of
  the 2026-09-10 decisions and this change is what makes it plainly so; replaced with what was
  actually decided. `business/scope`'s recipe lines are the patient-facing V2 features and are
  untouched by this practitioner-side change.
- release notes: both
- sent: not sent — the ship note's links need the merge commit and the live changelog URL,
  neither of which exists yet.
- closed out: RESULT: CLOSED — run archived to `.icm/runs/_done/recipe-in-place/`. The
  practitioner-workflow epic keeps its five remaining stubs, so it was not archived.

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

## Merge with `main` (2026-09-17)

`main` moved four commits while this run was open — `copy-context` (#96), `link-writes` (#98) and
`consultation-update` (#99). Merged in and resolved:

- **A migration number collision.** `link-writes` also generated an `0013`. This run's migration
  was **regenerated** with `pnpm db:generate` rather than renumbered by hand, per
  `.icm/intake/triage/parallel-migrations-journal-ordering.md` — which names this PR — so its
  `when` (1789661806329) is later than everything already applied. The regenerated SQL is
  byte-identical to the original; only the number and the stamp changed. It is now
  `0014_numerous_norman_osborn`, and its snapshot carries `link-writes`' tables as well as this
  run's column.
- `apps/admin/lib/patients/actions.ts` — both sides added an import; kept both.
- `apps/docs/app/changelog/_meta.ts` — four entries dated 2026-09-17 now; kept all four.

252 tests pass on the merged tree, and the audit vocabulary covers all 73 actions.

## The admin preview, diagnosed properly

It failed twice, and my first reading of it was wrong. Recorded because the wrong reading is the
instructive part.

**First failure (`b2af5e1`)** was a genuine connection drop — `Error: Connection terminated
unexpectedly` out of the Neon websocket, with no SQL named. I called it transient and, on that
evidence, it was.

**Second failure (`1915c92`)** landed at the same step with no connection error at all, which
falsified "transient". The cause was this branch's own doing: the preview deploy of `2b293a9` had
already applied `variant_of_id` to the **shared** database under the migration's first number.
Merging `main` forced a regeneration to `0014` with a fresh `when`; drizzle decides by high-water
mark and never by hash, so it read as unapplied, re-ran `ADD COLUMN` against a column that already
existed, and failed with 42701 before `next build` ran.

Fixed the way `migrate.mjs` prescribes for exactly this: the migration is now idempotent —
`ADD COLUMN IF NOT EXISTS` plus a `duplicate_object` catch on the constraint. It no-ops where the
column landed early and applies in full to a database that has never seen it.

That repairs this PR. The thing underneath it is parked as
`previews-migrate-the-shared-database.md`: `migrate.mjs` carries a guard against previews migrating,
the admin project does not have it in force, and a preview that pollutes the database is the one
that goes green — the cost lands on someone else's build later.

## Why this run stopped short of the merge

Two infrastructure failures, neither of them this diff's, and both outside an agent's reach:

1. **The admin preview of `b2af5e1` failed** before `next build` ran — see below. That was the
   last head on which the admin app actually built, so the review fixes in `e0a1712` have never
   been compiled by Next. A `.icm`-only push cannot re-trigger it: turbo-ignore skips the app,
   and a skipped deploy is not a pass.
2. **GitHub Actions stopped dispatching.** The push of `5311350` produced zero workflow runs —
   not queued, not cancelled, absent — so the one required check never registered and the verdict
   is PENDING. Every earlier push on this branch dispatched normally.

The merge is the only remaining step. What it needs is one real admin build and one registered
quality run, both of which need a human: redeploy the admin preview from Vercel, and re-run the
Quality workflow (it carries `workflow_dispatch`). Then `/pipeline release recipe-in-place` picks
up from step 10 — re-establish green, re-read the gate, squash-merge.

Nothing was merged on an unestablished verdict, which is the rule this stage exists to hold.

## Note on the admin preview failure

The admin deploy of `b2af5e1` failed before `next build` ran: `pnpm db:migrate` lost its websocket
to Neon (`Error: Connection terminated unexpectedly`). Not this diff's — the identical migration
set had applied cleanly on `2b293a9` against the same database an hour earlier, the other five
previews passed, and no SQL statement is named in the failure. Parked as
`db-migrate-connection-retry.md`, which is a real gap: `migrate.mjs` retries nothing.

## Note on the two unmet criteria

Release's step 1 says an acceptance criterion Build flagged unmet sends the run back to Build. That
rule exists to stop known-broken work shipping. These two are not that: they are one owner-decided
deferral, recorded in the build notes before the gate was read, carried as unticked boxes in the PR
body, and ticked **Ready to merge** anyway. Proceeding is the owner's call being honoured, not a
gate being crossed — but it is recorded here rather than smoothed over, because the feature is
complete and the durability guarantee behind it is not yet what the spec asked for.
