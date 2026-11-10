import { describe, expect, it } from "vitest";
import { bmi, bmiClass, bmiClasses } from "./calculations";

describe("the BMI", () => {
  it("gives 23.9 for 65 kg and 165 cm, story 7's control", () => {
    expect(bmi(65, 165)).toBe(23.9);
    expect(bmiClass(bmi(65, 165)).label.fr).toBe("Corpulence normale");
  });

  it("rounds to one decimal", () => {
    expect(bmi(70, 180)).toBe(21.6);
    expect(bmi(100, 150)).toBe(44.4);
  });
});

describe("the WHO classes", () => {
  it("are four, lowest first, with their French labels", () => {
    expect(bmiClasses.map((entry) => entry.label.fr)).toEqual([
      "Insuffisance pondérale",
      "Corpulence normale",
      "Surpoids",
      "Obésité",
    ]);
  });

  it.each([
    [18.4, "underweight"],
    [18.5, "normal"],
    [24.9, "normal"],
    [25.0, "overweight"],
    [29.9, "overweight"],
    [30.0, "obesity"],
  ])("puts %d in %s", (value, key) => {
    expect(bmiClass(value).key).toBe(key);
  });
});
