import { describe, expect, it } from "vitest";
import {
  PROTOCOL_SNAPSHOT_SCHEMA_VERSION,
  isEmptyProtocolSnapshot,
  protocolSnapshotSchema,
  type ProtocolSnapshot,
} from "./protocol-snapshot";

const id = (n: number) => `00000000-0000-4000-8000-00000000000${n}`;

const empty: ProtocolSnapshot = {
  schemaVersion: PROTOCOL_SNAPSHOT_SCHEMA_VERSION,
  recommendations: [],
  goals: [],
  supplements: [],
  instruction: null,
  calculations: [],
  foodDirectives: [],
};

const full: ProtocolSnapshot = {
  schemaVersion: PROTOCOL_SNAPSHOT_SCHEMA_VERSION,
  recommendations: [
    {
      id: id(1),
      category: "nutrition",
      title: "Légumes à chaque repas",
      detail: "",
      position: 0,
    },
  ],
  goals: [{ id: id(2), title: "Énergie", baseline: "3/10", position: 0 }],
  supplements: [
    {
      id: id(3),
      name: "Magnésium",
      dose: "300 mg",
      timing: "le soir",
      reason: "",
      position: 0,
    },
  ],
  instruction: { id: id(4), body: "Priorité énergie", patientBody: null },
  calculations: [
    {
      kind: "protein",
      value: 60,
      parameters: { referenceWeightKg: 65, coefficient: 0.92 },
      validatedAt: "2026-11-20T09:00:00.000Z",
    },
  ],
  foodDirectives: [
    {
      id: id(5),
      kind: "exclude",
      term: "kiwi",
      limitLevel: null,
      startsOn: null,
      endsOn: "2027-01-31",
      durable: false,
      position: 0,
    },
  ],
};

describe("the protocol snapshot schema", () => {
  it("accepts an empty and a full snapshot", () => {
    expect(protocolSnapshotSchema.safeParse(empty).success).toBe(true);
    expect(protocolSnapshotSchema.parse(full)).toEqual(full);
  });

  it("survives a round trip through JSON, as the jsonb column stores it", () => {
    const stored: unknown = JSON.parse(JSON.stringify(full));
    expect(protocolSnapshotSchema.parse(stored)).toEqual(full);
  });

  it("reads a snapshot from before the food directives with an empty list", () => {
    const older: Record<string, unknown> = { ...full };
    delete older.foodDirectives;
    const parsed = protocolSnapshotSchema.parse(older);
    expect(parsed.foodDirectives).toEqual([]);
    expect(parsed.recommendations).toEqual(full.recommendations);
  });

  it("refuses an eviction with no end date and no durable status", () => {
    const eviction = full.foodDirectives[0];
    expect(
      protocolSnapshotSchema.safeParse({
        ...full,
        foodDirectives: [{ ...eviction, endsOn: null }],
      }).success,
    ).toBe(false);
    expect(
      protocolSnapshotSchema.safeParse({
        ...full,
        foodDirectives: [{ ...eviction, endsOn: null, durable: true }],
      }).success,
    ).toBe(true);
  });

  it("refuses another schema version", () => {
    expect(
      protocolSnapshotSchema.safeParse({ ...full, schemaVersion: 2 }).success,
    ).toBe(false);
  });

  it("refuses a missing section", () => {
    expect(
      protocolSnapshotSchema.safeParse({ ...full, goals: undefined }).success,
    ).toBe(false);
  });

  it("refuses an unknown category and an unknown calculation", () => {
    expect(
      protocolSnapshotSchema.safeParse({
        ...full,
        recommendations: [{ ...full.recommendations[0], category: "sleep" }],
      }).success,
    ).toBe(false);
    expect(
      protocolSnapshotSchema.safeParse({
        ...full,
        calculations: [{ ...full.calculations[0], kind: "hydration" }],
      }).success,
    ).toBe(false);
  });

  it("refuses a calculation with no value or with a date that is not ISO", () => {
    expect(
      protocolSnapshotSchema.safeParse({
        ...full,
        calculations: [{ ...full.calculations[0], value: null }],
      }).success,
    ).toBe(false);
    expect(
      protocolSnapshotSchema.safeParse({
        ...full,
        calculations: [{ ...full.calculations[0], validatedAt: "20/11/2026" }],
      }).success,
    ).toBe(false);
  });

  it("refuses a recommendation with no title", () => {
    expect(
      protocolSnapshotSchema.safeParse({
        ...full,
        recommendations: [{ ...full.recommendations[0], title: "" }],
      }).success,
    ).toBe(false);
  });
});

describe("the meal configuration of a snapshot", () => {
  const mealConfiguration = {
    meals: {
      breakfast: { enabled: true, orientation: "protein_fat" },
      lunch: { enabled: true, orientation: "complete_balanced" },
      snack: { enabled: false, orientation: null },
      dinner: { enabled: null, orientation: null },
    },
    fasting: "skip_dinner",
  } as const;

  it("reads a snapshot from before REM-68 with no meal configuration", () => {
    const parsed = protocolSnapshotSchema.parse(full);
    expect(parsed.mealConfiguration).toBeUndefined();
  });

  it("keeps the values as entered, the absent ones too", () => {
    const parsed = protocolSnapshotSchema.parse({ ...full, mealConfiguration });
    expect(parsed.mealConfiguration).toEqual(mealConfiguration);
  });

  it("refuses an orientation and a fasting option that do not exist", () => {
    expect(
      protocolSnapshotSchema.safeParse({
        ...full,
        mealConfiguration: { ...mealConfiguration, fasting: "skip_lunch" },
      }).success,
    ).toBe(false);
    expect(
      protocolSnapshotSchema.safeParse({
        ...full,
        mealConfiguration: {
          ...mealConfiguration,
          meals: {
            ...mealConfiguration.meals,
            snack: { enabled: true, orientation: "keto" },
          },
        },
      }).success,
    ).toBe(false);
  });

  it("makes a snapshot with only a meal configuration not empty", () => {
    expect(isEmptyProtocolSnapshot({ ...empty, mealConfiguration })).toBe(
      false,
    );
  });
});

describe("isEmptyProtocolSnapshot", () => {
  it("is true only when no section has content", () => {
    expect(isEmptyProtocolSnapshot(empty)).toBe(true);
    expect(isEmptyProtocolSnapshot(full)).toBe(false);
    expect(
      isEmptyProtocolSnapshot({ ...empty, instruction: full.instruction }),
    ).toBe(false);
    expect(isEmptyProtocolSnapshot({ ...empty, goals: full.goals })).toBe(
      false,
    );
  });
});
