import { describe, expect, it } from "vitest";
import { firstRecommendationPerCategory } from "./patient";

/**
 * The "principales" rule the console's at-a-glance and the patient link's home
 * both render from. Asserted from the criterion — the first active
 * recommendation of each category, by position — rather than from either
 * caller, which is what makes it the place the two surfaces cannot drift.
 */
const rec = (category: string, title: string) =>
  ({ category, title }) as { category: "nutrition"; title: string };

describe("the first recommendation of each category", () => {
  it("takes the head of each category's run, in category order", () => {
    const picked = firstRecommendationPerCategory([
      rec("nutrition", "Légumes à chaque repas"),
      rec("nutrition", "Moins de sucre le matin"),
      rec("habit", "Marcher après le déjeuner"),
      rec("monitoring", "Peser le lundi"),
    ]);

    expect(picked.map((entry) => entry.title)).toEqual([
      "Légumes à chaque repas",
      "Marcher après le déjeuner",
      "Peser le lundi",
    ]);
  });

  it("never returns two of the same category", () => {
    const picked = firstRecommendationPerCategory([
      rec("habit", "Première"),
      rec("habit", "Deuxième"),
      rec("habit", "Troisième"),
    ]);

    expect(picked).toHaveLength(1);
    expect(picked[0].title).toBe("Première");
  });

  it("skips a category with nothing in it rather than padding", () => {
    const picked = firstRecommendationPerCategory([
      rec("activity", "Vélo le week-end"),
    ]);

    expect(picked).toHaveLength(1);
  });

  it("is empty when nothing is active, which is a real state", () => {
    expect(firstRecommendationPerCategory([])).toEqual([]);
  });

  it("preserves the order it is given within a category", () => {
    // The caller sorts by position; re-sorting here would mean reordering in
    // the console stopped reordering what the patient sees.
    const picked = firstRecommendationPerCategory([
      rec("nutrition", "Position 0"),
      rec("nutrition", "Position 1"),
    ]);

    expect(picked[0].title).toBe("Position 0");
  });
});
