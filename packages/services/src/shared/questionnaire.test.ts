import { describe, expect, it } from "vitest";
import {
  mandatoryQuestionnaireFieldLabels,
  mandatoryQuestionnaireFields,
  missingMandatoryFields,
  type QuestionnaireCompleteness,
} from "./questionnaire";

const complete: QuestionnaireCompleteness = {
  sexForCalculation: "female",
  heightCm: 165,
  weightKg: 60,
  activityLevel: "moderate",
  consultationReason: "Fatigue",
  noKnownAllergies: true,
  noKnownIntolerances: false,
  allergyCount: 0,
  intoleranceCount: 2,
};

describe("the mandatory questionnaire fields", () => {
  it("labels each field in French and English", () => {
    for (const field of mandatoryQuestionnaireFields) {
      expect(mandatoryQuestionnaireFieldLabels[field].fr).not.toBe("");
      expect(mandatoryQuestionnaireFieldLabels[field].en).not.toBe("");
    }
  });

  it("misses nothing on a complete answer", () => {
    expect(missingMandatoryFields(complete)).toEqual([]);
  });

  it("counts a blank reason as missing", () => {
    expect(
      missingMandatoryFields({ ...complete, consultationReason: "  " }),
    ).toEqual(["consultationReason"]);
  });

  it("needs an explicit answer per list", () => {
    expect(
      missingMandatoryFields({
        ...complete,
        noKnownAllergies: null,
        noKnownIntolerances: false,
        intoleranceCount: 0,
      }),
    ).toEqual(["allergies", "intolerances"]);
    expect(
      missingMandatoryFields({
        ...complete,
        noKnownAllergies: false,
        allergyCount: 1,
      }),
    ).toEqual([]);
  });

  it("lists the missing fields in the list's order", () => {
    expect(
      missingMandatoryFields({
        ...complete,
        activityLevel: null,
        heightCm: null,
        sexForCalculation: null,
      }),
    ).toEqual(["sexForCalculation", "heightCm", "activityLevel"]);
  });
});
