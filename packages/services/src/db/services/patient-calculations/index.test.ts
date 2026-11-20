import { beforeAll, describe, expect, it } from "vitest";
import { getDatabase, registerDatabase } from "../../client";
import type { AuditEvent } from "../../models/audit-event";
import { createMemoryDatabase, testPractitionerId } from "../../test-helpers";
import { operatorActor, systemActor } from "../access";
import { savePatientProfileAnswers } from "../patient-questionnaire";
import { createPatient, updatePatient } from "../patients";
import {
  listPatientCalculations,
  refreshProteinEstimate,
  setCalculationEstimate,
  validateCalculation,
} from "./index";

const practitioner = {
  id: testPractitionerId,
  email: "morgane@example.test",
  name: "Morgane",
};

const otherPractitioner = operatorActor({
  id: "00000000-0000-4000-8000-000000000002",
  role: "practitioner",
});

let patientId: string;

beforeAll(async () => {
  registerDatabase(createMemoryDatabase());
  const created = await createPatient(systemActor, {
    practitionerId: testPractitionerId,
    pseudonym: "Claire",
  });
  if (!created.ok) {
    throw new Error("test patient not created");
  }
  patientId = created.data.id;
});

const bmiEstimate = {
  value: 23.9,
  parameters: { heightCm: 165, weightKg: 65 },
};

describe("the calculations of a patient", () => {
  it("start empty", async () => {
    expect(await listPatientCalculations(systemActor, patientId)).toEqual([]);
  });

  it("write an estimate into one row per kind", async () => {
    const first = await setCalculationEstimate(
      systemActor,
      patientId,
      "bmi",
      bmiEstimate,
    );
    const second = await setCalculationEstimate(systemActor, patientId, "bmi", {
      value: 24.2,
      parameters: { heightCm: 165, weightKg: 66 },
    });
    expect(first.ok && second.ok).toBe(true);
    const rows = await listPatientCalculations(systemActor, patientId);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.kind).toBe("bmi");
    expect(rows[0]?.estimatedValue).toBe(24.2);
    expect(rows[0]?.estimateParameters).toEqual({
      heightCm: 165,
      weightKg: 66,
    });
    expect(rows[0]?.estimatedAt).toBeInstanceOf(Date);
  });

  it("keep the validated value apart from the estimate", async () => {
    const estimated = await setCalculationEstimate(
      systemActor,
      patientId,
      "protein",
      { value: 54, parameters: { referenceWeightKg: 65, coefficient: 0.83 } },
    );
    expect(estimated.ok).toBe(true);

    const validated = await validateCalculation(
      systemActor,
      patientId,
      "protein",
      { value: 60, parameters: { referenceWeightKg: 65, coefficient: 0.92 } },
      practitioner,
    );
    expect(validated.ok).toBe(true);
    if (validated.ok) {
      expect(validated.data.estimatedValue).toBe(54);
      expect(validated.data.validatedValue).toBe(60);
      expect(validated.data.validatedBy).toBe(practitioner.id);
    }

    const reestimated = await setCalculationEstimate(
      systemActor,
      patientId,
      "protein",
      { value: 55, parameters: { referenceWeightKg: 66, coefficient: 0.83 } },
    );
    expect(reestimated.ok).toBe(true);
    if (reestimated.ok) {
      expect(reestimated.data.estimatedValue).toBe(55);
      expect(reestimated.data.validatedValue).toBe(60);
      expect(reestimated.data.validationParameters).toEqual({
        referenceWeightKg: 65,
        coefficient: 0.92,
      });
    }
  });

  it("record the validation with its parameters in the audit trail", async () => {
    const events = getDatabase().collection<AuditEvent>("audit_events");
    const [event] = (await events.findMany({ action: "calculation.validated" }))
      .items;
    expect(event?.targetId).toBe(patientId);
    expect(event?.actorEmail).toBe(practitioner.email);
    expect(JSON.parse(event?.detail ?? "{}")).toEqual({
      kind: "protein",
      value: 60,
      parameters: { referenceWeightKg: 65, coefficient: 0.92 },
    });
  });

  it("record no audit event for an estimate", async () => {
    const events = getDatabase().collection<AuditEvent>("audit_events");
    const all = (await events.findMany({ targetId: patientId })).items;
    expect(
      all.filter((event) => event.action === "calculation.validated"),
    ).toHaveLength(1);
  });

  it("clear an estimate with null and keep the validated value", async () => {
    const cleared = await setCalculationEstimate(
      systemActor,
      patientId,
      "protein",
      null,
    );
    expect(cleared.ok).toBe(true);
    if (cleared.ok) {
      expect(cleared.data.estimatedValue).toBeNull();
      expect(cleared.data.estimateParameters).toBeNull();
      expect(cleared.data.estimatedAt).toBeNull();
      expect(cleared.data.validatedValue).toBe(60);
    }
  });

  it("list the rows in the order of the kinds", async () => {
    await setCalculationEstimate(systemActor, patientId, "energy", {
      value: 2152,
      parameters: {},
    });
    const rows = await listPatientCalculations(systemActor, patientId);
    expect(rows.map((row) => row.kind)).toEqual(["bmi", "protein", "energy"]);
  });

  it("refuse a kind or a value that does not exist", async () => {
    const kind = await setCalculationEstimate(
      systemActor,
      patientId,
      "weight" as "bmi",
      bmiEstimate,
    );
    expect(kind.ok).toBe(false);
    const value = await setCalculationEstimate(systemActor, patientId, "bmi", {
      value: Number.NaN,
      parameters: {},
    });
    expect(value.ok).toBe(false);
  });

  it("answer another practitioner as a missing file", async () => {
    expect(await listPatientCalculations(otherPractitioner, patientId)).toEqual(
      [],
    );
    const write = await setCalculationEstimate(
      otherPractitioner,
      patientId,
      "bmi",
      bmiEstimate,
    );
    expect(write.ok).toBe(false);
    if (!write.ok) {
      expect(write.error).toBe("not_found");
    }
    const validation = await validateCalculation(
      otherPractitioner,
      patientId,
      "bmi",
      bmiEstimate,
      practitioner,
    );
    expect(validation.ok).toBe(false);
  });
});

describe("the BMI estimate", () => {
  let measuredId: string;

  const bmiRow = async () =>
    (await listPatientCalculations(systemActor, measuredId)).find(
      (row) => row.kind === "bmi",
    );

  beforeAll(async () => {
    const created = await createPatient(systemActor, {
      practitionerId: testPractitionerId,
      pseudonym: "Inès",
      heightCm: 165,
      weightKg: 65,
    });
    if (!created.ok) {
      throw new Error("test patient not created");
    }
    measuredId = created.data.id;
  });

  it("is written when a file starts with a height and a weight", async () => {
    const row = await bmiRow();
    expect(row?.estimatedValue).toBe(23.9);
    expect(row?.estimateParameters).toEqual({ heightCm: 165, weightKg: 65 });
  });

  it("is not written for a file with no measure", async () => {
    const bare = await createPatient(systemActor, {
      practitionerId: testPractitionerId,
      pseudonym: "Louise",
    });
    if (!bare.ok) {
      throw new Error("test patient not created");
    }
    expect(await listPatientCalculations(systemActor, bare.data.id)).toEqual(
      [],
    );
  });

  it("stays as it is on a save of any other field", async () => {
    const before = await bmiRow();
    const saved = await updatePatient(systemActor, measuredId, {
      objective: "Retrouver de l'énergie",
      heightCm: 165,
      weightKg: 65,
    });
    expect(saved.ok).toBe(true);
    const after = await bmiRow();
    expect(after?.estimatedAt).toEqual(before?.estimatedAt);
    expect(after?.updatedAt).toEqual(before?.updatedAt);
  });

  it("is computed again on a save of the weight", async () => {
    const saved = await updatePatient(systemActor, measuredId, {
      weightKg: 72,
    });
    expect(saved.ok).toBe(true);
    expect((await bmiRow())?.estimatedValue).toBe(26.4);
  });

  it("is computed again on the patient's save of the height", async () => {
    const saved = await savePatientProfileAnswers(systemActor, measuredId, {
      heightCm: 170,
    });
    expect(saved.ok).toBe(true);
    const row = await bmiRow();
    expect(row?.estimatedValue).toBe(24.9);
    expect(row?.estimateParameters).toEqual({ heightCm: 170, weightKg: 72 });
  });

  it("is cleared when the height goes, or leaves the range", async () => {
    await savePatientProfileAnswers(systemActor, measuredId, {
      heightCm: null,
    });
    expect((await bmiRow())?.estimatedValue).toBeNull();
    await savePatientProfileAnswers(systemActor, measuredId, {
      heightCm: 260,
    });
    expect((await bmiRow())?.estimatedValue).toBeNull();
  });
});

describe("the protein estimate", () => {
  let weighedId: string;

  const proteinRow = async () =>
    (await listPatientCalculations(systemActor, weighedId)).find(
      (row) => row.kind === "protein",
    );

  const setSpecialSituation = async (specialSituation: string | null) => {
    await getDatabase()
      .collection<{ id: string; specialSituation: string | null }>(
        "patient_profiles",
      )
      .update(weighedId, { specialSituation });
    await refreshProteinEstimate(weighedId);
  };

  beforeAll(async () => {
    const created = await createPatient(systemActor, {
      practitionerId: testPractitionerId,
      pseudonym: "Jeanne",
      heightCm: 165,
      weightKg: 65,
    });
    if (!created.ok) {
      throw new Error("test patient not created");
    }
    weighedId = created.data.id;
  });

  it("is written with its parameters when a file starts with a weight", async () => {
    const row = await proteinRow();
    expect(row?.estimatedValue).toBe(54);
    expect(row?.estimateParameters).toEqual({
      referenceWeightKg: 65,
      coefficient: 0.83,
      additionGramsPerDay: 0,
      adaptations: [],
    });
    expect(row?.validatedValue).toBeNull();
  });

  it("is computed again on a save of the weight, with the BMI note", async () => {
    const saved = await updatePatient(systemActor, weighedId, {
      weightKg: 72,
    });
    expect(saved.ok).toBe(true);
    const row = await proteinRow();
    expect(row?.estimatedValue).toBe(60);
    expect(row?.estimateParameters).toMatchObject({
      referenceWeightKg: 72,
      adaptations: ["reference_weight_review"],
    });
  });

  it("stays as it is on a save of any other field", async () => {
    const before = await proteinRow();
    const saved = await updatePatient(systemActor, weighedId, {
      objective: "Retrouver de l'énergie",
      weightKg: 72,
    });
    expect(saved.ok).toBe(true);
    expect((await proteinRow())?.updatedAt).toEqual(before?.updatedAt);
  });

  it("proposes the range from 65 on a save of the birth date", async () => {
    const saved = await updatePatient(systemActor, weighedId, {
      birthDate: "1950-01-01",
    });
    expect(saved.ok).toBe(true);
    const row = await proteinRow();
    expect(row?.estimatedValue).toBe(60);
    expect(row?.estimateParameters).toMatchObject({
      coefficient: 0.83,
      adaptations: ["age_65_plus", "reference_weight_review"],
    });
  });

  it("adds the grams of the special situation", async () => {
    await setSpecialSituation("pregnancy_2");
    const row = await proteinRow();
    expect(row?.estimatedValue).toBe(69);
    expect(row?.estimateParameters).toMatchObject({
      additionGramsPerDay: 9,
      adaptations: ["age_65_plus", "pregnancy_2", "reference_weight_review"],
    });
    await setSpecialSituation(null);
    expect((await proteinRow())?.estimatedValue).toBe(60);
  });

  it("is cleared when the weight goes, on the patient's save", async () => {
    const saved = await savePatientProfileAnswers(systemActor, weighedId, {
      weightKg: null,
    });
    expect(saved.ok).toBe(true);
    const row = await proteinRow();
    expect(row?.estimatedValue).toBeNull();
    expect(row?.estimateParameters).toBeNull();
  });

  it("is not written for a file with no weight", async () => {
    const bare = await createPatient(systemActor, {
      practitionerId: testPractitionerId,
      pseudonym: "Odile",
      heightCm: 170,
    });
    if (!bare.ok) {
      throw new Error("test patient not created");
    }
    const rows = await listPatientCalculations(systemActor, bare.data.id);
    expect(rows.find((row) => row.kind === "protein")).toBeUndefined();
  });
});
