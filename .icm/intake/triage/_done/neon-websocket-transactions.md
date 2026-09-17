# neon-websocket-transactions

- epic: triage
- lane: chore
- status: active
- created: 2026-09-17
- size: M
- depends-on: none
- blocks: practitioner-workflow/bulk-entry

## Problem

`packages/services/src/db/adapters/neon.ts` builds the client on the **HTTP** driver, and its
`transaction()` is a pass-through:

```ts
/**
 * The HTTP driver has no interactive transactions, so `fn` runs without
 * isolation. Nothing in the phase-1 slice writes across tables in one unit;
 * the first service that does must move this adapter to the WebSocket
 * driver (REMI-013 is the place that decision lands).
 */
transaction: async (fn) => fn(client),
```

That comment names its own expiry, and `practitioner-workflow/bulk-entry` is the caller that
reaches it: a whole-section save applies updates, inserts, archives and a reorder as one unit, and
a half-applied protocol is a clinical record that says something Morgane did not write. The
storage seam (`DatabaseClient.transaction`) already has the right shape — only the Neon adapter
behind it is honest about not honouring it.

Cut at Define of `bulk-entry` (2026-09-17), on the owner's call: the adapter move is a change to
every app's database access and does not belong inside a UI run.

## What this is

Move `createNeonDatabase()` from `neon()` (HTTP fetch per statement) to the WebSocket driver's
`Pool`, so `transaction()` opens a real interactive transaction and rolls back on throw. Nothing
above the seam changes — `db/services/**` already calls `getDatabase()`, and the six apps register
the adapter unchanged through their `ensureDatabase()` helpers.

## Worth knowing

- **Every app is a caller.** `apps/web/lib/database.ts` and each app's registration path all
  resolve the same adapter; a pooled connection behaves differently from per-statement HTTP under
  serverless cold starts and concurrency, so the pool's lifecycle (and `close()`, which is a no-op
  today) is the part to get right.
- `packages/services/src/db/test-helpers.ts` has the same pass-through `transaction` — decide
  whether the in-memory harness should model rollback, or stay honest about not doing so.
- `.icm/docs/ENV.md` is the catalogue if the move needs a connection-string or pooling variable.
- Drizzle's `drizzle(pool)` vs `drizzle(neon(...))` changes the client type the collection helper
  is built over (`makeCollection`) — check it compiles against both query builders before assuming
  it is a one-line swap.

## Acceptance

- [ ] `DatabaseClient.transaction(fn)` on the Neon adapter runs `fn` inside a real transaction: a
      throw inside `fn` leaves none of its writes committed.
- [ ] Every app still boots and reads/writes patient data unchanged — no caller above the seam is
      edited to accommodate the driver.
- [ ] The adapter comment naming the HTTP driver's limitation is gone, replaced by what the
      WebSocket driver actually guarantees.
- [ ] The pool's connection lifecycle is deliberate and written down in the adapter — including
      what `close()` now does.

## Prompt

Run `/pipeline chore "move the Neon adapter from the HTTP driver to the WebSocket driver so
DatabaseClient.transaction() is a real transaction"` in the remi-ai repo, working from
`.icm/intake/triage/neon-websocket-transactions.md`. The seam does not change — only
`packages/services/src/db/adapters/neon.ts` and whatever its pool lifecycle needs. Confirm every
app still registers and queries unchanged before pushing.
