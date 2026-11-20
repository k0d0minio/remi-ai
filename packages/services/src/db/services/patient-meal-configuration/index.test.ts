import { beforeAll, describe, expect, it } from "vitest";
import {
  defaultMealConfiguration,
  type MealConfigurationChange,
} from "../../../shared/meal-configuration";
import { getDatabase, registerDatabase } from "../../client";
import type { AuditEvent } from "../../models/audit-event";
import type { PatientMealConfiguration } from "../../models/patient-meal-configuration";
import type { PatientProfile } from "../../models/patient-profile";
import {
  createMemoryDatabase,
  practitionerActor,
  testPractitionerId,
} from "../../test-helpers";
import { operatorActor, systemActor } from "../access";
import { createPatient } from "../patients";
import { getValidatedProtocol, validateProtocol } from "../protocol-versions";
import {
  getPatientMealConfiguration,
  updatePatientMealConfiguration,
} from "./index";

const practitioner = {
  id: testPractitionerId,
  email: "morgane@example.test",
  name: "Morgane",
};

const holder = practitionerActor();

const otherPractitioner = operatorActor({
  id: "00000000-0000-4000-8000-000000000002",
  role: "practitioner",
});

const profiles = () =>
  getDatabase().collection<PatientProfile>("patient_profiles");

const rows = async (patientId: string) =>
  (
    await getDatabase()
      .collection<PatientMealConfiguration>("patient_meal_configurations")
      .findMany({ patientId })
  ).items;

const events = async (patientId: string) =>
  (
    await getDatabase()
      .collection<AuditEvent>("audit_events")
      .findMany({ action: "meal_configuration.updated" })
  ).items.filter((event) => event.targetId === patientId);

const newPatient = async (
  pseudonym: string,
  fileStatus: PatientProfile["fileStatus"],
) => {
  const created = await createPatient(systemActor, {
    practitionerId: testPractitionerId,
    pseudonym,
  });
  if (!created.ok) {
    throw new Error("test patient not created");
  }
  await profiles().update(created.data.id, { fileStatus });
  return created.data.id;
};

const change = (patientId: string, submitted: MealConfigurationChange) =>
  updatePatientMealConfiguration(holder, patientId, practitioner, submitted);

let patientId: string;

beforeAll(async () => {
  registerDatabase(createMemoryDatabase());
  patientId = await newPatient("Claire", "ready");
});

describe("the meal configuration of a patient", () => {
  it("has none before the first change, and no row", async () => {
    expect(await getPatientMealConfiguration(holder, patientId)).toBeNull();
    expect(await rows(patientId)).toEqual([]);
  });

  it("enters only the value of the first change", async () => {
    const saved = await change(patientId, {
      type: "fasting",
      fasting: "skip_breakfast",
    });
    expect(saved.ok).toBe(true);
    const configuration = await getPatientMealConfiguration(holder, patientId);
    expect(configuration?.fasting).toBe("skip_breakfast");
    expect(configuration?.meals.breakfast).toEqual({
      enabled: null,
      orientation: null,
    });
    expect(await rows(patientId)).toHaveLength(1);
  });

  it("moves a file at « Prêt pour consultation » to « Recommandations à valider »", async () => {
    expect((await profiles().findById(patientId))?.fileStatus).toBe(
      "to_validate",
    );
  });

  it("writes one audit event with the value that moved", async () => {
    const all = await events(patientId);
    expect(all).toHaveLength(1);
    expect(all[0]?.actorEmail).toBe(practitioner.email);
    expect(JSON.parse(all[0]?.detail ?? "{}")).toEqual({
      change: "fasting",
      changes: [{ field: "fasting", from: null, to: "skip_breakfast" }],
    });
  });

  it("writes nothing and no event for a change that moves no value", async () => {
    const saved = await change(patientId, {
      type: "fasting",
      fasting: "skip_breakfast",
    });
    expect(saved.ok).toBe(true);
    expect(await events(patientId)).toHaveLength(1);
  });

  it("keeps one row for the patient across the changes", async () => {
    await change(patientId, {
      type: "meal_enabled",
      meal: "snack",
      enabled: true,
    });
    await change(patientId, {
      type: "meal_orientation",
      meal: "snack",
      orientation: "free",
    });
    await change(patientId, {
      type: "meal_enabled",
      meal: "lunch",
      enabled: false,
    });
    expect(await rows(patientId)).toHaveLength(1);
    const configuration = await getPatientMealConfiguration(holder, patientId);
    expect(configuration?.meals.snack).toEqual({
      enabled: true,
      orientation: "free",
    });
    expect(configuration?.meals.lunch).toEqual({
      enabled: false,
      orientation: null,
    });
    expect(await events(patientId)).toHaveLength(4);
  });

  it("fills only the values that are not entered with the defaults", async () => {
    const saved = await change(patientId, { type: "defaults" });
    expect(saved.ok && saved.data).toEqual({
      meals: {
        breakfast: defaultMealConfiguration.meals.breakfast,
        lunch: { enabled: false, orientation: "complete_balanced" },
        snack: { enabled: true, orientation: "free" },
        dinner: defaultMealConfiguration.meals.dinner,
      },
      fasting: "skip_breakfast",
    });
  });

  it("refuses a value that is not a change, and writes nothing", async () => {
    const before = await getPatientMealConfiguration(holder, patientId);
    const count = (await events(patientId)).length;
    const refused = await change(patientId, {
      type: "fasting",
      fasting: "skip_lunch",
    } as unknown as MealConfigurationChange);
    expect(!refused.ok && refused.error).toBe("invalid_input");
    expect(await getPatientMealConfiguration(holder, patientId)).toEqual(before);
    expect(await events(patientId)).toHaveLength(count);
  });

  it("puts the configuration in the validated version", async () => {
    const validated = await validateProtocol(holder, patientId, practitioner);
    expect(validated.ok).toBe(true);
    const read = await getValidatedProtocol(holder, patientId);
    expect(read.ok && read.data?.snapshot.mealConfiguration).toEqual(
      await getPatientMealConfiguration(holder, patientId),
    );
  });

  it("does not change the validated version with a later change", async () => {
    await change(patientId, { type: "fasting", fasting: "none" });
    const read = await getValidatedProtocol(holder, patientId);
    expect(read.ok && read.data?.snapshot.mealConfiguration?.fasting).toBe(
      "skip_breakfast",
    );
  });
});

describe("the first change of another file", () => {
  it("applies Morgane's table on request, and an empty file stays empty", async () => {
    const otherId = await newPatient("Denis", "to_validate");
    const saved = await change(otherId, { type: "defaults" });
    expect(saved.ok && saved.data).toEqual(defaultMealConfiguration);
    const emptyId = await newPatient("Emma", "to_validate");
    const refused = await validateProtocol(holder, emptyId, practitioner);
    expect(!refused.ok && refused.message).toBe("the protocol is empty");
  });

  it("does not move a file that is still « à compléter »", async () => {
    const earlyId = await newPatient("Fanny", "to_complete");
    await change(earlyId, { type: "fasting", fasting: "none" });
    expect((await profiles().findById(earlyId))?.fileStatus).toBe(
      "to_complete",
    );
  });
});

describe("the scope of the meal configuration", () => {
  it("refuses another practitioner as a missing file", async () => {
    const before = await getPatientMealConfiguration(holder, patientId);
    expect(
      await getPatientMealConfiguration(otherPractitioner, patientId),
    ).toBeNull();
    const saved = await updatePatientMealConfiguration(
      otherPractitioner,
      patientId,
      practitioner,
      { type: "fasting", fasting: "skip_dinner" },
    );
    expect(!saved.ok && saved.error).toBe("not_found");
    expect(await getPatientMealConfiguration(holder, patientId)).toEqual(before);
  });

  it("treats a malformed patient id as a missing file", async () => {
    expect(
      await getPatientMealConfiguration(systemActor, "not-a-uuid"),
    ).toBeNull();
    expect(
      (
        await updatePatientMealConfiguration(
          systemActor,
          "not-a-uuid",
          practitioner,
          { type: "defaults" },
        )
      ).ok,
    ).toBe(false);
  });
});
