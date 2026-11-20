import { describe, expect, it } from "vitest";
import {
  bmi,
  bmiClass,
  bmiClasses,
  bmiIndicator,
  bmiNeedsReview,
  calculationInputLabels,
  calculationInputs,
  calculationKindLabels,
  calculationKinds,
  calculationsReadingFields,
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

  it("labels every input and every kind in French", () => {
    for (const kind of calculationKinds) {
      expect(calculationKindLabels[kind].fr).not.toBe("");
      for (const input of calculationInputs[kind]) {
        expect(calculationInputLabels[input].fr).not.toBe("");
      }
    }
  });
});

describe("the BMI indicator", () => {
  it("shows 23,9 · Corpulence normale for 165 cm and 65 kg, with no alert", () => {
    const indicator = bmiIndicator({ heightCm: 165, weightKg: 65 });
    expect(indicator).toMatchObject({
      state: "computed",
      value: 23.9,
      needsReview: false,
    });
    if (indicator.state === "computed") {
      expect(indicator.bmiClass.label.fr).toBe("Corpulence normale");
    }
  });

  it.each([
    [17.9, true],
    [18.4, true],
    [18.5, false],
    [22.0, false],
    [24.9, false],
    [25.0, true],
    [30.0, true],
  ])("flags %d: %s", (value, flagged) => {
    expect(bmiNeedsReview(value)).toBe(flagged);
  });

  it("flags the rounded value, so the screen and the alert agree", () => {
    // 50.3 kg / 1.65² = 18.475…: under 18.5 raw, 18,5 on screen.
    expect(bmiIndicator({ heightCm: 165, weightKg: 50.3 })).toMatchObject({
      value: 18.5,
      needsReview: false,
    });
  });

  it("names a missing height and gives no value", () => {
    expect(bmiIndicator({ heightCm: null, weightKg: 65 })).toEqual({
      state: "missing",
      inputs: ["heightCm"],
    });
    expect(bmiIndicator({ heightCm: null, weightKg: null })).toEqual({
      state: "missing",
      inputs: ["heightCm", "weightKg"],
    });
  });

  it("names a value out of range and gives no value", () => {
    expect(bmiIndicator({ heightCm: 99, weightKg: 65 })).toEqual({
      state: "out_of_range",
      inputs: ["heightCm"],
    });
    expect(bmiIndicator({ heightCm: 165, weightKg: 301 })).toEqual({
      state: "out_of_range",
      inputs: ["weightKg"],
    });
    expect(bmiIndicator({ heightCm: 251, weightKg: 24.9 })).toEqual({
      state: "out_of_range",
      inputs: ["heightCm", "weightKg"],
    });
  });

  it("computes at the edges of the ranges", () => {
    expect(bmiIndicator({ heightCm: 100, weightKg: 25 }).state).toBe(
      "computed",
    );
    expect(bmiIndicator({ heightCm: 250, weightKg: 300 }).state).toBe(
      "computed",
    );
  });
});

describe("the calculations that read a changed field", () => {
  it("are the three for the weight", () => {
    expect(calculationsReadingFields(["weightKg"])).toEqual([
      "bmi",
      "protein",
      "energy",
    ]);
  });

  it("are the three for the height", () => {
    expect(calculationsReadingFields(["heightCm"])).toEqual([
      "bmi",
      "protein",
      "energy",
    ]);
  });

  it("are the energy need only for the activity level", () => {
    expect(calculationsReadingFields(["activityLevel"])).toEqual(["energy"]);
  });

  it("are none for a field that no calculation reads", () => {
    expect(calculationsReadingFields(["diet", "allergies"])).toEqual([]);
    expect(calculationsReadingFields([])).toEqual([]);
  });

  it("name each calculation once for several fields", () => {
    expect(
      calculationsReadingFields(["activityLevel", "weightKg", "diet"]),
    ).toEqual(["bmi", "protein", "energy"]);
  });
});
