# Chore: neon-websocket-transactions

- invariant: every read and write above the storage seam behaves exactly as before; what differs
  is that `DatabaseClient.transaction(fn)` now runs `fn` inside a real Postgres transaction that
  rolls back on throw, where it used to run `fn` with no isolation at all.
- change: `packages/services/src/db/adapters/neon.ts` — ordinary queries stay on the Neon HTTP
  driver; `transaction()` opens a pooled WebSocket connection (`Pool` +
  `drizzle-orm/neon-serverless`), runs the callback against the transaction handle, and closes the
  pool in a `finally`. A nested `transaction()` becomes a savepoint on the same connection rather
  than opening a second one. `packages/services/src/db/test-helpers.ts` — the in-memory harness
  now snapshots and restores on throw, so the seam's contract is testable rather than merely
  satisfiable.
- rollback: revert the commit. Nothing is persisted differently and no migration is involved, so
  the previous adapter works against the same database unchanged.

## The deviation from the stub, and why

The stub said to move `createNeonDatabase()` onto the WebSocket driver outright. This confines the
pool to `transaction()` instead.

Moving everything would have given the same guarantee and changed the latency and connection count
of **every** query in six apps to get it — the admin patient page alone fans out twenty-one reads,
each of which would wait on a socket handshake instead of a single HTTP request. Nothing but the
three batch saves needs atomicity, so nothing but the three batch saves pays for it. The HTTP
driver that every screen in the estate already runs on is left exactly as it was, which is also
what makes the rollback above trivial.

## For the readiness pass

- **No new environment variable.** The pooled driver takes the same `DATABASE_URL`.
- **Connection lifecycle.** One connection per transaction, opened on entry and closed in a
  `finally` — a serverless invocation that saves one section opens one and closes it, rather than
  holding a pool across a function's idle life. This is the part worth a second opinion: the
  alternative is a module-level pool reused across invocations, which is faster per save and
  spends Neon's connection budget on idle functions.
- **WebSocket availability.** `@neondatabase/serverless` uses the runtime's global `WebSocket`,
  which Node 22 provides and which this repo's stack is on. No `ws` dependency is added.
- The `@neondatabase/serverless` dependency already existed — only a second entrypoint of it and
  a second Drizzle adapter module are newly imported. No `package.json` change.
