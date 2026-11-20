import { describe, expect, it } from "vitest";
import {
  LIFESTYLE_ADVICE_DETAILS_MAX,
  LIFESTYLE_ADVICE_TEXT_MAX,
  isLifestyleAdviceKey,
  lifestyleAdviceFaults,
  lifestyleAdviceKeys,
  lifestyleKeyOf,
  lifestyleRowsByKey,
} from "./lifestyle-advice";
import { recommendationCategories } from "./patient";
import { protocolSnapshotSchema } from "./protocol-snapshot";

describe("lifestyleAdviceKeys", () => {
  it("has the six categories of story 17, in Morgane's order", () => {
    expect(lifestyleAdviceKeys).toEqual([
      "physical_activity",
      "stress_management",
      "sleep",
      "hydration",
      "eating_behaviour",
      "lifestyle_other",
    ]);
  });

  it("shares no key with the recommendation categories", () => {
    for (const key of lifestyleAdviceKeys) {
      expect(recommendationCategories as readonly string[]).not.toContain(key);
    }
  });
});

describe("lifestyleKeyOf", () => {
  it("keeps a key of the section", () => {
    expect(lifestyleKeyOf("sleep")).toBe("sleep");
    expect(isLifestyleAdviceKey("sleep")).toBe(true);
  });

  it("reads the two old categories in their category of the section", () => {
    expect(lifestyleKeyOf("activity")).toBe("physical_activity");
    expect(lifestyleKeyOf("habit")).toBe("eating_behaviour");
    expect(isLifestyleAdviceKey("habit")).toBe(false);
  });

  it("gives null for a category that is not lifestyle advice", () => {
    for (const category of ["nutrition", "supplement", "monitoring", "", "toString"]) {
      expect(lifestyleKeyOf(category)).toBeNull();
    }
  });
});

describe("lifestyleAdviceFaults", () => {
  it("accepts a text alone, and a save with no line", () => {
    expect(lifestyleAdviceFaults([], [])).toEqual([]);
    expect(
      lifestyleAdviceFaults(
        [{ category: "sleep", text: "Coucher avant 23 h", details: "" }],
        [{ id: "a", text: "Boire 1,5 l", details: "chaque jour" }],
      ),
    ).toEqual([]);
  });

  it("names the empty line inside its category", () => {
    expect(
      lifestyleAdviceFaults(
        [
          { category: "sleep", text: "Coucher avant 23 h", details: "" },
          { category: "hydration", text: "Boire 1,5 l", details: "" },
          { category: "sleep", text: "   ", details: "le soir" },
        ],
        [],
      ),
    ).toEqual([
      { code: "text_missing", list: "added", line: 2, category: "sleep" },
    ]);
  });

  it("refuses an edited line with no text", () => {
    expect(
      lifestyleAdviceFaults(
        [],
        [
          { id: "a", text: "Marcher", details: "" },
          { id: "b", text: "", details: "" },
        ],
      ),
    ).toEqual([
      { code: "text_missing", list: "edited", line: 2, category: null },
    ]);
  });

  it("refuses a text or details over the limit", () => {
    const long = (length: number) => "a".repeat(length);
    expect(
      lifestyleAdviceFaults(
        [
          {
            category: "sleep",
            text: long(LIFESTYLE_ADVICE_TEXT_MAX),
            details: long(LIFESTYLE_ADVICE_DETAILS_MAX),
          },
          {
            category: "sleep",
            text: long(LIFESTYLE_ADVICE_TEXT_MAX + 1),
            details: "",
          },
          {
            category: "sleep",
            text: "Sieste courte",
            details: long(LIFESTYLE_ADVICE_DETAILS_MAX + 1),
          },
        ],
        [],
      ).map((fault) => [fault.code, fault.line]),
    ).toEqual([
      ["text_too_long", 2],
      ["details_too_long", 3],
    ]);
  });
});

describe("lifestyleRowsByKey", () => {
  const row = (id: string, category: string, position: number) => ({
    id,
    category,
    title: id,
    detail: "",
    position,
  });

  it("groups by category of the section, then by position", () => {
    const groups = lifestyleRowsByKey([
      row("b", "physical_activity", 1),
      row("a", "activity", 0),
      row("n", "nutrition", 0),
      row("s", "sleep", 0),
    ]);
    expect(groups.map((group) => group.category)).toEqual(lifestyleAdviceKeys);
    expect(
      groups
        .filter((group) => group.rows.length > 0)
        .map((group) => [group.category, group.rows.map((item) => item.id)]),
    ).toEqual([
      ["physical_activity", ["a", "b"]],
      ["sleep", ["s"]],
    ]);
  });
});

describe("the protocol snapshot", () => {
  const base = {
    schemaVersion: 1,
    goals: [],
    supplements: [],
    instruction: null,
    calculations: [],
  };
  const rec = (category: string) => ({
    id: "00000000-0000-4000-8000-000000000001",
    category,
    title: "Coucher avant 23 h",
    detail: "",
    position: 0,
  });

  it("accepts a row of each lifestyle key and of each old category", () => {
    for (const category of [...lifestyleAdviceKeys, ...recommendationCategories]) {
      expect(
        protocolSnapshotSchema.safeParse({
          ...base,
          recommendations: [rec(category)],
        }).success,
      ).toBe(true);
    }
  });

  it("refuses a row of an unknown category", () => {
    expect(
      protocolSnapshotSchema.safeParse({
        ...base,
        recommendations: [rec("unknown")],
      }).success,
    ).toBe(false);
  });
});
