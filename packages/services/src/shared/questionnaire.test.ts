import { describe, expect, it } from "vitest";
import {
  mandatoryQuestionnaireFieldLabels,
  mandatoryQuestionnaireFields,
  missingBySection,
  missingMandatoryFields,
  missingOptionalFields,
  optionalQuestionnaireFieldLabels,
  optionalQuestionnaireFields,
  questionnaireSections,
  sectionOfMandatoryField,
  type OptionalQuestionnaireAnswers,
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

const emptyOptional: OptionalQuestionnaireAnswers = {
  birthDate: null,
  phone: null,
  desiredWeightKg: null,
  consultationDate: null,
  diet: null,
  dietNote: null,
  celiacDisease: null,
  pathologies: null,
  medications: "",
  supplements: "",
  geneticTest: null,
  apoe: null,
  dio2: null,
  amy1a: null,
  genotypeOpen: false,
};

describe("the optional questionnaire fields", () => {
  it("labels each field in French and English", () => {
    for (const field of optionalQuestionnaireFields) {
      expect(optionalQuestionnaireFieldLabels[field].fr).not.toBe("");
      expect(optionalQuestionnaireFieldLabels[field].en).not.toBe("");
    }
  });

  it("shares no field with the mandatory list", () => {
    const mandatory: readonly string[] = mandatoryQuestionnaireFields;
    for (const field of optionalQuestionnaireFields) {
      expect(mandatory).not.toContain(field);
    }
  });

  it("lists every asked field of an empty file, in order", () => {
    expect(missingOptionalFields(emptyOptional)).toEqual([
      "birthDate",
      "phone",
      "desiredWeightKg",
      "consultationDate",
      "diet",
      "celiacDisease",
      "pathologies",
      "medications",
      "supplements",
      "geneticTest",
    ]);
  });

  it("asks the diet note only after « Autre »", () => {
    expect(
      missingOptionalFields({ ...emptyOptional, diet: "vegan" }),
    ).not.toContain("dietNote");
    expect(
      missingOptionalFields({ ...emptyOptional, diet: "other" }),
    ).toContain("dietNote");
  });

  it("asks the genotype only after « Oui » and under the consent", () => {
    const yes = { ...emptyOptional, geneticTest: "yes" };
    expect(missingOptionalFields(yes)).not.toContain("apoe");
    expect(
      missingOptionalFields({ ...yes, genotypeOpen: true }).slice(-3),
    ).toEqual(["apoe", "dio2", "amy1a"]);
    expect(
      missingOptionalFields({
        ...emptyOptional,
        geneticTest: "no_or_unknown",
        genotypeOpen: true,
      }),
    ).not.toContain("apoe");
  });

  it("counts false and zero as answers, blank text as none", () => {
    const missing = missingOptionalFields({
      ...emptyOptional,
      celiacDisease: false,
      pathologies: "   ",
    });
    expect(missing).not.toContain("celiacDisease");
    expect(missing).toContain("pathologies");
  });
});

describe("the questionnaire sections", () => {
  it("gives each mandatory field a section of the list", () => {
    for (const field of mandatoryQuestionnaireFields) {
      expect(questionnaireSections).toContain(sectionOfMandatoryField[field]);
    }
  });

  it("groups the missing fields by section, in the list's order", () => {
    expect(
      missingBySection(["intolerances", "weightKg", "sexForCalculation"]),
    ).toEqual({
      identite: [],
      profil: ["sexForCalculation", "weightKg"],
      consultation: [],
      alimentation: ["intolerances"],
      sante: [],
      genetique: [],
    });
  });

  it("gives every section an empty list when nothing is missing", () => {
    const bySection = missingBySection([]);
    for (const section of questionnaireSections) {
      expect(bySection[section]).toEqual([]);
    }
  });
});
