import { describe, expect, it } from "vitest";
import { mealIntentLabels } from "./meal-intent";
import { mealIntents } from "./patient";

describe("mealIntentLabels", () => {
  it("names a planned meal « prévu » and an eaten meal « mangé »", () => {
    expect(mealIntentLabels.planned).toBe("prévu");
    expect(mealIntentLabels.eaten).toBe("mangé");
  });

  it("gives each intent a different label", () => {
    const labels = mealIntents.map((intent) => mealIntentLabels[intent]);

    expect(new Set(labels).size).toBe(mealIntents.length);
    for (const label of labels) {
      expect(label).not.toBe("");
    }
  });
});
