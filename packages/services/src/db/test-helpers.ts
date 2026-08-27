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

  const client: DatabaseClient = {
    driver: "memory",
    collection,
    transaction: async (fn) => fn(client),
    close: async () => {},
  };
  return client;
};
