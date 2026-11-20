import { describe, expect, it } from "vitest";
import {
  comparePatientChangesForReview,
  isSafetyPatientField,
  patientChangeValueLabel,
  watchedPatientFieldLabels,
} from "./patient-change-labels";
import { watchedPatientFields } from "./patient-changes";

describe("watchedPatientFieldLabels", () => {
  it("names each watched field in French", () => {
    for (const field of watchedPatientFields) {
      expect(watchedPatientFieldLabels[field].fr).not.toBe("");
    }
  });
});

describe("isSafetyPatientField", () => {
  it("marks the allergies, the intolerances and the diet", () => {
    expect(watchedPatientFields.filter(isSafetyPatientField)).toEqual([
      "diet",
      "dietNote",
      "allergies",
      "intolerances",
    ]);
  });
});

describe("patientChangeValueLabel", () => {
  it("answers null for an empty answer", () => {
    expect(patientChangeValueLabel("weightKg", null)).toBeNull();
    expect(patientChangeValueLabel("allergies", [])).toBeNull();
  });

  it("gives the height and the weights their unit", () => {
    expect(patientChangeValueLabel("heightCm", 170)).toBe("170 cm");
    expect(patientChangeValueLabel("weightKg", 70)).toBe("70 kg");
    expect(patientChangeValueLabel("desiredWeightKg", 65)).toBe("65 kg");
  });

  it("writes a decimal with a comma", () => {
    expect(patientChangeValueLabel("weightKg", 70.5)).toBe("70,5 kg");
  });

  it("shows the label of a known choice", () => {
    expect(patientChangeValueLabel("activityLevel", "moderate")).toBe(
      "Modéré (légèrement actif)",
    );
    expect(patientChangeValueLabel("diet", "vegetarian")).toBe("Végétarien");
    expect(patientChangeValueLabel("geneticTest", "yes")).toBe("Oui");
  });

  it("shows a value that is not a known choice as it is stored", () => {
    expect(patientChangeValueLabel("diet", "végétarien")).toBe("végétarien");
    expect(patientChangeValueLabel("diet", "toString")).toBe("toString");
    expect(patientChangeValueLabel("apoe", "E3/E4")).toBe("E3/E4");
    expect(patientChangeValueLabel("medications", "Levothyrox")).toBe(
      "Levothyrox",
    );
  });

  it("names each entry of an allergy list, with its sub-entry", () => {
    expect(
      patientChangeValueLabel("allergies", ["fish/cod", "peanuts"]),
    ).toBe("Poissons (Cabillaud), Arachides");
    expect(patientChangeValueLabel("allergies", ["gluten/wheat"])).toBe(
      "Céréales contenant du gluten (Blé)",
    );
    expect(patientChangeValueLabel("allergies", ["fish/all"])).toBe(
      "Poissons (tous)",
    );
  });

  it("keeps the text of « Autre »", () => {
    expect(patientChangeValueLabel("allergies", ["other: kiwi"])).toBe(
      "Autre : kiwi",
    );
  });

  it("reads an intolerance from the intolerance labels", () => {
    expect(patientChangeValueLabel("intolerances", ["lactose", "egg"])).toBe(
      "Lactose, Œuf",
    );
  });

  it("shows an entry with an unknown key as it is stored", () => {
    expect(patientChangeValueLabel("allergies", ["kiwi"])).toBe("kiwi");
  });
});

describe("comparePatientChangesForReview", () => {
  it("puts a safety field first, then the newest change", () => {
    const rows = [
      { fieldKey: "weightKg", changedAt: new Date("2026-11-20") },
      { fieldKey: "heightCm", changedAt: new Date("2026-11-21") },
      { fieldKey: "allergies", changedAt: new Date("2026-11-01") },
    ] as const;
    expect(
      [...rows].sort(comparePatientChangesForReview).map((row) => row.fieldKey),
    ).toEqual(["allergies", "heightCm", "weightKg"]);
  });
});
