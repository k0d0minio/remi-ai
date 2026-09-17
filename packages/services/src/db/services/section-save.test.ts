import { describe, expect, it } from "vitest";
import {
  countSectionPlan,
  isEmptySave,
  planSectionSave,
  noSectionChanges,
} from "./section-save";

type Row = { id?: string; title: string };
type Stored = { id: string; position: number; title: string };

const stored = (id: string, position: number, title: string): Stored => ({
  id,
  position,
  title,
});

const plan = (existing: readonly Stored[], groups: readonly Row[][]) =>
  planSectionSave<Row, Stored>({
    existing,
    groups,
    idOf: (row) => row.id,
    changed: (row, match) => row.title !== match.title,
  });

describe("section save planning", () => {
  it("inserts a row the operator added, at its place in the run", () => {
    const result = plan(
      [stored("a", 0, "first")],
      [[{ id: "a", title: "first" }, { title: "second" }]],
    );

    expect(result.inserts).toEqual([
      { row: { title: "second" }, position: 1 },
    ]);
    expect(result.archives).toEqual([]);
  });

  it("archives a row that was in force and was not submitted", () => {
    const result = plan(
      [stored("a", 0, "first"), stored("b", 1, "second")],
      [[{ id: "a", title: "first" }]],
    );

    expect(result.archives).toEqual(["b"]);
    expect(result.inserts).toEqual([]);
  });

  it("separates a changed row from a merely moved one", () => {
    const result = plan(
      [stored("a", 0, "first"), stored("b", 1, "second")],
      [[{ id: "b", title: "second" }, { id: "a", title: "renamed" }]],
    );

    const byId = new Map(result.updates.map((update) => [update.id, update]));
    expect(byId.get("b")).toMatchObject({
      position: 0,
      fieldsChanged: false,
      moved: true,
    });
    expect(byId.get("a")).toMatchObject({
      position: 1,
      fieldsChanged: true,
      moved: true,
    });
  });

  it("ranks each group from zero, so a run's order is its own", () => {
    const result = plan(
      [],
      [
        [{ title: "nutrition one" }, { title: "nutrition two" }],
        [{ title: "habit one" }],
      ],
    );

    expect(result.inserts.map((insert) => insert.position)).toEqual([0, 1, 0]);
  });

  it("plans a row whose id is no longer in force as an insert, not an error", () => {
    // The last-write-wins case: another operator archived the row while this
    // one was editing it. What she has on screen is what she means to keep.
    const result = plan([], [[{ id: "gone", title: "still wanted" }]]);

    expect(result.inserts).toHaveLength(1);
    expect(result.updates).toEqual([]);
  });

  it("counts only what it will actually write", () => {
    const result = plan(
      [stored("a", 0, "first"), stored("b", 1, "second")],
      [
        [
          { id: "b", title: "second" },
          { id: "a", title: "renamed" },
          { title: "third" },
        ],
      ],
    );

    expect(countSectionPlan(result)).toEqual({
      added: 1,
      updated: 1,
      archived: 0,
      reordered: 2,
    });
  });

  it("reports a section resubmitted unchanged as nothing to do", () => {
    const result = plan(
      [stored("a", 0, "first")],
      [[{ id: "a", title: "first" }]],
    );

    expect(countSectionPlan(result)).toEqual(noSectionChanges);
    expect(isEmptySave(countSectionPlan(result))).toBe(true);
  });
});
