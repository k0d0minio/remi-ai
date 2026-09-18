import { describe, expect, it } from "vitest";
import {
  componentsForRecommendation,
  normaliseNutritionText,
  nutrientComponentByKey,
  nutrientComponents,
} from "./nutrition";

/**
 * The hand-written map between Morgane's phrasing and CIQUAL's numbering.
 *
 * The recommendations quoted here are hers, from the § 7 feedback: this is the
 * step the whole stub exists to serve, and getting a component wrong is bad
 * advice rather than a clumsy sentence — so it is tested like a contract, not
 * like a lookup table.
 */

describe("normalising text", () => {
  it("drops accents and case", () => {
    expect(normaliseNutritionText("Magnésium")).toBe("magnesium");
    expect(normaliseNutritionText("SÉLÉNIUM")).toBe("selenium");
  });

  it("expands the ligatures CIQUAL's names are full of", () => {
    expect(normaliseNutritionText("Bœuf")).toBe("boeuf");
    expect(normaliseNutritionText("Œuf")).toBe("oeuf");
  });

  it("collapses whitespace so a pasted recommendation matches", () => {
    expect(normaliseNutritionText("  augmenter   les\nfibres ")).toBe(
      "augmenter les fibres",
    );
  });
});

describe("recommendation → component", () => {
  const keys = (text: string) =>
    componentsForRecommendation(text).map((component) => component.key);

  it("resolves the four her feedback names", () => {
    expect(keys("augmenter les protéines")).toEqual(["protein"]);
    expect(keys("favoriser les oméga-3")).toEqual(["omega3"]);
    expect(keys("augmenter les fibres")).toEqual(["fibre"]);
    expect(keys("augmenter le magnésium")).toEqual(["magnesium"]);
  });

  it("finds every component a sentence names, not just the first", () => {
    expect(keys("augmenter les protéines et favoriser les oméga-3")).toEqual(
      expect.arrayContaining(["protein", "omega3"]),
    );
    expect(
      keys("augmenter les protéines et favoriser les oméga-3"),
    ).toHaveLength(2);
  });

  it("matches without the accents and without the hyphen", () => {
    expect(keys("augmenter les proteines")).toEqual(["protein"]);
    expect(keys("plus d'omega 3")).toEqual(["omega3"]);
  });

  it("does not fire on a word that merely contains a component's name", () => {
    // « fer » inside « conserve », « iode » inside « période » — the reason
    // matching is bounded rather than a bare `includes`.
    expect(keys("éviter les conserves")).toEqual([]);
    expect(keys("sur la période de trois semaines")).toEqual([]);
  });

  it("returns nothing for a recommendation that names no component", () => {
    expect(keys("boire un grand verre d'eau au réveil")).toEqual([]);
  });

  it("knows which direction a recommendation pulls", () => {
    expect(componentsForRecommendation("réduire les sucres")[0].direction).toBe(
      "reduce",
    );
    expect(componentsForRecommendation("plus de fibres")[0].direction).toBe(
      "increase",
    );
  });
});

describe("the component list itself", () => {
  it("ships the twelve this build knows about", () => {
    expect(nutrientComponents).toHaveLength(12);
  });

  it("gives every component at least one CIQUAL code and a unit", () => {
    for (const component of nutrientComponents) {
      expect(component.codes.length).toBeGreaterThan(0);
      expect(component.unit).not.toBe("");
      expect(component.phrases.length).toBeGreaterThan(0);
    }
  });

  it("uses each key once, and finds a component by it", () => {
    const keys = nutrientComponents.map((component) => component.key);
    expect(new Set(keys).size).toBe(keys.length);
    expect(nutrientComponentByKey("omega3")?.codes).toEqual([
      "41833",
      "42053",
      "42263",
    ]);
    expect(nutrientComponentByKey("nope")).toBeUndefined();
  });
});
