import { describe, expect, it } from "vitest";
import {
  defaultProteinCoefficient,
  proteinAdaptationLabels,
  proteinAdditions,
  proteinEstimateParameters,
  proteinNeed,
  proteinProposal,
  proteinValidationSituations,
  seniorProteinCoefficientRange,
  type ProteinProfile,
} from "./protein";

const profile = (patch: Partial<ProteinProfile> = {}): ProteinProfile => ({
  weightKg: 65,
  heightCm: 165,
  age: 40,
  specialSituation: null,
  ...patch,
});

const computed = (patch: Partial<ProteinProfile> = {}) => {
  const proposal = proteinProposal(profile(patch));
  if (proposal.state !== "computed") {
    throw new Error("the proposal did not compute");
  }
  return proposal;
};

describe("the protein need", () => {
  it("gives 90 for 75 kg at 1.2 g/kg/day, story 8's control", () => {
    expect(proteinNeed({ referenceWeightKg: 75, coefficient: 1.2 })).toBe(90);
  });

  it("gives 54 for 65 kg at the default coefficient", () => {
    expect(
      proteinNeed({
        referenceWeightKg: 65,
        coefficient: defaultProteinCoefficient,
      }),
    ).toBe(54);
  });

  it("rounds to the gram, a half up", () => {
    expect(proteinNeed({ referenceWeightKg: 50, coefficient: 0.83 })).toBe(42);
    expect(proteinNeed({ referenceWeightKg: 72.5, coefficient: 0.83 })).toBe(
      60,
    );
    expect(proteinNeed({ referenceWeightKg: 100, coefficient: 1 })).toBe(100);
  });
});

describe("the constants of story 8", () => {
  it("keep the EFSA reference and the range from 65", () => {
    expect(defaultProteinCoefficient).toBe(0.83);
    expect(seniorProteinCoefficientRange).toEqual({ min: 1, max: 1.2 });
  });

  it("keep the additions and the situations of mandatory validation", () => {
    expect(proteinAdditions).toEqual({
      pregnancy_1: 1,
      pregnancy_2: 9,
      pregnancy_3: 28,
      lactation_first_6_months: 19,
      lactation_after_6_months: 13,
    });
    expect(proteinValidationSituations).toEqual([
      "pathology",
      "malnutrition",
      "other",
    ]);
  });

  it("keep Morgane's wording of the reference-weight note", () => {
    expect(proteinAdaptationLabels.reference_weight_review.fr).toBe(
      "Un poids de référence protéique différent peut devoir être évalué",
    );
  });
});

describe("the protein proposal", () => {
  it("gives 54 g/day for 65 kg and no adaptation", () => {
    expect(proteinProposal(profile())).toEqual({
      state: "computed",
      value: 54,
      referenceWeightKg: 65,
      coefficient: 0.83,
      additionGramsPerDay: 0,
      adaptations: [],
      validationRequired: false,
    });
  });

  it("gives no value and names the current weight when it is missing", () => {
    expect(proteinProposal(profile({ weightKg: null }))).toEqual({
      state: "missing",
      inputs: ["weightKg"],
    });
  });

  it("gives no value for a weight out of the range", () => {
    expect(proteinProposal(profile({ weightKg: 24 }))).toEqual({
      state: "out_of_range",
      inputs: ["weightKg"],
    });
    expect(proteinProposal(profile({ weightKg: 301 })).state).toBe(
      "out_of_range",
    );
    expect(proteinProposal(profile({ weightKg: 25 })).state).toBe("computed");
    expect(proteinProposal(profile({ weightKg: 300 })).state).toBe("computed");
  });

  it("proposes the range at 65 and applies no coefficient alone", () => {
    const proposal = computed({ age: 65 });
    expect(proposal.adaptations).toEqual(["age_65_plus"]);
    expect(proposal.coefficient).toBe(0.83);
    expect(proposal.value).toBe(54);
    expect(proposal.validationRequired).toBe(false);
  });

  it("proposes nothing for the age at 64, or with no birth date", () => {
    expect(computed({ age: 64 }).adaptations).toEqual([]);
    expect(computed({ age: null }).adaptations).toEqual([]);
  });

  it.each([
    ["pregnancy_1", 1, 55],
    ["pregnancy_2", 9, 63],
    ["pregnancy_3", 28, 82],
    ["lactation_first_6_months", 19, 73],
    ["lactation_after_6_months", 13, 67],
  ] as const)("adds the grams of %s", (specialSituation, addition, value) => {
    const proposal = computed({ specialSituation });
    expect(proposal.additionGramsPerDay).toBe(addition);
    expect(proposal.value).toBe(value);
    expect(proposal.adaptations).toEqual([specialSituation]);
    expect(proposal.validationRequired).toBe(false);
  });

  it.each(["pathology", "malnutrition", "other"] as const)(
    "marks %s as a mandatory validation and adds nothing",
    (specialSituation) => {
      const proposal = computed({ specialSituation });
      expect(proposal.validationRequired).toBe(true);
      expect(proposal.adaptations).toEqual([specialSituation]);
      expect(proposal.additionGramsPerDay).toBe(0);
      expect(proposal.value).toBe(54);
    },
  );

  it("adapts nothing for `none`, or for a key that does not exist", () => {
    expect(computed({ specialSituation: "none" }).adaptations).toEqual([]);
    expect(computed({ specialSituation: "toString" }).adaptations).toEqual([]);
  });

  it("adds the reference-weight note for a BMI under 18.5", () => {
    // 50 kg and 165 cm: BMI 18.4.
    const proposal = computed({ weightKg: 50 });
    expect(proposal.adaptations).toEqual(["reference_weight_review"]);
    expect(proposal.referenceWeightKg).toBe(50);
  });

  it("adds the note for a BMI at 25 and above, and imposes no weight", () => {
    // Story 8's example: 100 kg stays the reference weight until validation.
    const proposal = computed({ weightKg: 100, heightCm: 180 });
    expect(proposal.adaptations).toEqual(["reference_weight_review"]);
    expect(proposal.referenceWeightKg).toBe(100);
    expect(proposal.value).toBe(83);
  });

  it("adds no note when the BMI cannot be computed", () => {
    expect(computed({ heightCm: null }).adaptations).toEqual([]);
    expect(computed({ weightKg: 100, heightCm: 260 }).adaptations).toEqual([]);
  });

  it("lists the age, the situation and the note together, in that order", () => {
    const proposal = computed({
      weightKg: 100,
      heightCm: 180,
      age: 70,
      specialSituation: "malnutrition",
    });
    expect(proposal.adaptations).toEqual([
      "age_65_plus",
      "malnutrition",
      "reference_weight_review",
    ]);
    expect(proposal.validationRequired).toBe(true);
  });
});

describe("the parameters of a stored protein estimate", () => {
  it("read back what the estimate kept", () => {
    expect(
      proteinEstimateParameters({
        referenceWeightKg: 65,
        coefficient: 0.83,
        additionGramsPerDay: 9,
        adaptations: ["pregnancy_2", "reference_weight_review"],
      }),
    ).toEqual({
      referenceWeightKg: 65,
      coefficient: 0.83,
      additionGramsPerDay: 9,
      adaptations: ["pregnancy_2", "reference_weight_review"],
      validationRequired: false,
    });
  });

  it("derive the mandatory validation from the adaptations", () => {
    expect(
      proteinEstimateParameters({ adaptations: ["other"] }).validationRequired,
    ).toBe(true);
  });

  it("read null parameters as empty", () => {
    expect(proteinEstimateParameters(null)).toEqual({
      referenceWeightKg: null,
      coefficient: null,
      additionGramsPerDay: 0,
      adaptations: [],
      validationRequired: false,
    });
  });

  it("drop an adaptation that does not exist and a field of the wrong type", () => {
    expect(
      proteinEstimateParameters({
        referenceWeightKg: "65",
        coefficient: Number.NaN,
        additionGramsPerDay: null,
        adaptations: ["age_65_plus", "unknown", 3],
      }),
    ).toEqual({
      referenceWeightKg: null,
      coefficient: null,
      additionGramsPerDay: 0,
      adaptations: ["age_65_plus"],
      validationRequired: false,
    });
    expect(
      proteinEstimateParameters({ adaptations: "pathology" }).adaptations,
    ).toEqual([]);
  });
});
