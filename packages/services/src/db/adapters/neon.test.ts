import { beforeAll, describe, expect, it } from "vitest";
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

describe("neon adapter", () => {
  it("builds a client without connecting", () => {
    const db = createNeonDatabase();
    expect(db.driver).toBe("neon");
  });

  it("serves the known collections", () => {
    const db = createNeonDatabase();
    expect(db.collection("patient_profiles")).toBeDefined();
    expect(db.collection("patient_recommendations")).toBeDefined();
    expect(db.collection("operators")).toBeDefined();
  });

  it("throws by name for an unknown collection", () => {
    const db = createNeonDatabase();
    expect(() => db.collection("no_such_table")).toThrowError(
      /unknown collection "no_such_table"/,
    );
  });
});
