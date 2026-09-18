# neon-websocket-driver-transactions

- epic: triage
- lane: chore
- status: active
- created: 2026-09-17
- size: M
- depends-on: none

## Problem

The storage seam declares `transaction<T>(fn: (tx: DatabaseClient) => Promise<T>)`
(`packages/services/src/db/client.ts`), but **neither adapter implements it**. Both the Neon
adapter and the in-memory test client are pass-throughs — `transaction: async (fn) => fn(client)` —
so a call site that looks atomic is not. The Neon adapter says so in a comment
(`src/db/adapters/neon.ts`), and names the condition that would reopen it:

> The HTTP driver has no interactive transactions, so `fn` runs without isolation. Nothing in the
> phase-1 slice writes across tables in one unit; the first service that does must move this
> adapter to the WebSocket driver (REMI-013 is the place that decision lands).

`recipe-in-place` (PR #95) is that first service. Its three gestures each write `recipes` and
`patient_recipe_assignments` in one unit, and they are written through `transaction()` with the
client threaded into every write — so the call sites are already correct and this change is
adapter-only. What is missing is the isolation underneath: a failure between the two inserts today
leaves an orphaned library row, which nothing deletes because the library has no delete by design.

REMI-013 no longer exists — it was a ticket in the retired numbered scheme — so the decision never
landed anywhere. This stub is its home.

The owner chose to park it rather than ride it on a feature PR (2026-09-17): the driver sits under
every query in `admin` and `web`, and it deserves its own PR, preview and review.

## Worth knowing

- **No new dependency.** `@neondatabase/serverless` (^1.1.0) already ships `Pool`, and
  `drizzle-orm` (^0.45.2) already ships `drizzle-orm/neon-serverless`. The change is an import and
  a client construction inside `createNeonDatabase()`, not a package addition.
- **The blast radius is the pool, not the queries.** Drizzle's query builder is identical across
  the two drivers, so `makeCollection` is untouched. What changes is connection lifecycle:
  WebSocket pooling on Vercel functions means connection limits, cold-start cost, and a `close()`
  that actually has something to close (it is currently a no-op).
- **The test client needs the same treatment** or the tests keep proving nothing about rollback.
  `createMemoryDatabase()` should snapshot its stores on entry and restore them when `fn` throws —
  a few lines, and it is what makes an atomicity test meaningful rather than vacuous.
- Services already thread the client correctly: `recipes/` and `recipe-assignments/` take
  `db?: DatabaseClient` on every function a gesture calls. Nothing above the seam changes.

## Acceptance

- [ ] `createNeonDatabase()` runs `transaction(fn)` inside a real Postgres transaction; a throw
      inside `fn` rolls back every write made through the `tx` client it was given.
- [ ] `createMemoryDatabase()` does the same in memory, so the service tests can assert rollback.
- [ ] A service test proves it: a gesture that fails after its first insert leaves neither row
      behind. `recipe-in-place`'s `createAndAssignRecipe` is the natural subject.
- [ ] Connection lifecycle is settled for Vercel's runtime and written down — pool size, whether a
      pool is per-request or per-process, and what `close()` now does.
- [ ] The comment in `neon.ts` naming REMI-013 is gone, replaced by what was actually decided.
- [ ] `.icm/docs/ENV.md` gains any variable the pooled driver needs, or states plainly that it
      needs none.
