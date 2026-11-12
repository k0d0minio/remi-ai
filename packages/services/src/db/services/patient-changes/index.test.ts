import { beforeAll, describe, expect, it } from "vitest";
import { watchedPatientFields } from "../../../shared/patient-changes";
import { getDatabase, registerDatabase } from "../../client";
import type { AuditEvent } from "../../models/audit-event";
import type { PatientChange } from "../../models/patient-change";
import type { PatientProfile } from "../../models/patient-profile";
import {
  createMemoryDatabase,
  practitionerActor,
  testPractitionerId,
} from "../../test-helpers";
import { patientActor, systemActor } from "../access";
import { recordConsent } from "../patient-consents";
import {
  savePatientProfileAnswers,
  savePatientQuestionnaire,
  setPatientAllergens,
} from "../patient-questionnaire";
import { createPatient, updatePatientProfileByPatient } from "../patients";
import {
  countOpenPatientChanges,
  listOpenPatientChanges,
  recordPatientChanges,
  storedChangeValue,
} from "./index";

const profiles = () =>
  getDatabase().collection<PatientProfile>("patient_profiles");

/** A patient file, moved to `active` unless the test says otherwise. */
const newPatient = async (
  pseudonym: string,
  fileStatus: PatientProfile["fileStatus"] = "active",
) => {
  const created = await createPatient(systemActor, {
    practitionerId: testPractitionerId,
    pseudonym,
    sex: "other",
  });
  if (!created.ok) {
    throw new Error("test patient not created");
  }
  const recorded = await recordConsent(systemActor, {
    patientId: created.data.id,
    key: "care",
    version: "1",
    locale: "fr-BE",
    decision: "given",
    actor: { kind: "patient", id: created.data.id, name: pseudonym },
  });
  if (!recorded.ok) {
    throw new Error(recorded.message);
  }
  await profiles().update(created.data.id, { fileStatus });
  return created.data;
};

const openOf = async (patientId: string) => {
  const listed = await listOpenPatientChanges(systemActor, patientId);
  if (!listed.ok) {
    throw new Error(listed.message);
  }
  return listed.data;
};

const changeEvents = async (patientId: string) =>
  (
    await getDatabase()
      .collection<AuditEvent>("audit_events")
      .findMany({ action: "patient.changed", targetId: patientId })
  ).items;

/** Two writes share a millisecond otherwise, and the order is by time. */
const tick = () => new Promise((resolve) => setTimeout(resolve, 5));

beforeAll(() => {
  registerDatabase(createMemoryDatabase());
});

describe("the watched-field list", () => {
  it("holds each field once", () => {
    expect(new Set(watchedPatientFields).size).toBe(
      watchedPatientFields.length,
    );
  });
});

describe("storedChangeValue", () => {
  it("stores an empty text or an empty list as null", () => {
    expect(storedChangeValue("")).toBeNull();
    expect(storedChangeValue("  ")).toBeNull();
    expect(storedChangeValue([])).toBeNull();
    expect(storedChangeValue(undefined)).toBeNull();
  });

  it("sorts a list, so the order of the boxes is no change", () => {
    expect(storedChangeValue(["peanuts", "eggs"])).toEqual(["eggs", "peanuts"]);
  });
});

describe("a patient write on an active file", () => {
  it("records one row per changed watched field, with both values", async () => {
    const patient = await newPatient("Anna");
    await savePatientProfileAnswers(patientActor(patient.id), patient.id, {
      weightKg: 70,
      heightCm: 170,
    });
    const open = await openOf(patient.id);
    expect(
      open
        .map((row) => [row.fieldKey, row.oldValue, row.newValue])
        .sort((a, b) => String(a[0]).localeCompare(String(b[0]))),
    ).toEqual([
      ["heightCm", null, 170],
      ["weightKg", null, 70],
    ]);
    expect(open.every((row) => row.changedAt instanceof Date)).toBe(true);
    expect(open.every((row) => row.acknowledgedAt === null)).toBe(true);
    expect(await changeEvents(patient.id)).toHaveLength(1);
  });

  it("records no row for a field that is not watched", async () => {
    const patient = await newPatient("Bea");
    await savePatientProfileAnswers(patientActor(patient.id), patient.id, {
      phone: "+32470123456",
    });
    expect(await openOf(patient.id)).toEqual([]);
    expect(await changeEvents(patient.id)).toHaveLength(0);
  });

  it("records no row when the value does not change", async () => {
    const patient = await newPatient("Cleo");
    await profiles().update(patient.id, { weightKg: 64 });
    await savePatientProfileAnswers(patientActor(patient.id), patient.id, {
      weightKg: 64,
    });
    expect(await openOf(patient.id)).toEqual([]);
  });

  it("keeps one open signal per field, with the first old value", async () => {
    const patient = await newPatient("Dina");
    await profiles().update(patient.id, { weightKg: 80 });
    await savePatientProfileAnswers(patientActor(patient.id), patient.id, {
      weightKg: 78,
    });
    await tick();
    await savePatientProfileAnswers(patientActor(patient.id), patient.id, {
      weightKg: 76,
    });
    const open = await openOf(patient.id);
    expect(open.map((row) => [row.oldValue, row.newValue])).toEqual([[80, 76]]);
  });

  it("deletes the open signal when the patient reverts the change", async () => {
    const patient = await newPatient("Elsa");
    await profiles().update(patient.id, { weightKg: 80 });
    await savePatientProfileAnswers(patientActor(patient.id), patient.id, {
      weightKg: 78,
    });
    await savePatientProfileAnswers(patientActor(patient.id), patient.id, {
      weightKg: 80,
    });
    expect(await openOf(patient.id)).toEqual([]);
  });

  it("records the questionnaire's own columns", async () => {
    const patient = await newPatient("Fanny");
    await savePatientQuestionnaire(patientActor(patient.id), patient.id, {
      activityLevel: "moderate",
      consultationReason: "fatigue",
    });
    const open = await openOf(patient.id);
    expect(open.map((row) => [row.fieldKey, row.newValue])).toEqual([
      ["activityLevel", "moderate"],
    ]);
  });

  it("records an allergy list as its sorted entries", async () => {
    const patient = await newPatient("Gaia");
    await setPatientAllergens(patientActor(patient.id), patient.id, "allergy", {
      state: "declared",
      items: [{ key: "peanuts" }, { key: "fish", subKey: "cod" }],
    });
    const open = await openOf(patient.id);
    expect(
      open.map((row) => [row.fieldKey, row.oldValue, row.newValue]),
    ).toEqual([["allergies", null, ["fish/cod", "peanuts"]]]);
  });

  it("records the old link's diet under the questionnaire's key", async () => {
    const patient = await newPatient("Hana");
    await updatePatientProfileByPatient(systemActor, patient.id, {
      dietaryRegime: "végétarien",
      allergies: "",
      intolerances: "",
      preferences: "le chou",
      likesCooking: "",
      cookingTime: "",
      foodBudget: "",
    });
    const open = await openOf(patient.id);
    expect(open.map((row) => [row.fieldKey, row.newValue])).toEqual([
      ["diet", "végétarien"],
    ]);
  });
});

describe("no signal", () => {
  it("on a file whose care is not active: the first questionnaire fill", async () => {
    const patient = await newPatient("Ines", "to_complete");
    await savePatientProfileAnswers(patientActor(patient.id), patient.id, {
      weightKg: 70,
    });
    await setPatientAllergens(patientActor(patient.id), patient.id, "allergy", {
      state: "declared",
      items: [{ key: "peanuts" }],
    });
    expect(await openOf(patient.id)).toEqual([]);
    expect(await changeEvents(patient.id)).toHaveLength(0);
  });

  it("for a practitioner's write", async () => {
    const patient = await newPatient("Jade");
    await savePatientProfileAnswers(practitionerActor(), patient.id, {
      weightKg: 70,
    });
    await savePatientQuestionnaire(practitionerActor(), patient.id, {
      activityLevel: "high",
    });
    await setPatientAllergens(practitionerActor(), patient.id, "intolerance", {
      state: "declared",
      items: [{ key: "lactose" }],
    });
    expect(await openOf(patient.id)).toEqual([]);
  });

  it("when the helper gets a field in one map only", async () => {
    const patient = await newPatient("Kim");
    const recorded = await recordPatientChanges(
      { ...patient, fileStatus: "active" },
      {},
      { weightKg: 70 },
    );
    expect(recorded).toEqual({ ok: true, data: [] });
  });
});

describe("countOpenPatientChanges", () => {
  it("counts the open signals of each file, and leaves out a file with none", async () => {
    const changed = await newPatient("Lou");
    const quiet = await newPatient("Mia");
    await savePatientProfileAnswers(patientActor(changed.id), changed.id, {
      weightKg: 70,
      heightCm: 165,
    });
    const counts = await countOpenPatientChanges(practitionerActor());
    expect(counts.get(changed.id)).toBe(2);
    expect(counts.has(quiet.id)).toBe(false);
  });

  it("leaves out an acknowledged signal", async () => {
    const patient = await newPatient("Nora");
    await savePatientProfileAnswers(patientActor(patient.id), patient.id, {
      weightKg: 70,
    });
    const [row] = await openOf(patient.id);
    await getDatabase()
      .collection<PatientChange>("patient_changes")
      .update(row.id, { acknowledgedAt: new Date() });
    expect(await openOf(patient.id)).toEqual([]);
    const counts = await countOpenPatientChanges(practitionerActor());
    expect(counts.has(patient.id)).toBe(false);
  });
});
