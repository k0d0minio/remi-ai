# Chore: neon-websocket-driver-transactions

- invariant: behaviour unchanged for every persona — no screen, gesture or query
  changes. What differs is that `transaction()`'s atomicity is now proven by a
  test, and two prose homes (the storage seam's `close()` doc, `.icm/docs/ENV.md`
  § Storage) describe the driver the repo actually runs.
- change: `packages/services/src/db/services/recipe-assignments/index.test.ts`:
  a failure-injection harness on `insert` (the same shape
  `patient-recommendations` already uses on `update`) and one test —
  `createAndAssignRecipe` fails between its two writes and leaves neither the
  library row nor the assignment behind.
- change: `packages/services/src/db/client.ts`: `close()` on the seam gains a doc
  comment — what it is for, and that it is not a per-request call.
- change: `.icm/docs/ENV.md` § Storage: corrected from "serverless HTTP driver"
  to the WebSocket driver the adapter has used since #99, with a paragraph
  stating plainly that the pooled driver needs no variable of its own.
- rollback: `git revert` the squash commit. Nothing is migrated, no dependency
  moves, no runtime code changes — the revert costs only the test and the prose.

## What the stub asked for, and what was already true

The stub (`.icm/intake/triage/neon-websocket-driver-transactions.md`) was parked
on 2026-09-17 by the `recipe-in-place` run. Four of its six acceptance criteria
had already landed that same day in **#99** (`consultation-update`), which moved
the adapter to the WebSocket driver as part of its own work:

| Acceptance criterion                                     | State on `main` before this PR                      |
| -------------------------------------------------------- | --------------------------------------------------- |
| `createNeonDatabase()` runs a real Postgres transaction   | done in #99 — `Pool` + `drizzle-orm/neon-serverless` |
| `createMemoryDatabase()` snapshot-and-restore             | done in #99 — `src/db/test-helpers.ts`               |
| A service test proves rollback after the first insert     | **not done** — this PR                               |
| Connection lifecycle settled for Vercel and written down  | pool size and per-graph done in #99 (the decisions page); `close()` was the gap — this PR |
| The `REMI-013` comment in `neon.ts` is gone               | done in #99                                          |
| `.icm/docs/ENV.md` covers what the pooled driver needs    | **not done** — this PR                               |

The existing "writes neither half" tests in the same file only exercise
validation refusals, which land *before* anything is written — so they would
pass just as well against the pass-through `transaction()` the seam used to
have. That is what the new test closes.

**The test is not vacuous.** Neutering `createMemoryDatabase()`'s rollback to a
pass-through makes it, and only it, fail: `expected 10 to be 9` — the orphaned
library row the stub describes, which nothing deletes because the library has no
delete by design. The other 23 tests in the file pass either way.

`pnpm --filter @remi/services test` (vitest, the suite `quality.yaml` runs): 28
files, 352 tests, all passing.

## Raised, not answered in code

- **The `Vercel – admin` preview still migrates the shared database.** Unchanged
  by this PR and already parked as
  `.icm/intake/triage/previews-migrate-the-shared-database.md`; noted here only
  because this run read the ENV section that describes it.
- **`close()` is never called.** The seam now says so, and says what it is for.
  Whether the package should offer it at all is a design question, not a chore's
  to settle.
