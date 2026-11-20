import { describe, expect, it } from "vitest";
import { checkPlannedMealText, PLANNED_MEAL_MAX_LENGTH } from "./planned-meal";

describe("checkPlannedMealText", () => {
  it("accepts a dish name alone", () => {
    expect(checkPlannedMealText("Spaghetti tomate")).toEqual({
      ok: true,
      text: "Spaghetti tomate",
    });
  });

  it("removes the spaces around the text", () => {
    expect(checkPlannedMealText("  Salade de lentilles \n")).toEqual({
      ok: true,
      text: "Salade de lentilles",
    });
  });

  it("refuses an empty text and a text of spaces only", () => {
    expect(checkPlannedMealText("")).toEqual({ ok: false, error: "empty" });
    expect(checkPlannedMealText(" \n ")).toEqual({ ok: false, error: "empty" });
  });

  it("refuses a value that is not a text", () => {
    expect(checkPlannedMealText(null)).toEqual({ ok: false, error: "empty" });
    expect(checkPlannedMealText(42)).toEqual({ ok: false, error: "empty" });
  });

  it("accepts a text at the limit and refuses one character more", () => {
    expect(checkPlannedMealText("a".repeat(PLANNED_MEAL_MAX_LENGTH)).ok).toBe(
      true,
    );
    expect(checkPlannedMealText("a".repeat(PLANNED_MEAL_MAX_LENGTH + 1))).toEqual(
      { ok: false, error: "too_long" },
    );
  });

  it("counts a line break of a browser as one character", () => {
    const lines = "a\r\n".repeat(PLANNED_MEAL_MAX_LENGTH / 2 - 1);
    const checked = checkPlannedMealText(`${lines}b`);

    expect(checked.ok).toBe(true);
    expect(checked.ok ? checked.text : "").not.toContain("\r");
  });
});
