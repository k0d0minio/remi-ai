import { beforeAll, describe, expect, it } from "vitest";
import { getDatabase, registerDatabase } from "../../client";
import type { AuditEvent } from "../../models/audit-event";
import { createMemoryDatabase, testPractitionerId } from "../../test-helpers";
import { operatorActor, systemActor } from "../access";
import {
  savePatientProfileAnswers,
  savePatientQuestionnaire,
} from "../patient-questionnaire";
import { createPatient, updatePatient } from "../patients";
import {
  computePatientEstimates,
  listPatientCalculations,
  refreshProteinEstimate,
  setCalculationEstimate,
  validateCalculation,
  validateEnergyTarget,
  validateProteinTarget,
  type EnergyTargetValidation,
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

describe("the energy estimate", () => {
  let fileId: string;

  /** Born on 1 January, 35 years before this year: 35 on any day of the year. */
  const birthDate = `${new Date().getUTCFullYear() - 35}-01-01`;

  const energyRow = async () =>
    (await listPatientCalculations(systemActor, fileId)).find(
      (row) => row.kind === "energy",
    );

  beforeAll(async () => {
    const created = await createPatient(systemActor, {
      practitionerId: testPractitionerId,
      pseudonym: "Lucie",
      heightCm: 165,
      weightKg: 65,
    });
    if (!created.ok) {
      throw new Error("test patient not created");
    }
    fileId = created.data.id;
  });

  it("is not written while a datum is missing", async () => {
    expect(await energyRow()).toBeUndefined();
    const dated = await updatePatient(systemActor, fileId, { birthDate });
    expect(dated.ok).toBe(true);
    const sexed = await savePatientQuestionnaire(systemActor, fileId, {
      sexForCalculation: "female",
    });
    expect(sexed.ok).toBe(true);
    expect(await energyRow()).toBeUndefined();
  });

  it("is written with its parameters on a save of the last datum", async () => {
    const saved = await savePatientQuestionnaire(systemActor, fileId, {
      activityLevel: "moderate",
    });
    expect(saved.ok).toBe(true);
    const row = await energyRow();
    expect(row?.estimatedValue).toBeCloseTo(2152.4, 6);
    expect(row?.estimateParameters).toMatchObject({
      sexForCalculation: "female",
      ageYears: 35,
      heightCm: 165,
      weightKg: 65,
      activityLevel: "moderate",
      nap: 1.6,
    });
    expect(row?.estimateParameters?.restingMetabolism).toBeCloseTo(1345.25, 6);
    expect(row?.validatedValue).toBeNull();
  });

  it("is computed again on a save of the current weight", async () => {
    const saved = await updatePatient(systemActor, fileId, { weightKg: 80 });
    expect(saved.ok).toBe(true);
    const row = await energyRow();
    expect(row?.estimatedValue).toBeCloseTo(2392.4, 6);
    expect(row?.estimateParameters).toMatchObject({ weightKg: 80 });
  });

  it("is computed again on a save of the activity level", async () => {
    const saved = await savePatientQuestionnaire(systemActor, fileId, {
      activityLevel: "high",
    });
    expect(saved.ok).toBe(true);
    const row = await energyRow();
    expect(row?.estimatedValue).toBeCloseTo(2691.45, 6);
    expect(row?.estimateParameters).toMatchObject({
      activityLevel: "high",
      nap: 1.8,
    });
  });

  it("stays as it is when the protein reference weight changes", async () => {
    const before = await energyRow();
    const validated = await validateCalculation(
      systemActor,
      fileId,
      "protein",
      { value: 60, parameters: { referenceWeightKg: 60, coefficient: 1 } },
      practitioner,
    );
    expect(validated.ok).toBe(true);
    const after = await energyRow();
    expect(after?.estimatedValue).toBe(before?.estimatedValue);
    expect(after?.estimateParameters).toEqual(before?.estimateParameters);
    expect(after?.updatedAt).toEqual(before?.updatedAt);
  });

  it("stays as it is on a save of any other field", async () => {
    const before = await energyRow();
    const saved = await savePatientQuestionnaire(systemActor, fileId, {
      consultationReason: "Fatigue",
      activityLevel: "high",
    });
    expect(saved.ok).toBe(true);
    expect((await energyRow())?.updatedAt).toEqual(before?.updatedAt);
  });

  it("is cleared when the activity level goes", async () => {
    const saved = await savePatientQuestionnaire(systemActor, fileId, {
      activityLevel: null,
    });
    expect(saved.ok).toBe(true);
    const row = await energyRow();
    expect(row?.estimatedValue).toBeNull();
    expect(row?.estimateParameters).toBeNull();
  });
});

describe("the protein target", () => {
  let fileId: string;

  const rows = async () => listPatientCalculations(systemActor, fileId);

  const proteinRow = async () =>
    (await rows()).find((row) => row.kind === "protein");

  const profile = async () =>
    getDatabase()
      .collection<{ id: string; weightKg: number | null }>("patient_profiles")
      .findById(fileId);

  const validations = async () =>
    (
      await getDatabase()
        .collection<AuditEvent>("audit_events")
        .findMany({ action: "calculation.validated", targetId: fileId })
    ).items;

  beforeAll(async () => {
    const created = await createPatient(systemActor, {
      practitionerId: testPractitionerId,
      pseudonym: "Louise",
      heightCm: 175,
      weightKg: 100,
    });
    if (!created.ok) {
      throw new Error("test patient not created");
    }
    fileId = created.data.id;
  });

  it("is refused for a file with no protein estimate", async () => {
    const empty = await createPatient(systemActor, {
      practitionerId: testPractitionerId,
      pseudonym: "Nora",
    });
    if (!empty.ok) {
      throw new Error("test patient not created");
    }
    const refused = await validateProteinTarget(
      systemActor,
      empty.data.id,
      { referenceWeightKg: 75, coefficient: 1.2, value: null },
      practitioner,
    );
    expect(refused).toMatchObject({ ok: false, error: "conflict" });
    expect(await listPatientCalculations(systemActor, empty.data.id)).toEqual(
      [],
    );
  });

  it("writes 90 g/day for 75 kg at 1.2, and keeps the weight at 100 kg", async () => {
    const before = await rows();
    const result = await validateProteinTarget(
      systemActor,
      fileId,
      { referenceWeightKg: 75, coefficient: 1.2, value: null },
      practitioner,
    );
    expect(result.ok).toBe(true);
    const row = await proteinRow();
    expect(row?.validatedValue).toBe(90);
    expect(row?.validationParameters).toEqual({
      referenceWeightKg: 75,
      coefficient: 1.2,
      additionGramsPerDay: 0,
      direct: false,
    });
    expect(row?.validatedBy).toBe(practitioner.id);
    expect(row?.estimatedValue).toBe(83);
    expect(row?.estimateParameters).toMatchObject({ referenceWeightKg: 100 });

    expect((await profile())?.weightKg).toBe(100);
    const after = await rows();
    for (const kind of ["bmi", "energy"] as const) {
      expect(after.find((entry) => entry.kind === kind)).toEqual(
        before.find((entry) => entry.kind === kind),
      );
    }
  });

  it("records the reference weight, the coefficient and the final value", async () => {
    const events = await validations();
    expect(events).toHaveLength(1);
    expect(events[0]?.actorEmail).toBe(practitioner.email);
    expect(JSON.parse(events[0]?.detail ?? "{}")).toEqual({
      kind: "protein",
      value: 90,
      parameters: {
        referenceWeightKg: 75,
        coefficient: 1.2,
        additionGramsPerDay: 0,
        direct: false,
      },
    });
  });

  it("keeps a typed final value as typed", async () => {
    const result = await validateProteinTarget(
      systemActor,
      fileId,
      { referenceWeightKg: 75, coefficient: 1.2, value: 80 },
      practitioner,
    );
    expect(result.ok).toBe(true);
    const row = await proteinRow();
    expect(row?.validatedValue).toBe(80);
    expect(row?.validationParameters).toMatchObject({ direct: true });
    expect(await validations()).toHaveLength(2);
  });

  it("keeps the validated value when the weight of the file changes", async () => {
    const saved = await updatePatient(systemActor, fileId, { weightKg: 98 });
    expect(saved.ok).toBe(true);
    const row = await proteinRow();
    expect(row?.estimatedValue).toBe(81);
    expect(row?.validatedValue).toBe(80);
    expect(row?.validationParameters).toMatchObject({ referenceWeightKg: 75 });
  });

  it("takes the addition from the row, never from the caller", async () => {
    await getDatabase()
      .collection<{ id: string; specialSituation: string | null }>(
        "patient_profiles",
      )
      .update(fileId, { specialSituation: "pregnancy_2" });
    await refreshProteinEstimate(fileId);
    const result = await validateProteinTarget(
      systemActor,
      fileId,
      { referenceWeightKg: 75, coefficient: 1.2, value: null },
      practitioner,
    );
    expect(result.ok).toBe(true);
    const row = await proteinRow();
    expect(row?.validatedValue).toBe(99);
    expect(row?.validationParameters).toMatchObject({
      additionGramsPerDay: 9,
      direct: false,
    });
  });

  it("refuses a value out of its limits and writes nothing", async () => {
    const before = await proteinRow();
    const count = (await validations()).length;
    for (const input of [
      { referenceWeightKg: 10, coefficient: 1.2, value: null },
      { referenceWeightKg: 75, coefficient: 0, value: null },
      { referenceWeightKg: 75, coefficient: null, value: 80 },
      { referenceWeightKg: 75, coefficient: 1.2, value: 80.5 },
      { referenceWeightKg: Number.NaN, coefficient: 1.2, value: null },
    ]) {
      const refused = await validateProteinTarget(
        systemActor,
        fileId,
        input,
        practitioner,
      );
      expect(refused).toMatchObject({ ok: false, error: "invalid_input" });
    }
    expect(await proteinRow()).toEqual(before);
    expect(await validations()).toHaveLength(count);
  });

  it("answers another practitioner as a missing file", async () => {
    const before = await proteinRow();
    const refused = await validateProteinTarget(
      otherPractitioner,
      fileId,
      { referenceWeightKg: 60, coefficient: 1, value: null },
      practitioner,
    );
    expect(refused).toMatchObject({ ok: false, error: "not_found" });
    expect(await proteinRow()).toEqual(before);
  });

  it("answers an admin's read-only open as a missing file", async () => {
    const admin = operatorActor(
      { id: "00000000-0000-4000-8000-000000000003", role: "admin" },
      [fileId],
    );
    expect(await listPatientCalculations(admin, fileId)).not.toEqual([]);
    const refused = await validateProteinTarget(
      admin,
      fileId,
      { referenceWeightKg: 60, coefficient: 1, value: null },
      practitioner,
    );
    expect(refused).toMatchObject({ ok: false, error: "not_found" });
  });
});

describe("the calorie target", () => {
  let fileId: string;

  /** Born on 1 January, 35 years before this year: 35 on any day of the year. */
  const birthDate = `${new Date().getUTCFullYear() - 35}-01-01`;

  const rows = async () => listPatientCalculations(systemActor, fileId);

  const energyRow = async () =>
    (await rows()).find((row) => row.kind === "energy");

  const validations = async () =>
    (
      await getDatabase()
        .collection<AuditEvent>("audit_events")
        .findMany({ action: "calculation.validated", targetId: fileId })
    ).items;

  const target = (
    patch: Partial<EnergyTargetValidation> = {},
  ): EnergyTargetValidation => ({
    goal: "weight_loss",
    specialSituation: "none",
    entry: "value",
    amount: 2000,
    ...patch,
  });

  /** Story 9's control: female, 35, 165 cm, 65 kg. */
  const completeFile = async (pseudonym: string) => {
    const created = await createPatient(systemActor, {
      practitionerId: testPractitionerId,
      pseudonym,
      heightCm: 165,
      weightKg: 65,
    });
    if (!created.ok) {
      throw new Error("test patient not created");
    }
    const id = created.data.id;
    const dated = await updatePatient(systemActor, id, { birthDate });
    const answered = await savePatientQuestionnaire(systemActor, id, {
      sexForCalculation: "female",
      activityLevel: "moderate",
    });
    if (!dated.ok || !answered.ok) {
      throw new Error("test patient not completed");
    }
    return id;
  };

  beforeAll(async () => {
    fileId = await completeFile("Jeanne");
  });

  it("is refused for a file with a datum missing, and writes nothing", async () => {
    const empty = await createPatient(systemActor, {
      practitionerId: testPractitionerId,
      pseudonym: "Odile",
      heightCm: 165,
      weightKg: 65,
    });
    if (!empty.ok) {
      throw new Error("test patient not created");
    }
    const refused = await validateEnergyTarget(
      systemActor,
      empty.data.id,
      target(),
      practitioner,
    );
    expect(refused).toMatchObject({ ok: false, error: "conflict" });
    const energy = (
      await listPatientCalculations(systemActor, empty.data.id)
    ).find((row) => row.kind === "energy");
    expect(energy).toBeUndefined();
  });

  it("writes no target with no typed amount, for a weight-loss goal too", async () => {
    const refused = await validateEnergyTarget(
      systemActor,
      fileId,
      target({ amount: null }),
      practitioner,
    );
    expect(refused).toMatchObject({ ok: false, error: "invalid_input" });
    expect((await energyRow())?.validatedValue).toBeNull();
    expect(await validations()).toHaveLength(0);
  });

  it("refuses a goal that is not one of the four", async () => {
    const refused = await validateEnergyTarget(
      systemActor,
      fileId,
      target({ goal: "diet" }),
      practitioner,
    );
    expect(refused).toMatchObject({ ok: false, error: "invalid_input" });
    expect((await energyRow())?.validatedValue).toBeNull();
  });

  it("writes the target and leaves the estimate and the other rows", async () => {
    const before = await rows();
    const estimate = (await energyRow())?.estimatedValue;
    expect(Math.round(estimate ?? 0)).toBe(2152);
    const result = await validateEnergyTarget(
      systemActor,
      fileId,
      target(),
      practitioner,
    );
    expect(result.ok).toBe(true);
    const row = await energyRow();
    expect(row?.validatedValue).toBe(2000);
    expect(row?.validationParameters).toEqual({
      goal: "weight_loss",
      specialSituation: "none",
      entry: "value",
      estimatedNeed: 2152,
      difference: -152,
    });
    expect(row?.validatedBy).toBe(practitioner.id);
    expect(row?.estimatedValue).toBe(estimate);
    const after = await rows();
    for (const kind of ["bmi", "protein"] as const) {
      expect(after.find((entry) => entry.kind === kind)).toEqual(
        before.find((entry) => entry.kind === kind),
      );
    }
  });

  it("records the goal, the situation, the estimate and the target", async () => {
    const events = await validations();
    expect(events).toHaveLength(1);
    expect(events[0]?.actorEmail).toBe(practitioner.email);
    expect(JSON.parse(events[0]?.detail ?? "{}")).toEqual({
      kind: "energy",
      value: 2000,
      parameters: {
        goal: "weight_loss",
        specialSituation: "none",
        entry: "value",
        estimatedNeed: 2152,
        difference: -152,
      },
    });
  });

  it("adds a typed difference to the estimate of the row", async () => {
    const result = await validateEnergyTarget(
      systemActor,
      fileId,
      target({ goal: "muscle_gain", entry: "difference", amount: 300 }),
      practitioner,
    );
    expect(result.ok).toBe(true);
    const row = await energyRow();
    expect(row?.validatedValue).toBe(2452);
    expect(row?.validationParameters).toMatchObject({
      goal: "muscle_gain",
      entry: "difference",
      difference: 300,
    });
    expect(await validations()).toHaveLength(2);
  });

  it("keeps the validated target when the activity level changes", async () => {
    const saved = await savePatientQuestionnaire(systemActor, fileId, {
      activityLevel: "high",
    });
    expect(saved.ok).toBe(true);
    const row = await energyRow();
    expect(Math.round(row?.estimatedValue ?? 0)).toBe(2421);
    expect(row?.validatedValue).toBe(2452);
    expect(row?.validationParameters).toMatchObject({ estimatedNeed: 2152 });
    expect(await validations()).toHaveLength(2);
  });

  it("answers another practitioner as a missing file", async () => {
    const before = await energyRow();
    const refused = await validateEnergyTarget(
      otherPractitioner,
      fileId,
      target({ amount: 1500 }),
      practitioner,
    );
    expect(refused).toMatchObject({ ok: false, error: "not_found" });
    expect(await energyRow()).toEqual(before);
  });

  it("answers an admin's read-only open as a missing file", async () => {
    const admin = operatorActor(
      { id: "00000000-0000-4000-8000-000000000003", role: "admin" },
      [fileId],
    );
    expect(await computePatientEstimates(admin, fileId)).not.toEqual({
      protein: null,
      energy: null,
    });
    const refused = await validateEnergyTarget(
      admin,
      fileId,
      target({ amount: 1500 }),
      practitioner,
    );
    expect(refused).toMatchObject({ ok: false, error: "not_found" });
    expect((await energyRow())?.validatedValue).toBe(2452);
  });

  describe("on a file that has its data and no stored estimate", () => {
    let staleId: string;

    const staleRows = async () => listPatientCalculations(systemActor, staleId);

    beforeAll(async () => {
      staleId = await completeFile("Solange");
      for (const kind of ["protein", "energy"] as const) {
        const cleared = await setCalculationEstimate(
          systemActor,
          staleId,
          kind,
          null,
        );
        if (!cleared.ok) {
          throw new Error("test estimate not cleared");
        }
      }
    });

    it("computes the two estimates for the screen and writes nothing", async () => {
      const before = await staleRows();
      const computed = await computePatientEstimates(systemActor, staleId);
      expect(Math.round(computed.energy?.value ?? 0)).toBe(2152);
      expect(computed.energy?.parameters).toMatchObject({
        activityLevel: "moderate",
        nap: 1.6,
      });
      expect(computed.protein?.value).toBe(54);
      expect(computed.protein?.parameters).toMatchObject({
        referenceWeightKg: 65,
        coefficient: 0.83,
      });
      expect(await staleRows()).toEqual(before);
    });

    it("computes no estimate when a datum is missing", async () => {
      const bare = await createPatient(systemActor, {
        practitionerId: testPractitionerId,
        pseudonym: "Agathe",
      });
      if (!bare.ok) {
        throw new Error("test patient not created");
      }
      expect(await computePatientEstimates(systemActor, bare.data.id)).toEqual({
        protein: null,
        energy: null,
      });
    });

    it("answers another practitioner with no estimate", async () => {
      expect(await computePatientEstimates(otherPractitioner, staleId)).toEqual(
        { protein: null, energy: null },
      );
    });

    it("writes the energy estimate at the validation of the target", async () => {
      const result = await validateEnergyTarget(
        systemActor,
        staleId,
        target({ entry: "difference", amount: -152 }),
        practitioner,
      );
      expect(result.ok).toBe(true);
      const row = (await staleRows()).find((entry) => entry.kind === "energy");
      expect(Math.round(row?.estimatedValue ?? 0)).toBe(2152);
      expect(row?.validatedValue).toBe(2000);
    });

    it("writes the protein estimate at the validation of the target", async () => {
      const result = await validateProteinTarget(
        systemActor,
        staleId,
        { referenceWeightKg: 60, coefficient: 1, value: null },
        practitioner,
      );
      expect(result.ok).toBe(true);
      const row = (await staleRows()).find((entry) => entry.kind === "protein");
      expect(row?.estimatedValue).toBe(54);
      expect(row?.validatedValue).toBe(60);
    });
  });
});
