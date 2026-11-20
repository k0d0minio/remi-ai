import { beforeAll, describe, expect, it } from "vitest";
import { watchedPatientFields } from "../../../shared/patient-changes";
import { getDatabase, registerDatabase } from "../../client";
import type { AuditEvent } from "../../models/audit-event";
import type { PatientChange } from "../../models/patient-change";
import type { Actor } from "../../models/actor";
import type { PatientProfile } from "../../models/patient-profile";
import type { ProtocolVersion } from "../../models/protocol-version";
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
  acknowledgePatientChanges,
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

const rows = () => getDatabase().collection<PatientChange>("patient_changes");

const versions = () =>
  getDatabase().collection<ProtocolVersion>("protocol_versions");

/** A validated version of the file. These tests never read the snapshot. */
const validateVersion = (patientId: string) =>
  versions().insert({
    patientId,
    versionNumber: 1,
    validatedAt: new Date(),
    validatedBy: testPractitionerId,
    snapshot: {} as ProtocolVersion["snapshot"],
  });

const morgane = {
  id: testPractitionerId,
  email: "morgane@example.test",
  name: "Morgane",
};

const otherPractitionerId = "00000000-0000-4000-8000-000000000002";

const acknowledgeEvents = async (patientId: string) =>
  (
    await getDatabase()
      .collection<AuditEvent>("audit_events")
      .findMany({ action: "patient.change_acknowledged", targetId: patientId })
  ).items;

/** A file with two open signals: the weight and the allergies. */
const patientWithTwoChanges = async (pseudonym: string) => {
  const patient = await newPatient(pseudonym);
  await savePatientProfileAnswers(patientActor(patient.id), patient.id, {
    weightKg: 70,
  });
  await setPatientAllergens(patientActor(patient.id), patient.id, "allergy", {
    state: "declared",
    items: [{ key: "peanuts" }],
  });
  return patient;
};

describe("a validated version arms the signal", () => {
  it("records a change before the activation, after the validation", async () => {
    const patient = await newPatient("Olga", "to_validate");
    await validateVersion(patient.id);
    await savePatientProfileAnswers(patientActor(patient.id), patient.id, {
      weightKg: 70,
    });
    const open = await openOf(patient.id);
    expect(open.map((row) => row.fieldKey)).toEqual(["weightKg"]);
  });

  it("records nothing at the same status with no version", async () => {
    const patient = await newPatient("Petra", "to_validate");
    await savePatientProfileAnswers(patientActor(patient.id), patient.id, {
      weightKg: 70,
    });
    expect(await openOf(patient.id)).toEqual([]);
  });
});

describe("acknowledgePatientChanges", () => {
  it("closes the named signal and leaves the other one open", async () => {
    const patient = await patientWithTwoChanges("Rita");
    const weight = (await openOf(patient.id)).find(
      (row) => row.fieldKey === "weightKg",
    );
    if (!weight) {
      throw new Error("no weight signal");
    }
    const result = await acknowledgePatientChanges(
      practitionerActor(),
      patient.id,
      morgane,
      [weight.id],
    );
    expect(result.ok && result.data.map((row) => row.fieldKey)).toEqual([
      "weightKg",
    ]);
    expect((await openOf(patient.id)).map((row) => row.fieldKey)).toEqual([
      "allergies",
    ]);
    const counts = await countOpenPatientChanges(practitionerActor());
    expect(counts.get(patient.id)).toBe(1);
  });

  it("keeps the row in the data, with who and when", async () => {
    const patient = await patientWithTwoChanges("Sara");
    await acknowledgePatientChanges(
      practitionerActor(),
      patient.id,
      morgane,
      "all",
    );
    const kept = (await rows().findMany({ patientId: patient.id })).items;
    expect(kept).toHaveLength(2);
    expect(kept.every((row) => row.acknowledgedAt instanceof Date)).toBe(true);
    expect(kept.every((row) => row.acknowledgedBy === morgane.id)).toBe(true);
    expect(kept.find((row) => row.fieldKey === "weightKg")?.newValue).toBe(70);
  });

  it("closes each open signal with « all », and the file leaves the count", async () => {
    const patient = await patientWithTwoChanges("Tess");
    const result = await acknowledgePatientChanges(
      practitionerActor(),
      patient.id,
      morgane,
      "all",
    );
    expect(result.ok && result.data).toHaveLength(2);
    expect(await openOf(patient.id)).toEqual([]);
    const counts = await countOpenPatientChanges(practitionerActor());
    expect(counts.has(patient.id)).toBe(false);
  });

  it("writes one audit event with the field keys and no value", async () => {
    const patient = await patientWithTwoChanges("Uma");
    await acknowledgePatientChanges(
      practitionerActor(),
      patient.id,
      morgane,
      "all",
    );
    const events = await acknowledgeEvents(patient.id);
    expect(events).toHaveLength(1);
    const [event] = events;
    expect(event?.actorId).toBe(morgane.id);
    expect(event?.detail.split(", ").sort()).toEqual(["allergies", "weightKg"]);
    expect(event?.detail).not.toContain("70");
    expect(event?.detail).not.toContain("peanuts");
  });

  it("changes nothing on a second call, and writes no second event", async () => {
    const patient = await patientWithTwoChanges("Vera");
    const [first] = await openOf(patient.id);
    if (!first) {
      throw new Error("no signal");
    }
    await acknowledgePatientChanges(practitionerActor(), patient.id, morgane, [
      first.id,
    ]);
    const before = await rows().findById(first.id);
    const again = await acknowledgePatientChanges(
      practitionerActor(),
      patient.id,
      morgane,
      [first.id],
    );
    expect(again).toEqual({ ok: true, data: [] });
    expect((await rows().findById(first.id))?.acknowledgedAt).toEqual(
      before?.acknowledgedAt,
    );
    expect(await acknowledgeEvents(patient.id)).toHaveLength(1);
  });

  it("ignores the id of a signal of another file", async () => {
    const patient = await patientWithTwoChanges("Wanda");
    const other = await patientWithTwoChanges("Xenia");
    const [foreign] = await openOf(other.id);
    if (!foreign) {
      throw new Error("no signal");
    }
    const result = await acknowledgePatientChanges(
      practitionerActor(),
      patient.id,
      morgane,
      [foreign.id],
    );
    expect(result).toEqual({ ok: true, data: [] });
    expect(await openOf(other.id)).toHaveLength(2);
  });

  it("refuses another practitioner, as a missing file", async () => {
    const patient = await patientWithTwoChanges("Yara");
    const result = await acknowledgePatientChanges(
      practitionerActor(otherPractitionerId),
      patient.id,
      { ...morgane, id: otherPractitionerId },
      "all",
    );
    expect(result.ok).toBe(false);
    expect(!result.ok && result.error).toBe("not_found");
    expect(await openOf(patient.id)).toHaveLength(2);
    expect(await acknowledgeEvents(patient.id)).toHaveLength(0);
  });

  it("lets an admin's read-only open read the signals, and refuses its acknowledge", async () => {
    const patient = await patientWithTwoChanges("Zoe");
    const admin: Actor = {
      kind: "operator",
      id: otherPractitionerId,
      role: "admin",
      openedPatientIds: [patient.id],
    };
    const read = await listOpenPatientChanges(admin, patient.id);
    expect(read.ok && read.data).toHaveLength(2);
    const result = await acknowledgePatientChanges(
      admin,
      patient.id,
      { ...morgane, id: otherPractitionerId },
      "all",
    );
    expect(result.ok).toBe(false);
    expect(await openOf(patient.id)).toHaveLength(2);
  });

  it("leaves the validated version as it was", async () => {
    const patient = await patientWithTwoChanges("Alba");
    const version = await validateVersion(patient.id);
    await acknowledgePatientChanges(
      practitionerActor(),
      patient.id,
      morgane,
      "all",
    );
    expect(await versions().findMany({ patientId: patient.id })).toEqual({
      items: [version],
      nextCursor: null,
    });
  });
});
