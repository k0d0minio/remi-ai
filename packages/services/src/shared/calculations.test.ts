import { describe, expect, it } from "vitest";
import {
  bmi,
  bmiClass,
  bmiClasses,
  calculationInputLabels,
  calculationInputs,
  calculationKindLabels,
  calculationKinds,
  missingCalculationInputs,
  type CalculationData,
} from "./calculations";

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

describe("the missing data of a calculation", () => {
  const empty: CalculationData = {
    sexForCalculation: null,
    birthDate: null,
    heightCm: null,
    weightKg: null,
    activityLevel: null,
  };
  const full: CalculationData = {
    sexForCalculation: "female",
    birthDate: "1991-03-02",
    heightCm: 165,
    weightKg: 65,
    activityLevel: "moderate",
  };

  it("names every input of an empty file, in order", () => {
    expect(missingCalculationInputs("bmi", empty)).toEqual([
      "heightCm",
      "weightKg",
    ]);
    expect(missingCalculationInputs("protein", empty)).toEqual(["weightKg"]);
    expect(missingCalculationInputs("energy", empty)).toEqual([
      "sexForCalculation",
      "age",
      "heightCm",
      "weightKg",
      "activityLevel",
    ]);
  });

  it("names nothing when the file holds every input", () => {
    for (const kind of calculationKinds) {
      expect(missingCalculationInputs(kind, full)).toEqual([]);
    }
  });

  it("names only the input that is missing", () => {
    expect(
      missingCalculationInputs("bmi", { ...full, heightCm: null }),
    ).toEqual(["heightCm"]);
    expect(
      missingCalculationInputs("energy", { ...full, birthDate: null }),
    ).toEqual(["age"]);
  });

  it("labels every input and every kind in French and English", () => {
    for (const kind of calculationKinds) {
      expect(calculationKindLabels[kind].fr).not.toBe("");
      expect(calculationKindLabels[kind].en).not.toBe("");
      for (const input of calculationInputs[kind]) {
        expect(calculationInputLabels[input].fr).not.toBe("");
        expect(calculationInputLabels[input].en).not.toBe("");
      }
    }
  });
});
