import { describe, expect, it } from "vitest";
import { calculationInputLabels } from "./calculations";
import {
  energyEstimateParameters,
  energyNeed,
  energyProposal,
  energyTarget,
  energyTargetBounds,
  energyTargetDefaults,
  energyTargetParameters,
  type EnergyTargetInput,
  restingMetabolism,
  restingMetabolismSexConstants,
  type EnergyProfile,
} from "./energy";
import { activityLevelDetails, activityLevels } from "./questionnaire";

/** Story 9's control: female, 35, 165 cm, 65 kg, moderate. */
const profile = (patch: Partial<EnergyProfile> = {}): EnergyProfile => ({
  sexForCalculation: "female",
  ageYears: 35,
  heightCm: 165,
  weightKg: 65,
  activityLevel: "moderate",
  ...patch,
});

const computed = (patch: Partial<EnergyProfile> = {}) => {
  const proposal = energyProposal(profile(patch));
  if (proposal.state !== "computed") {
    throw new Error("the proposal did not compute");
  }
  return proposal;
};

describe("the resting metabolism", () => {
  it("gives 1 345 kcal for the female control of story 9", () => {
    const value = restingMetabolism({
      sex: "female",
      weightKg: 65,
      heightCm: 165,
      ageYears: 35,
    });
    expect(value).toBeCloseTo(1345.25, 6);
    expect(Math.round(value)).toBe(1345);
  });

  it("gives 1 730 kcal for the male control", () => {
    const value = restingMetabolism({
      sex: "male",
      weightKg: 80,
      heightCm: 180,
      ageYears: 40,
    });
    expect(value).toBeCloseTo(1730, 6);
  });

  it("differs by 166 kcal between the two sexes on the same data", () => {
    const data = { weightKg: 70, heightCm: 170, ageYears: 50 };
    expect(
      restingMetabolism({ sex: "male", ...data }) -
        restingMetabolism({ sex: "female", ...data }),
    ).toBeCloseTo(166, 6);
    expect(restingMetabolismSexConstants).toEqual({ female: -161, male: 5 });
  });

  it("is not rounded", () => {
    expect(
      restingMetabolism({
        sex: "female",
        weightKg: 65.4,
        heightCm: 165,
        ageYears: 35,
      }),
    ).toBeCloseTo(1349.25, 6);
  });
});

describe("the energy need", () => {
  it("keeps the four NAP coefficients of story 9", () => {
    expect(
      activityLevels.map((level) => activityLevelDetails[level].nap),
    ).toEqual([1.4, 1.6, 1.8, 2.0]);
  });

  it("keeps Morgane's French description of each level", () => {
    for (const level of activityLevels) {
      expect(activityLevelDetails[level].label.fr).not.toBe("");
      expect(activityLevelDetails[level].description.fr).not.toBe("");
    }
  });

  it.each([
    ["low", 1883.35],
    ["moderate", 2152.4],
    ["high", 2421.45],
    ["very_high", 2690.5],
  ] as const)("multiplies the resting metabolism at %s", (level, expected) => {
    expect(energyNeed(1345.25, level)).toBeCloseTo(expected, 6);
  });

  it("gives 2 152 kcal/day for the female control", () => {
    expect(Math.round(computed().value)).toBe(2152);
  });

  it("gives 2 422 kcal/day for the male control", () => {
    const proposal = computed({
      sexForCalculation: "male",
      ageYears: 40,
      heightCm: 180,
      weightKg: 80,
      activityLevel: "low",
    });
    expect(Math.round(proposal.restingMetabolism)).toBe(1730);
    expect(Math.round(proposal.value)).toBe(2422);
  });
});

describe("the energy proposal", () => {
  it("keeps the sex, the age, the height, the weight and the NAP used", () => {
    expect(computed()).toMatchObject({
      sexForCalculation: "female",
      ageYears: 35,
      heightCm: 165,
      weightKg: 65,
      activityLevel: "moderate",
      nap: 1.6,
    });
  });

  it.each(activityLevels)("computes at the level %s", (level) => {
    const proposal = computed({ activityLevel: level });
    expect(proposal.nap).toBe(activityLevelDetails[level].nap);
    expect(proposal.value).toBeCloseTo(
      1345.25 * activityLevelDetails[level].nap,
      6,
    );
  });

  it.each([
    ["sexForCalculation", { sexForCalculation: null }],
    ["age", { ageYears: null }],
    ["heightCm", { heightCm: null }],
    ["weightKg", { weightKg: null }],
    ["activityLevel", { activityLevel: null }],
  ] as const)("gives no number when %s is missing", (input, patch) => {
    expect(energyProposal(profile(patch))).toEqual({
      state: "missing",
      inputs: [input],
    });
  });

  it("names the activity level as Morgane's text does", () => {
    expect(calculationInputLabels.activityLevel.fr).toBe(
      "niveau d'activité physique",
    );
    expect(calculationInputLabels.sexForCalculation.fr).toBe(
      "sexe utilisé pour le calcul",
    );
  });

  it("names every missing datum, in the order of the calculation", () => {
    expect(
      energyProposal({
        sexForCalculation: null,
        ageYears: null,
        heightCm: null,
        weightKg: null,
        activityLevel: null,
      }),
    ).toEqual({
      state: "missing",
      inputs: [
        "sexForCalculation",
        "age",
        "heightCm",
        "weightKg",
        "activityLevel",
      ],
    });
  });

  it("gives no number for a sex other than female or male", () => {
    for (const sex of ["other", "unspecified", ""]) {
      expect(energyProposal(profile({ sexForCalculation: sex }))).toEqual({
        state: "missing",
        inputs: ["sexForCalculation"],
      });
    }
  });

  it("gives no number for an activity level that does not exist", () => {
    expect(energyProposal(profile({ activityLevel: "extreme" }))).toEqual({
      state: "missing",
      inputs: ["activityLevel"],
    });
  });

  it("gives no number for a height or a weight out of range", () => {
    expect(energyProposal(profile({ heightCm: 16.5 }))).toEqual({
      state: "out_of_range",
      inputs: ["heightCm"],
    });
    expect(energyProposal(profile({ weightKg: 650 }))).toEqual({
      state: "out_of_range",
      inputs: ["weightKg"],
    });
  });
});

describe("the parameters of a stored energy estimate", () => {
  it("read back what the proposal gave", () => {
    const proposal = computed();
    const parameters = {
      restingMetabolism: proposal.restingMetabolism,
      sexForCalculation: proposal.sexForCalculation,
      ageYears: proposal.ageYears,
      heightCm: proposal.heightCm,
      weightKg: proposal.weightKg,
      activityLevel: proposal.activityLevel,
      nap: proposal.nap,
    };
    expect(energyEstimateParameters(parameters)).toEqual(parameters);
  });

  it("read a missing or malformed field as null", () => {
    expect(energyEstimateParameters(null)).toEqual({
      restingMetabolism: null,
      sexForCalculation: null,
      ageYears: null,
      heightCm: null,
      weightKg: null,
      activityLevel: null,
      nap: null,
    });
    expect(
      energyEstimateParameters({
        restingMetabolism: "1345",
        sexForCalculation: "other",
        activityLevel: 2,
        nap: Number.NaN,
      }),
    ).toMatchObject({
      restingMetabolism: null,
      sexForCalculation: null,
      activityLevel: null,
      nap: null,
    });
  });
});

describe("the calorie target", () => {
  const input = (patch: Partial<EnergyTargetInput> = {}): EnergyTargetInput => ({
    estimateKcalPerDay: 2300,
    goal: "weight_loss",
    specialSituation: null,
    entry: "value",
    amount: 2000,
    ...patch,
  });

  it("keeps a typed 2 000 kcal/day against an estimate of 2 300", () => {
    expect(energyTarget(input())).toEqual({
      state: "computed",
      value: 2000,
      estimatedNeed: 2300,
      difference: -300,
      goal: "weight_loss",
      specialSituation: null,
      entry: "value",
    });
  });

  it("gives 2 000 kcal/day for a difference of − 300 against 2 300", () => {
    const target = energyTarget(input({ entry: "difference", amount: -300 }));
    expect(target).toMatchObject({
      state: "computed",
      value: 2000,
      difference: -300,
      entry: "difference",
    });
  });

  it("adds the difference to the estimate as the screen rounds it", () => {
    const target = energyTarget(
      input({ estimateKcalPerDay: 2152.4, entry: "difference", amount: 0 }),
    );
    expect(target).toMatchObject({
      state: "computed",
      value: 2152,
      estimatedNeed: 2152,
      difference: 0,
    });
  });

  it("takes a target above, equal to or below the estimate", () => {
    for (const amount of [2600, 2300, 1800]) {
      expect(energyTarget(input({ amount }))).toMatchObject({
        state: "computed",
        value: amount,
        difference: amount - 2300,
      });
    }
  });

  it("gives no target for a weight-loss goal with no typed amount", () => {
    for (const entry of ["value", "difference"]) {
      expect(energyTarget(input({ entry, amount: null }))).toEqual({
        state: "invalid",
        fields: ["amount"],
      });
    }
  });

  it("gives the same value for each goal and each situation", () => {
    for (const goal of ["maintenance", "weight_loss", "weight_gain", "muscle_gain"]) {
      for (const specialSituation of [null, "none", "pregnancy_2", "pathology"]) {
        expect(energyTarget(input({ goal, specialSituation }))).toMatchObject({
          state: "computed",
          value: 2000,
          goal,
          specialSituation,
        });
      }
    }
  });

  it("gives no target with no estimate", () => {
    for (const estimateKcalPerDay of [null, 0, Number.NaN]) {
      expect(energyTarget(input({ estimateKcalPerDay }))).toEqual({
        state: "invalid",
        fields: ["estimate"],
      });
    }
  });

  it("names a goal, a situation and an entry that do not exist", () => {
    expect(
      energyTarget(input({ goal: null, specialSituation: "flu", entry: "ratio" })),
    ).toEqual({
      state: "invalid",
      fields: ["goal", "specialSituation", "entry", "amount"],
    });
    expect(energyTarget(input({ goal: "diet" }))).toEqual({
      state: "invalid",
      fields: ["goal"],
    });
  });

  it("refuses an amount out of its limits or not whole", () => {
    const { value, difference } = energyTargetBounds;
    const refused: Partial<EnergyTargetInput>[] = [
      { amount: value.min - 1 },
      { amount: value.max + 1 },
      { amount: 2000.5 },
      { amount: Number.NaN },
      { entry: "difference", amount: difference.min - 1 },
      { entry: "difference", amount: difference.max + 1 },
      // 900 − 500 is under the lowest target.
      { estimateKcalPerDay: 900, entry: "difference", amount: -500 },
    ];
    for (const patch of refused) {
      expect(energyTarget(input(patch))).toEqual({
        state: "invalid",
        fields: ["amount"],
      });
    }
    expect(energyTarget(input({ amount: value.min }))).toMatchObject({
      state: "computed",
    });
    expect(energyTarget(input({ amount: value.max }))).toMatchObject({
      state: "computed",
    });
  });

  it("reads stored parameters field by field", () => {
    expect(
      energyTargetParameters({
        goal: "muscle_gain",
        specialSituation: "none",
        entry: "difference",
        estimatedNeed: 2300,
        difference: 200,
      }),
    ).toEqual({
      goal: "muscle_gain",
      specialSituation: "none",
      entry: "difference",
      estimatedNeed: 2300,
      difference: 200,
    });
    expect(
      energyTargetParameters({ goal: "diet", entry: 3, difference: "200" }),
    ).toEqual({
      goal: null,
      specialSituation: null,
      entry: null,
      estimatedNeed: null,
      difference: null,
    });
    expect(energyTargetParameters(null).goal).toBeNull();
  });

  it("opens the detail empty with no validated target", () => {
    const empty = {
      goal: null,
      specialSituation: null,
      entry: "value",
      amount: null,
    };
    expect(energyTargetDefaults(null)).toEqual(empty);
    expect(
      energyTargetDefaults({ validatedValue: null, validationParameters: null }),
    ).toEqual(empty);
  });

  it("opens the detail with what the practitioner typed", () => {
    expect(
      energyTargetDefaults({
        validatedValue: 2000,
        validationParameters: {
          goal: "weight_loss",
          specialSituation: "none",
          entry: "value",
          estimatedNeed: 2300,
          difference: -300,
        },
      }),
    ).toEqual({
      goal: "weight_loss",
      specialSituation: "none",
      entry: "value",
      amount: 2000,
    });
    expect(
      energyTargetDefaults({
        validatedValue: 2000,
        validationParameters: {
          goal: "weight_loss",
          entry: "difference",
          estimatedNeed: 2300,
          difference: -300,
        },
      }),
    ).toMatchObject({ entry: "difference", amount: -300 });
  });
});
