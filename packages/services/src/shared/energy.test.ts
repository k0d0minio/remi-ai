import { describe, expect, it } from "vitest";
import { calculationInputLabels } from "./calculations";
import {
  energyEstimateParameters,
  energyNeed,
  energyProposal,
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
