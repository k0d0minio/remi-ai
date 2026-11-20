import { beforeAll, describe, expect, it } from "vitest";
import { mandatoryQuestionnaireFields } from "../../../shared/questionnaire";
import { registerDatabase } from "../../client";
import {
  createMemoryDatabase,
  practitionerActor,
  testPractitionerId,
} from "../../test-helpers";
import { systemActor } from "../access";
import { createPatient } from "../patients";
import {
  missingQuestionnaireFields,
  savePatientProfileAnswers,
  savePatientQuestionnaire,
  setPatientAllergens,
} from "./index";
import { countMissingMandatoryFields } from "./missing-counts";

const otherPractitionerId = "00000000-0000-4000-8000-000000000002";

const newPatient = async (
  pseudonym: string,
  practitionerId = testPractitionerId,
) => {
  const created = await createPatient(systemActor, {
    practitionerId,
    pseudonym,
    sex: "other",
  });
  if (!created.ok) {
    throw new Error("test patient not created");
  }
  return created.data;
};

/** Each mandatory answer of the questionnaire. */
const complete = async (patientId: string) => {
  await savePatientProfileAnswers(systemActor, patientId, {
    heightCm: 170,
    weightKg: 70,
  });
  await savePatientQuestionnaire(systemActor, patientId, {
    sexForCalculation: "female",
    activityLevel: "moderate",
    consultationReason: "fatigue",
  });
  await setPatientAllergens(systemActor, patientId, "allergy", {
    state: "declared",
    items: [{ key: "peanuts" }],
  });
  await setPatientAllergens(systemActor, patientId, "intolerance", {
    state: "none_known",
  });
};

beforeAll(() => {
  registerDatabase(createMemoryDatabase());
});

describe("countMissingMandatoryFields", () => {
  it("counts each mandatory field of an empty file", async () => {
    const patient = await newPatient("Vide");
    const counts = await countMissingMandatoryFields(practitionerActor());
    expect(counts.get(patient.id)).toBe(mandatoryQuestionnaireFields.length);
    const missing = await missingQuestionnaireFields(systemActor, patient.id);
    expect(missing.ok && missing.data.length).toBe(counts.get(patient.id));
  });

  it("agrees with the file's own list of missing fields", async () => {
    const patient = await newPatient("Partiel");
    await savePatientProfileAnswers(systemActor, patient.id, { heightCm: 170 });
    await setPatientAllergens(systemActor, patient.id, "allergy", {
      state: "declared",
      items: [{ key: "peanuts" }],
    });
    const missing = await missingQuestionnaireFields(systemActor, patient.id);
    const counts = await countMissingMandatoryFields(practitionerActor());
    expect(missing.ok && missing.data.length).toBe(counts.get(patient.id));
    expect(counts.get(patient.id)).toBe(
      mandatoryQuestionnaireFields.length - 2,
    );
  });

  it("leaves out a complete file", async () => {
    const patient = await newPatient("Complet");
    await complete(patient.id);
    const missing = await missingQuestionnaireFields(systemActor, patient.id);
    expect(missing.ok && missing.data).toEqual([]);
    const counts = await countMissingMandatoryFields(practitionerActor());
    expect(counts.has(patient.id)).toBe(false);
  });

  it("leaves out the file of another practitioner", async () => {
    const foreign = await newPatient("Ailleurs", otherPractitionerId);
    const counts = await countMissingMandatoryFields(practitionerActor());
    expect(counts.has(foreign.id)).toBe(false);
    const own = await countMissingMandatoryFields(
      practitionerActor(otherPractitionerId),
    );
    expect(own.has(foreign.id)).toBe(true);
  });
});
