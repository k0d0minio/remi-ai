import { neon } from "@neondatabase/serverless";
import { and, desc, eq, getTableColumns } from "drizzle-orm";
import { drizzle, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import type { PgTable } from "drizzle-orm/pg-core";
import { requireEnv } from "../../server/env";
import type { Id, Page, PageQuery } from "../../types";
import type { Collection, DatabaseClient } from "../client";
import {
  auditEvents,
  operatorInvitations,
  operators,
  patientAnamnesis,
  patientGoalCheckIns,
  patientGoals,
  patientInstructions,
  patientNotes,
  patientPantryEssentials,
  patientProfiles,
  patientRecipeAssignments,
  patientRecommendations,
  recipes,
} from "../schema";

/**
 * The Neon adapter — the first concrete implementation of the storage seam
 * (`DatabaseClient` in ../client.ts). Neon Postgres over the serverless HTTP
 * driver, queries built with Drizzle against ../schema.ts.
 *
 * The seam speaks in collections keyed by name; this table keeps the mapping in
 * one place, so a service reaching for a collection the schema does not carry
 * fails by name at the first call rather than 404ing at the database.
 */
const tables: Record<string, PgTable> = {
  patient_profiles: patientProfiles,
  patient_recommendations: patientRecommendations,
  patient_notes: patientNotes,
  patient_anamnesis: patientAnamnesis,
  patient_goals: patientGoals,
  patient_goal_check_ins: patientGoalCheckIns,
  patient_instructions: patientInstructions,
  patient_pantry_essentials: patientPantryEssentials,
  recipes: recipes,
  patient_recipe_assignments: patientRecipeAssignments,
  operators: operators,
  operator_invitations: operatorInvitations,
  audit_events: auditEvents,
};

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
          `unknown collection "${name}" — add the table to src/db/schema.ts and the registry in src/db/adapters/neon.ts`,
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
