import { randomUUID } from "node:crypto";
import type { Id } from "../types";
import type { Collection, DatabaseClient } from "./client";

/**
 * An in-memory `DatabaseClient` for the service tests — the seam is the whole
 * point of it: the services are exercised against the same interface the Neon
 * adapter satisfies, with no driver and no network. Imported by `*.test.ts`
 * files only; nothing in `dist` reaches it.
 */
export const createMemoryDatabase = (): DatabaseClient => {
  const stores = new Map<string, Map<Id, { id: Id }>>();

  const collection = <T extends { id: Id }>(name: string): Collection<T> => {
    const existing = stores.get(name) ?? new Map<Id, { id: Id }>();
    stores.set(name, existing);
    const store = existing as Map<Id, T>;

    return {
      findById: async (id) => store.get(id) ?? null,
      findMany: async (filter, page) => {
        const matches = [...store.values()].filter((row) =>
          Object.entries(filter).every(
            (entry) => (row as Record<string, unknown>)[entry[0]] === entry[1],
          ),
        );
        const limit = page?.limit ?? 50;
        return { items: matches.slice(0, limit), nextCursor: null };
      },
      insert: async (doc) => {
        const now = new Date();
        const row = {
          ...doc,
          id: randomUUID(),
          createdAt: now,
          updatedAt: now,
        } as unknown as T;
        store.set(row.id, row);
        return row;
      },
      update: async (id, patch) => {
        const row = store.get(id);
        if (!row) {
          return null;
        }
        const next = {
          ...row,
          ...patch,
          id: row.id,
          updatedAt: new Date(),
        };
        store.set(id, next);
        return next;
      },
      remove: async (id) => store.delete(id),
    };
  };

  /**
   * Snapshot every store, run `fn`, and restore on a throw — the in-memory
   * stand-in for the WebSocket adapter's `BEGIN` / `ROLLBACK`. Without it a
   * service that must write five rows or none could only be tested against a
   * real database, which is the test nobody runs.
   *
   * Nesting reuses the outer snapshot rather than taking a second one, so the
   * outermost transaction is the one that rolls back — the same shape the
   * adapter has.
   */
  let inTransaction = false;
  const transaction = async <T>(
    fn: (tx: DatabaseClient) => Promise<T>,
  ): Promise<T> => {
    if (inTransaction) {
      return fn(client);
    }
    const snapshot = new Map(
      [...stores].map((entry) => [entry[0], new Map(entry[1])] as const),
    );
    inTransaction = true;
    try {
      return await fn(client);
    } catch (cause) {
      // Restored into the live maps rather than swapping them out: a caller
      // holding a `Collection` handle from before the rollback keeps reading
      // the store it was handed.
      for (const entry of stores) {
        entry[1].clear();
        for (const row of snapshot.get(entry[0]) ?? []) {
          entry[1].set(row[0], row[1]);
        }
      }
      throw cause;
    } finally {
      inTransaction = false;
    }
  };

  const client: DatabaseClient = {
    driver: "memory",
    collection,
    transaction,
    close: async () => {},
  };
  return client;
};
