import { Pool } from "@neondatabase/serverless";
import { and, desc, eq, getTableColumns, getTableName, is } from "drizzle-orm";
import { drizzle, type NeonQueryResultHKT } from "drizzle-orm/neon-serverless";
import { PgDatabase, PgTable } from "drizzle-orm/pg-core";
import { requireEnv } from "../../server/env";
import type { Id, Page, PageQuery } from "../../types";
import type { Collection, DatabaseClient } from "../client";
import * as schema from "../schema";

/**
 * The Neon adapter — the first concrete implementation of the storage seam
 * (`DatabaseClient` in ../client.ts). Neon Postgres over the serverless
 * WebSocket driver, queries built with Drizzle against ../schema.ts.
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
 * What a collection issues its queries against: the pooled database, or a
 * transaction opened on it. `PgTransaction` extends `PgDatabase` with the same
 * result type, so naming the base class here is what lets one `makeCollection`
 * serve both — and what makes `transaction()` below hand services a client
 * bound to the open transaction rather than to the pool.
 */
type Queryable = PgDatabase<NeonQueryResultHKT>;

/**
 * The generic `Collection<T>` contract meets Drizzle's per-table inference
 * here, and the two cannot be reconciled without repeating every query three
 * times — so this helper is the one place rows are cast. The casts are sound
 * as long as the model type in `models/` matches the table in `schema.ts`,
 * which is the pairing every entity in this package maintains by rule.
 */
const makeCollection = <T extends { id: Id }>(
  db: Queryable,
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
 * Build the client from `DATABASE_URL`. Register it via `registerDatabase()`
 * from the app's `ensureDatabase()` helper, lazily at first use.
 *
 * **One pool per module graph, not per process.** Next.js bundles every route
 * with its own copy of this package, so `registerDatabase()` runs once per
 * graph and each one builds a pool of its own — the same fact that puts
 * registration in `ensureDatabase()` rather than in a boot hook. They are
 * sized on that basis: a small ceiling and an idle timeout, so a handful of
 * route bundles cannot between them hold more connections than the database
 * will give. A pool is never closed per request — on Vercel one function
 * instance serves many, and tearing the WebSocket down after each would pay
 * the connection cost every time.
 */
export const createNeonDatabase = (): DatabaseClient => {
  const pool = new Pool({
    connectionString: requireEnv("DATABASE_URL", "createNeonDatabase()"),
    max: 5,
    idleTimeoutMillis: 30_000,
  });

  // Neon drops idle connections, and a pool with no `error` listener turns
  // that into an unhandled `'error'` event, which ends the process. The HTTP
  // driver this replaced held no sockets and could not do it; this one can.
  // Annotated because Neon's `Pool` narrows every `on` overload's listener to
  // `any`, so the handler's parameter has no contextual type to infer from.
  pool.on("error", (cause: Error) => {
    console.error("[database] idle client error", cause);
  });

  const db = drizzle(pool);

  const clientOn = (queryable: Queryable): DatabaseClient => ({
    driver: "neon",
    collection: <T extends { id: Id }>(name: string): Collection<T> => {
      const table = tables[name];
      if (!table) {
        throw new Error(
          `unknown collection "${name}" — no table of that name is exported from src/db/schema.ts`,
        );
      }
      return makeCollection<T>(queryable, table);
    },
    /**
     * A real `BEGIN` / `COMMIT` / `ROLLBACK`: the WebSocket driver supports
     * interactive transactions, which the HTTP one did not — the reason this
     * adapter moved to it. `fn` receives a client whose collections issue
     * their queries on the transaction, so a service handed `tx` writes inside
     * it; one handed the pooled client does not. Nesting reuses the open
     * transaction rather than opening a second one, since Postgres has no
     * second `BEGIN` to give.
     */
    transaction: async (fn) =>
      queryable === db
        ? db.transaction(async (tx) => fn(clientOn(tx)))
        : fn(clientOn(queryable)),
    close: async () => {
      await pool.end();
    },
  });

  return clientOn(db);
};
