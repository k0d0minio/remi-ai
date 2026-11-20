import { beforeAll, describe, expect, it } from "vitest";
import { careActivationReason } from "../../../shared/care-activation";
import { getDatabase, registerDatabase } from "../../client";
import type { AuditEvent } from "../../models/audit-event";
import type { PatientProfile } from "../../models/patient-profile";
import type { PatientQuestionnaire } from "../../models/patient-questionnaire";
import {
  createMemoryDatabase,
  practitionerActor,
  testPractitionerId,
} from "../../test-helpers";
import { operatorActor, systemActor } from "../access";
import {
  createPatientAccount,
  getPatientAccountByProfile,
} from "../patient-accounts";
import {
  markCalculationsForRevalidation,
  validateCalculation,
} from "../patient-calculations";
import { addPatientRecommendation } from "../patient-recommendations";
import { createPatient } from "../patients";
import { validateProtocol } from "../protocol-versions";
import { activateCare, getActivationRecap, getCareActivationDate } from "./index";

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

/** The same rows, read as the questionnaire reads them. */
const answerRows = () =>
  getDatabase().collection<{ id: string } & PatientQuestionnaire>(
    "patient_profiles",
  );

const statusEvents = async (patientId: string) =>
  (
    await getDatabase()
      .collection<AuditEvent>("audit_events")
      .findMany(
        { action: "patient.file_status_changed", targetId: patientId },
        { limit: 500 },
      )
  ).items;

/** A file at « Recommandations à valider », with the answers the test names. */
const newPatient = async (
  pseudonym: string,
  answers: Partial<PatientQuestionnaire> = {},
) => {
  const created = await createPatient(systemActor, {
    practitionerId: testPractitionerId,
    pseudonym,
  });
  if (!created.ok) {
    throw new Error("test patient not created");
  }
  await profiles().update(created.data.id, { fileStatus: "to_validate" });
  await answerRows().update(created.data.id, answers);
  return created.data.id;
};

const safe = { noKnownAllergies: true, noKnownIntolerances: true };

/** One recommendation, then « Valider les recommandations ». */
const validate = async (patientId: string) => {
  const added = await addPatientRecommendation(holder, patientId, {
    category: "nutrition",
    title: "Two litres of water",
  });
  const validated = await validateProtocol(holder, patientId, practitioner);
  if (!added.ok || !validated.ok) {
    throw new Error("test protocol not validated");
  }
};

beforeAll(() => {
  registerDatabase(createMemoryDatabase());
});

describe("the recap of an activation", () => {
  it("names the missing version and the missing safety answers", async () => {
    const patientId = await newPatient("Claire");
    const recap = await getActivationRecap(holder, patientId);
    expect(recap.ok).toBe(true);
    if (recap.ok) {
      expect(recap.data.values).toBeNull();
      expect(recap.data.blockers).toEqual([
        { kind: "no_validated_version" },
        { kind: "safety_answer_missing", field: "allergies" },
        { kind: "safety_answer_missing", field: "intolerances" },
      ]);
    }
  });

  it("has no blocker for a validated file with its safety answers", async () => {
    const patientId = await newPatient("Marc", safe);
    await validate(patientId);
    const recap = await getActivationRecap(holder, patientId);
    expect(recap.ok).toBe(true);
    if (recap.ok) {
      expect(recap.data.blockers).toEqual([]);
      expect(recap.data.values?.versionNumber).toBe(1);
      expect(recap.data.values?.recommendations).toBe(1);
    }
  });

  it("blocks on a validated calculation to revalidate, until a new validation", async () => {
    const patientId = await newPatient("Rita", safe);
    const first = await validateCalculation(
      systemActor,
      patientId,
      "energy",
      { value: 2100, parameters: {} },
      practitioner,
    );
    expect(first.ok).toBe(true);
    await validate(patientId);
    expect(
      await markCalculationsForRevalidation({ id: patientId }, [
        "activityLevel",
      ]),
    ).toEqual(["energy"]);

    const blocked = await getActivationRecap(holder, patientId);
    expect(blocked.ok).toBe(true);
    if (blocked.ok) {
      expect(blocked.data.blockers).toEqual([
        { kind: "calculation_to_revalidate", calculation: "energy" },
      ]);
    }
    const refused = await activateCare(holder, patientId, practitioner);
    expect(refused.ok).toBe(false);
    if (!refused.ok) {
      expect(refused.error).toBe("conflict");
    }
    expect((await profiles().findById(patientId))?.fileStatus).toBe(
      "to_validate",
    );

    const again = await validateCalculation(
      systemActor,
      patientId,
      "energy",
      { value: 2200, parameters: {} },
      practitioner,
    );
    expect(again.ok).toBe(true);
    const free = await getActivationRecap(holder, patientId);
    expect(free.ok && free.data.blockers).toEqual([]);
  });

  it("reads as a missing file for another practitioner", async () => {
    const patientId = await newPatient("Nora", safe);
    const recap = await getActivationRecap(otherPractitioner, patientId);
    expect(recap.ok).toBe(false);
    if (!recap.ok) {
      expect(recap.error).toBe("not_found");
    }
  });
});

describe("the activation of the care", () => {
  it("refuses a file with a blocker, and writes nothing", async () => {
    const patientId = await newPatient("Lea", safe);
    const refused = await activateCare(holder, patientId, practitioner);
    expect(refused.ok).toBe(false);
    if (!refused.ok) {
      expect(refused.error).toBe("conflict");
    }
    expect((await profiles().findById(patientId))?.fileStatus).toBe(
      "to_validate",
    );
    expect(await statusEvents(patientId)).toHaveLength(0);
  });

  it("refuses a file that is not at « Recommandations à valider »", async () => {
    const patientId = await newPatient("Hugo", safe);
    await profiles().update(patientId, { fileStatus: "ready" });
    const refused = await activateCare(holder, patientId, practitioner);
    expect(refused.ok).toBe(false);
    if (!refused.ok) {
      expect(refused.error).toBe("conflict");
    }
  });

  it("refuses another practitioner and an admin's read-only open", async () => {
    const patientId = await newPatient("Ines", safe);
    await validate(patientId);
    const admin = operatorActor(
      { id: "00000000-0000-4000-8000-000000000003", role: "admin" },
      [patientId],
    );
    for (const actor of [otherPractitioner, admin]) {
      const refused = await activateCare(actor, patientId, practitioner);
      expect(refused.ok).toBe(false);
      if (!refused.ok) {
        expect(refused.error).toBe("not_found");
      }
    }
    expect((await profiles().findById(patientId))?.fileStatus).toBe(
      "to_validate",
    );
  });

  it("activates the file and the account, with one audit event", async () => {
    const patientId = await newPatient("Paul", safe);
    await validate(patientId);
    const account = await createPatientAccount({
      patientProfileId: patientId,
      email: "paul@example.test",
      authSubject: "user-paul",
    });
    expect(account.ok && account.data.activatedAt).toBeNull();
    expect(await getCareActivationDate(holder, patientId)).toBeNull();

    const activated = await activateCare(holder, patientId, practitioner);
    expect(activated.ok).toBe(true);
    if (activated.ok) {
      expect(activated.data.alreadyActive).toBe(false);
      expect(activated.data.patient.fileStatus).toBe("active");
    }
    expect(
      (await getPatientAccountByProfile(patientId))?.activatedAt,
    ).toBeInstanceOf(Date);
    const events = await statusEvents(patientId);
    expect(events).toHaveLength(1);
    expect(events[0]?.actorId).toBe(practitioner.id);
    expect(events[0]?.detail).toBe(
      `to_validate → active: ${careActivationReason}`,
    );
    expect(await getCareActivationDate(holder, patientId)).toEqual(
      events[0]?.createdAt,
    );
  });

  it("runs once: a second call changes nothing", async () => {
    const patientId = await newPatient("Zoe", safe);
    await validate(patientId);
    await createPatientAccount({
      patientProfileId: patientId,
      email: "zoe@example.test",
      authSubject: "user-zoe",
    });
    await activateCare(holder, patientId, practitioner);
    const first = (await getPatientAccountByProfile(patientId))?.activatedAt;

    const again = await activateCare(holder, patientId, practitioner);
    expect(again.ok).toBe(true);
    if (again.ok) {
      expect(again.data.alreadyActive).toBe(true);
    }
    expect(await statusEvents(patientId)).toHaveLength(1);
    expect((await getPatientAccountByProfile(patientId))?.activatedAt).toEqual(
      first,
    );
  });

  it("activates a file with no account, and dates the account made later", async () => {
    const patientId = await newPatient("Remy", safe);
    await validate(patientId);
    const activated = await activateCare(holder, patientId, practitioner);
    expect(activated.ok).toBe(true);
    expect(await getPatientAccountByProfile(patientId)).toBeNull();

    const account = await createPatientAccount({
      patientProfileId: patientId,
      email: "remy@example.test",
      authSubject: "user-remy",
    });
    expect(account.ok).toBe(true);
    if (account.ok) {
      expect(account.data.activatedAt).toBeInstanceOf(Date);
    }
  });
});
