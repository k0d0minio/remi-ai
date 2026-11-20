import { describe, expect, it } from "vitest";
import {
  activationRecap,
  canActivate,
  isResolvedEviction,
  type ActivationEviction,
  type ActivationInput,
  type ActivationVersion,
} from "./care-activation";
import { PROTOCOL_SNAPSHOT_SCHEMA_VERSION } from "./protocol-snapshot";

const validated: ActivationVersion = {
  versionNumber: 2,
  validatedAt: new Date("2026-11-18T10:00:00.000Z"),
  snapshot: {
    schemaVersion: PROTOCOL_SNAPSHOT_SCHEMA_VERSION,
    recommendations: [
      {
        id: "00000000-0000-4000-8000-0000000000a1",
        category: "nutrition",
        title: "Two litres of water",
        detail: "",
        position: 0,
      },
    ],
    goals: [
      {
        id: "00000000-0000-4000-8000-0000000000b1",
        title: "More energy",
        baseline: "3/10",
        position: 0,
      },
    ],
    supplements: [
      {
        id: "00000000-0000-4000-8000-0000000000c1",
        name: "Magnesium",
        dose: "300 mg",
        timing: "",
        reason: "",
        position: 0,
      },
    ],
    instruction: null,
    foodDirectives: [],
    calculations: [
      {
        kind: "protein",
        value: 92,
        parameters: {},
        validatedAt: "2026-11-18T09:00:00.000Z",
      },
    ],
  },
};

const eviction = (
  patch: Partial<ActivationEviction> = {},
): ActivationEviction => ({
  label: "Gluten",
  periodStart: null,
  periodEnd: null,
  durable: false,
  ...patch,
});

const input = (patch: Partial<ActivationInput> = {}): ActivationInput => ({
  validated,
  safety: { allergies: "none_known", intolerances: "listed" },
  evictions: [],
  staleCalculations: [],
  unrecognised: [],
  ...patch,
});

describe("an eviction", () => {
  it("is resolved by a period or by the durable status", () => {
    expect(isResolvedEviction(eviction())).toBe(false);
    expect(isResolvedEviction(eviction({ periodStart: " " }))).toBe(false);
    expect(isResolvedEviction(eviction({ periodEnd: "2027-01-31" }))).toBe(
      true,
    );
    expect(isResolvedEviction(eviction({ periodStart: "2026-12-01" }))).toBe(
      true,
    );
    expect(isResolvedEviction(eviction({ durable: true }))).toBe(true);
  });
});

describe("the recap of an activation", () => {
  it("lists the validated values and has no blocker", () => {
    const recap = activationRecap(input());
    expect(recap.blockers).toEqual([]);
    expect(canActivate(recap)).toBe(true);
    expect(recap.values).toEqual({
      versionNumber: 2,
      validatedAt: validated.validatedAt,
      goals: ["More energy"],
      recommendations: 1,
      supplements: ["Magnesium"],
      instruction: false,
      calculations: [{ kind: "protein", value: 92 }],
    });
  });

  it("blocks a file with no validated version", () => {
    const recap = activationRecap(input({ validated: null }));
    expect(recap.values).toBeNull();
    expect(recap.blockers).toEqual([{ kind: "no_validated_version" }]);
    expect(canActivate(recap)).toBe(false);
  });

  it("blocks a missing safety answer, and not « aucune connue »", () => {
    const recap = activationRecap(
      input({
        safety: { allergies: "not_entered", intolerances: "not_entered" },
      }),
    );
    expect(recap.blockers).toEqual([
      { kind: "safety_answer_missing", field: "allergies" },
      { kind: "safety_answer_missing", field: "intolerances" },
    ]);
    expect(
      activationRecap(
        input({
          safety: { allergies: "none_known", intolerances: "none_known" },
        }),
      ).blockers,
    ).toEqual([]);
  });

  it("blocks an eviction with no period and no durable status", () => {
    const recap = activationRecap(
      input({
        evictions: [
          eviction({ label: "Gluten" }),
          eviction({ label: "Lactose", durable: true }),
          eviction({
            label: "Arachides",
            periodStart: "2026-12-01",
            periodEnd: "2027-01-31",
          }),
        ],
      }),
    );
    expect(recap.evictions.map((row) => row.resolved)).toEqual([
      false,
      true,
      true,
    ]);
    expect(recap.blockers).toEqual([
      { kind: "eviction_without_period", label: "Gluten" },
    ]);
  });

  it("lists an element that is not recognised, and does not block", () => {
    const recap = activationRecap(
      input({ unrecognised: [" kombu ", "kombu", "", "tempeh"] }),
    );
    expect(recap.unrecognised).toEqual(["kombu", "tempeh"]);
    expect(recap.blockers).toEqual([]);
  });

  it("gives the blockers in a fixed order", () => {
    const recap = activationRecap(
      input({
        validated: null,
        safety: { allergies: "listed", intolerances: "not_entered" },
        evictions: [eviction({ label: "Soja" })],
      }),
    );
    expect(recap.blockers.map((blocker) => blocker.kind)).toEqual([
      "no_validated_version",
      "safety_answer_missing",
      "eviction_without_period",
    ]);
  });

  it("blocks on each calculation to revalidate, in the order of the kinds", () => {
    const recap = activationRecap(
      input({ staleCalculations: ["energy", "protein"] }),
    );
    expect(recap.blockers).toEqual([
      { kind: "calculation_to_revalidate", calculation: "protein" },
      { kind: "calculation_to_revalidate", calculation: "energy" },
    ]);
    expect(canActivate(recap)).toBe(false);
  });

  it("keeps the validated values of a calculation to revalidate", () => {
    const stale = activationRecap(input({ staleCalculations: ["protein"] }));
    expect(stale.values).toEqual(activationRecap(input()).values);
  });

  it("puts a calculation to revalidate before the evictions", () => {
    const recap = activationRecap(
      input({
        staleCalculations: ["energy"],
        evictions: [
          { label: "gluten", periodStart: null, periodEnd: null, durable: false },
        ],
      }),
    );
    expect(recap.blockers.map((blocker) => blocker.kind)).toEqual([
      "calculation_to_revalidate",
      "eviction_without_period",
    ]);
  });
});
