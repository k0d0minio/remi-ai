import { describe, expect, it } from "vitest";
import {
  defaultProteinCoefficient,
  proteinAdaptationLabels,
  proteinAdditions,
  proteinEstimateParameters,
  proteinNeed,
  proteinProposal,
  proteinTarget,
  proteinTargetBounds,
  proteinTargetDefaults,
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

describe("the protein target", () => {
  const input = {
    referenceWeightKg: 75,
    coefficient: 1.2,
    additionGramsPerDay: 0,
    directValue: null,
  };

  it("gives 90 g/day for 75 kg at 1.2 g/kg/day, story 8's control", () => {
    expect(proteinTarget(input)).toEqual({
      state: "computed",
      value: 90,
      proposedValue: 90,
      referenceWeightKg: 75,
      coefficient: 1.2,
      additionGramsPerDay: 0,
      direct: false,
    });
  });

  it("adds the grams of the situation to the proposed value", () => {
    const target = proteinTarget({ ...input, additionGramsPerDay: 9 });
    expect(target).toMatchObject({ value: 99, proposedValue: 99 });
  });

  it("reads an addition that is negative or not a number as zero", () => {
    expect(
      proteinTarget({ ...input, additionGramsPerDay: -3 }),
    ).toMatchObject({ value: 90, additionGramsPerDay: 0 });
    expect(
      proteinTarget({ ...input, additionGramsPerDay: Number.NaN }),
    ).toMatchObject({ value: 90, additionGramsPerDay: 0 });
  });

  it("keeps a typed final value as typed, and still gives the proposal", () => {
    expect(proteinTarget({ ...input, directValue: 80 })).toMatchObject({
      state: "computed",
      value: 80,
      proposedValue: 90,
      direct: true,
    });
  });

  it("does not call a typed value direct when it is the proposed one", () => {
    expect(proteinTarget({ ...input, directValue: 90 })).toMatchObject({
      value: 90,
      direct: false,
    });
  });

  it("names each field that is empty", () => {
    expect(
      proteinTarget({ ...input, referenceWeightKg: null, coefficient: null }),
    ).toEqual({
      state: "invalid",
      fields: ["referenceWeightKg", "coefficient"],
    });
  });

  it("names a field that is out of its limits", () => {
    const { referenceWeightKg, coefficient, value } = proteinTargetBounds;
    expect(
      proteinTarget({ ...input, referenceWeightKg: referenceWeightKg.min - 1 }),
    ).toEqual({ state: "invalid", fields: ["referenceWeightKg"] });
    expect(
      proteinTarget({ ...input, referenceWeightKg: referenceWeightKg.max + 1 }),
    ).toEqual({ state: "invalid", fields: ["referenceWeightKg"] });
    expect(proteinTarget({ ...input, coefficient: 0 })).toEqual({
      state: "invalid",
      fields: ["coefficient"],
    });
    expect(
      proteinTarget({ ...input, coefficient: coefficient.max + 0.1 }),
    ).toEqual({ state: "invalid", fields: ["coefficient"] });
    expect(proteinTarget({ ...input, directValue: 0 })).toEqual({
      state: "invalid",
      fields: ["value"],
    });
    expect(proteinTarget({ ...input, directValue: value.max + 1 })).toEqual({
      state: "invalid",
      fields: ["value"],
    });
  });

  it("accepts each limit", () => {
    const { referenceWeightKg, coefficient } = proteinTargetBounds;
    expect(
      proteinTarget({
        ...input,
        referenceWeightKg: referenceWeightKg.min,
        coefficient: coefficient.min,
      }),
    ).toMatchObject({ state: "computed", value: 3 });
    expect(
      proteinTarget({
        ...input,
        referenceWeightKg: referenceWeightKg.max,
        coefficient: coefficient.max,
      }),
    ).toMatchObject({ state: "computed", value: 1500 });
  });

  it("refuses a typed value that is not a whole number of grams", () => {
    expect(proteinTarget({ ...input, directValue: 80.5 })).toEqual({
      state: "invalid",
      fields: ["value"],
    });
  });

  it("refuses a value that is not a number", () => {
    expect(
      proteinTarget({
        ...input,
        referenceWeightKg: Number.NaN,
        coefficient: Number.POSITIVE_INFINITY,
      }),
    ).toEqual({
      state: "invalid",
      fields: ["referenceWeightKg", "coefficient"],
    });
  });

  it("refuses a proposed value over the limit that the addition makes", () => {
    expect(
      proteinTarget({
        referenceWeightKg: 300,
        coefficient: 5,
        additionGramsPerDay: 28,
        directValue: null,
      }),
    ).toEqual({ state: "invalid", fields: ["value"] });
  });
});

describe("the defaults of the protein target", () => {
  const estimated = {
    estimatedValue: 83,
    estimateParameters: {
      referenceWeightKg: 100,
      coefficient: 0.83,
      additionGramsPerDay: 0,
      adaptations: [],
    },
    validatedValue: null,
    validationParameters: null,
  };

  it("give no number with no row, or with a row that has no value", () => {
    expect(proteinTargetDefaults(null)).toBeNull();
    expect(
      proteinTargetDefaults({
        estimatedValue: null,
        estimateParameters: null,
        validatedValue: null,
        validationParameters: null,
      }),
    ).toBeNull();
  });

  it("give no number for an estimate that kept no parameters", () => {
    expect(
      proteinTargetDefaults({ ...estimated, estimateParameters: null }),
    ).toBeNull();
  });

  it("open with the estimate while nothing is validated", () => {
    expect(proteinTargetDefaults(estimated)).toEqual({
      referenceWeightKg: 100,
      coefficient: 0.83,
      additionGramsPerDay: 0,
      value: 83,
      direct: false,
    });
  });

  it("open with the validated value and its own parameters", () => {
    expect(
      proteinTargetDefaults({
        ...estimated,
        validatedValue: 90,
        validationParameters: {
          referenceWeightKg: 75,
          coefficient: 1.2,
          additionGramsPerDay: 0,
          direct: false,
        },
      }),
    ).toEqual({
      referenceWeightKg: 75,
      coefficient: 1.2,
      additionGramsPerDay: 0,
      value: 90,
      direct: false,
    });
  });

  it("keep the mark of a typed value, and the addition of the estimate", () => {
    expect(
      proteinTargetDefaults({
        estimatedValue: 92,
        estimateParameters: {
          referenceWeightKg: 100,
          coefficient: 0.83,
          additionGramsPerDay: 9,
        },
        validatedValue: 80,
        validationParameters: {
          referenceWeightKg: 75,
          coefficient: 1.2,
          additionGramsPerDay: 1,
          direct: true,
        },
      }),
    ).toEqual({
      referenceWeightKg: 75,
      coefficient: 1.2,
      additionGramsPerDay: 9,
      value: 80,
      direct: true,
    });
  });

  it("open with the validated parameters when the estimate is cleared", () => {
    expect(
      proteinTargetDefaults({
        estimatedValue: null,
        estimateParameters: null,
        validatedValue: 99,
        validationParameters: {
          referenceWeightKg: 75,
          coefficient: 1.2,
          additionGramsPerDay: 9,
          direct: false,
        },
      }),
    ).toMatchObject({ additionGramsPerDay: 9, value: 99 });
  });

  it("fall back on the estimate when the validation kept no parameters", () => {
    expect(
      proteinTargetDefaults({
        ...estimated,
        validatedValue: 90,
        validationParameters: {},
      }),
    ).toMatchObject({ referenceWeightKg: 100, value: 83, direct: false });
  });
});
