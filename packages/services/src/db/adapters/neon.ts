import { neon } from "@neondatabase/serverless";
import { and, desc, eq, getTableColumns, getTableName, is } from "drizzle-orm";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import { PgTable } from "drizzle-orm/pg-core";
import { requireEnv } from "../../server/env";
import type { Id, Page, PageQuery } from "../../types";
import type { Collection, DatabaseClient } from "../client";
import * as schema from "../schema";

/**
 * The Neon adapter — the first concrete implementation of the storage seam
 * (`DatabaseClient` in ../client.ts). Neon Postgres over the serverless HTTP
 * driver, queries built with Drizzle against ../schema.ts.
 *
 * The seam speaks in collections keyed by name, and the mapping is DERIVED
 * from the schema rather than typed out: every `pgTable` exported by
 * ../schema.ts is served under the name it declares, so a table is registered
 * the moment it is defined.
 *
 * It was a hand-kept list until `patient_supplements` — defined, migrated,
 * queried by the supplement protocol, and never added to it. Every read of it
 * threw `unknown collection`, which is one of the twenty-one reads the admin
 * patient page fans out, so the page rendered its error boundary for every
 * patient. The service tests never saw it: `createMemoryDatabase()` makes a
 * collection for any name asked of it, so only production had the list.
 * Deriving it leaves nothing to forget.
 */
const tables: Record<string, PgTable> = {};

// `is()` narrows against the class, which is the only way to tell a table from
// any other export; a `.filter()` type predicate cannot say it, because
// `PgTable` is the supertype of what `Object.values(schema)` is typed as
// (TS2677) — hence the loop.
for (const value of Object.values(schema)) {
  if (is(value, PgTable)) {
    tables[getTableName(value)] = value;
  }
}

const DEFAULT_PAGE_LIMIT = 50;

/**
 * The generic `Collection<T>` contract meets Drizzle's per-table inference
 * here, and the two cannot be reconciled without repeating every query three
 * times — so this helper is the one place rows are cast. The casts are sound
 * as long as the model type in `models/` matches the table in `schema.ts`,
 * which is the pairing every entity in this package maintains by rule.
 */
const makeCollection = <T extends { id: Id }>(
  db: NeonHttpDatabase,
  table: PgTable,
): Collection<T> => {
  const columns = getTableColumns(table);

  const columnFor = (key: string) => {
    const column = columns[key];
    if (!column) {
      throw new Error(
        `unknown column "${key}" in filter — check the model against the schema`,
      );
    }
    return column;
  };

  const findById = async (id: Id): Promise<T | null> => {
    const rows = await db
      .select()
      .from(table)
      .where(eq(columnFor("id"), id))
      .limit(1);
    return (rows[0] as T | undefined) ?? null;
  };

  const findMany = async (
    filter: Partial<T>,
    page?: PageQuery,
  ): Promise<Page<T>> => {
    const limit = page?.limit ?? DEFAULT_PAGE_LIMIT;
    const offset = page?.cursor ? Number.parseInt(page.cursor, 10) : 0;
    const conditions = Object.entries(filter).map(([key, value]) =>
      eq(columnFor(key), value),
    );

    let query = db.select().from(table).$dynamic();
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    const rows = await query
      .orderBy(desc(columnFor("createdAt")), desc(columnFor("id")))
      .limit(limit)
      .offset(offset);

    return {
      items: rows as T[],
      // Offset-encoded, which is honest at this adapter's scale; a keyset
      // cursor can replace it behind the same string without a caller changing.
      nextCursor: rows.length === limit ? String(offset + limit) : null,
    };
  };

  const insert = async (
    doc: Omit<T, "id" | "createdAt" | "updatedAt">,
  ): Promise<T> => {
    // `as never`: the generic seam cannot name the table's insert model; the
    // schema/model pairing (see makeCollection's doc) is what keeps it sound.
    const rows = await db
      .insert(table)
      .values(doc as never)
      .returning();
    return rows[0] as T;
  };

  const update = async (id: Id, patch: Partial<T>): Promise<T | null> => {
    const rest: Record<string, unknown> = { ...patch };
    delete rest.id;
    delete rest.createdAt;
    delete rest.updatedAt;
    const rows = await db
      .update(table)
      .set({ ...rest, updatedAt: new Date() } as never)
      .where(eq(columnFor("id"), id))
      .returning();
    return (rows[0] as T | undefined) ?? null;
  };

  const remove = async (id: Id): Promise<boolean> => {
    const rows = await db
      .delete(table)
      .where(eq(columnFor("id"), id))
      .returning();
    return rows.length > 0;
  };

  return { findById, findMany, insert, update, remove };
};

/**
 * Build the client from `DATABASE_URL`. Register it once at process start —
 * each app's `instrumentation.ts` is the place — via `registerDatabase()`.
 */
export const createNeonDatabase = (): DatabaseClient => {
  const db = drizzle(neon(requireEnv("DATABASE_URL", "createNeonDatabase()")));

  const client: DatabaseClient = {
    driver: "neon",
    collection: <T extends { id: Id }>(name: string): Collection<T> => {
      const table = tables[name];
      if (!table) {
        throw new Error(
          `unknown collection "${name}" — no table of that name is exported from src/db/schema.ts`,
        );
      }
      return makeCollection<T>(db, table);
    },
    /**
     * The HTTP driver has no interactive transactions, so `fn` runs without
     * isolation. Nothing in the phase-1 slice writes across tables in one unit;
     * the first service that does must move this adapter to the WebSocket
     * driver (REMI-013 is the place that decision lands).
     */
    transaction: async (fn) => fn(client),
    close: async () => {},
  };

  return client;
};
