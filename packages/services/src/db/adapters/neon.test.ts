import { getTableName, is } from "drizzle-orm";
import { PgTable } from "drizzle-orm/pg-core";
import { beforeAll, describe, expect, it } from "vitest";
import * as schema from "../schema";
import { createNeonDatabase } from "./neon";

/**
 * Construction-level checks only — queries need a live database and belong to
 * the integration harness REMI-016 stands up. What is worth pinning here is
 * the loud-failure behaviour: a wrong collection name or a missing filter
 * column must throw by name, never reach Postgres as a broken query.
 */
beforeAll(() => {
  process.env.DATABASE_URL =
    "postgresql://user:password@localhost:5432/never-connected";
});

const schemaTableNames: string[] = [];

for (const value of Object.values(schema)) {
  if (is(value, PgTable)) {
    schemaTableNames.push(getTableName(value));
  }
}

describe("neon adapter", () => {
  it("builds a client without connecting", () => {
    const db = createNeonDatabase();
    expect(db.driver).toBe("neon");
  });

  /**
   * The service tests all run on `createMemoryDatabase()`, which invents a
   * collection for any name asked of it — so a table missing from this adapter
   * is invisible to every one of them and shows up only in production. It did:
   * `patient_supplements` was absent, and the admin patient page threw for
   * every patient. This is the check that stands in for those tests.
   */
  it("serves every table the schema declares", () => {
    const db = createNeonDatabase();
    expect(schemaTableNames).toContain("patient_supplements");
    for (const name of schemaTableNames) {
      expect(db.collection(name)).toBeDefined();
    }
  });

  it("throws by name for an unknown collection", () => {
    const db = createNeonDatabase();
    expect(() => db.collection("no_such_table")).toThrowError(
      /unknown collection "no_such_table"/,
    );
  });
});
