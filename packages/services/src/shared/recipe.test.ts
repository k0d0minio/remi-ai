import { describe, expect, it } from "vitest";
import { variantTitle, VARIANT_SUFFIX } from "./recipe";

/**
 * This helper is isomorphic because two callers have to agree on it: the form
 * pre-fills the title, and the service writes it. A drift between them is a
 * save the console offers and the service then refuses.
 */
describe("the title a duplicate opens with", () => {
  it("suffixes an ordinary title", () => {
    expect(variantTitle("Gratin de courge")).toBe(
      "Gratin de courge (variante)",
    );
  });

  it("does not stack the suffix on a variant of a variant", () => {
    const once = variantTitle("Soupe de poireaux");
    expect(variantTitle(once)).toBe(once);
  });

  it("keeps the result inside the column, suffix included", () => {
    const long = "a".repeat(140);
    const result = variantTitle(long);
    expect(result.length).toBe(140);
    expect(result.endsWith(VARIANT_SUFFIX)).toBe(true);
  });
});
