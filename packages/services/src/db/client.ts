import type { Id, Page, PageQuery } from "../types";

/**
 * The storage seam.
 *
 * No database vendor is committed in this repo yet, so the rest of the package is
 * written against these interfaces rather than a driver. When the vendor is
 * chosen, write ONE adapter that satisfies `DatabaseClient`, register it at
 * process start with `registerDatabase()`, and nothing above this file changes.
 *
 * The rule that keeps this seam honest: a service under `db/services/` may
 * import from here, never from a driver package directly.
 */

export type Collection<T extends { id: Id }> = {
  findById: (id: Id) => Promise<T | null>;
  findMany: (filter: Partial<T>, page?: PageQuery) => Promise<Page<T>>;
  insert: (doc: Omit<T, "id" | "createdAt" | "updatedAt">) => Promise<T>;
  update: (id: Id, patch: Partial<T>) => Promise<T | null>;
  remove: (id: Id) => Promise<boolean>;
};

export type DatabaseClient = {
  /** Vendor name, for logs and the health endpoint — e.g. "postgres", "mongo". */
  readonly driver: string;
  collection: <T extends { id: Id }>(name: string) => Collection<T>;
  /** Run `fn` inside a transaction where the driver supports one. */
  transaction: <T>(fn: (tx: DatabaseClient) => Promise<T>) => Promise<T>;
  close: () => Promise<void>;
};

let client: DatabaseClient | null = null;

/**
 * Register the adapter once, at process start (an app's instrumentation hook is
 * the natural place). Calling it twice with different adapters is a bug, not a
 * swap — it would leave already-resolved callers holding the old one.
 */
export const registerDatabase = (adapter: DatabaseClient) => {
  if (client && client !== adapter) {
    throw new Error(
      `a database adapter ("${client.driver}") is already registered — register once at process start`,
    );
  }
  client = adapter;
};

export const getDatabase = (): DatabaseClient => {
  if (!client) {
    throw new Error(
      "no database adapter registered — call registerDatabase() at process start (see packages/services/AGENTS.md)",
    );
  }
  return client;
};

export const isDatabaseRegistered = () => client !== null;
