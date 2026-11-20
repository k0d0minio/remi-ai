import { beforeAll, describe, expect, it } from "vitest";
import { getDatabase, registerDatabase } from "../../client";
import type { AuditEvent } from "../../models/audit-event";
import type { PatientCalculation } from "../../models/patient-calculation";
import type { PatientProfile } from "../../models/patient-profile";
import type { ProtocolVersion } from "../../models/protocol-version";
import {
  createMemoryDatabase,
  practitionerActor,
  testPractitionerId,
} from "../../test-helpers";
import { operatorActor, patientActor, systemActor } from "../access";
import { validateCalculation } from "../patient-calculations";
import { addPatientGoal } from "../patient-goals";
import { setPatientInstruction } from "../patient-instructions";
import {
  addPatientRecommendation,
  archivePatientRecommendation,
} from "../patient-recommendations";
import { addPatientSupplement } from "../patient-supplements";
import { createPatient } from "../patients";
import { getValidatedProtocol, validateProtocol } from "./index";

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

const versions = () =>
  getDatabase().collection<ProtocolVersion>("protocol_versions");

/** A patient file at the status the test names. */
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

const validatedOf = async (patientId: string) => {
  const read = await getValidatedProtocol(holder, patientId);
  if (!read.ok) {
    throw new Error(read.message);
  }
  return read.data;
};

let patientId: string;
let waterId: string;

beforeAll(async () => {
  registerDatabase(createMemoryDatabase());
  patientId = await newPatient("Claire", "to_validate");
});

describe("the validated protocol of a patient", () => {
  it("is nothing before the first validation", async () => {
    expect(await validatedOf(patientId)).toBeNull();
  });

  it("refuses the validation of an empty protocol", async () => {
    const result = await validateProtocol(holder, patientId, practitioner);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("conflict");
    }
    expect((await versions().findMany({ patientId })).items).toHaveLength(0);
  });

  it("stays nothing while the working copy changes", async () => {
    const water = await addPatientRecommendation(holder, patientId, {
      category: "nutrition",
      title: "Two litres of water",
    });
    const walk = await addPatientRecommendation(holder, patientId, {
      category: "activity",
      title: "A walk after lunch",
    });
    const goal = await addPatientGoal(holder, patientId, {
      title: "More energy",
      baseline: "3/10",
    });
    const supplement = await addPatientSupplement(holder, patientId, {
      name: "Magnesium",
      dose: "300 mg",
    });
    const instruction = await setPatientInstruction(holder, patientId, {
      body: "Energy first",
      patientBody: "One change a week",
    });
    expect(
      water.ok && walk.ok && goal.ok && supplement.ok && instruction.ok,
    ).toBe(true);
    if (water.ok) {
      waterId = water.data.id;
    }
    expect(await validatedOf(patientId)).toBeNull();
  });

  it("writes version 1 with a snapshot of the live protocol", async () => {
    const validatedCalculation = await validateCalculation(
      holder,
      patientId,
      "protein",
      { value: 60, parameters: { referenceWeightKg: 65, coefficient: 0.92 } },
      practitioner,
    );
    expect(validatedCalculation.ok).toBe(true);

    const result = await validateProtocol(holder, patientId, practitioner);
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.data.versionNumber).toBe(1);
    expect(result.data.validatedBy).toBe(practitioner.id);
    expect(result.data.validatedAt).toBeInstanceOf(Date);

    const { snapshot } = result.data;
    expect(snapshot.recommendations.map((row) => row.title)).toEqual([
      "Two litres of water",
      "A walk after lunch",
    ]);
    expect(snapshot.goals.map((row) => row.title)).toEqual(["More energy"]);
    expect(snapshot.supplements[0]).toMatchObject({
      name: "Magnesium",
      dose: "300 mg",
      timing: "",
    });
    expect(snapshot.instruction).toMatchObject({
      body: "Energy first",
      patientBody: "One change a week",
    });
    expect(snapshot.calculations).toHaveLength(1);
    expect(snapshot.calculations[0]).toMatchObject({
      kind: "protein",
      value: 60,
      parameters: { referenceWeightKg: 65, coefficient: 0.92 },
    });
  });

  it("returns the latest version to the reader", async () => {
    const validated = await validatedOf(patientId);
    expect(validated?.versionNumber).toBe(1);
    expect(validated?.validatedBy).toBe(practitioner.id);
    expect(validated?.snapshot.recommendations).toHaveLength(2);
  });

  it("writes one audit event with the counts and no patient text", async () => {
    const events = getDatabase().collection<AuditEvent>("audit_events");
    const all = (await events.findMany({ action: "protocol.validated" })).items;
    expect(all).toHaveLength(1);
    expect(all[0]?.targetId).toBe(patientId);
    expect(all[0]?.actorEmail).toBe(practitioner.email);
    expect(JSON.parse(all[0]?.detail ?? "{}")).toEqual({
      version: 1,
      recommendations: 2,
      goals: 1,
      supplements: 1,
      instruction: true,
      calculations: ["protein"],
      foodDirectives: 0,
      mealConfiguration: false,
    });
  });

  it("does not change with the working copy after the validation", async () => {
    const archived = await archivePatientRecommendation(holder, waterId, true);
    const added = await addPatientRecommendation(holder, patientId, {
      category: "habit",
      title: "Lights out at 23:00",
    });
    expect(archived.ok && added.ok).toBe(true);

    const validated = await validatedOf(patientId);
    expect(validated?.versionNumber).toBe(1);
    expect(validated?.snapshot.recommendations.map((row) => row.title)).toEqual(
      ["Two litres of water", "A walk after lunch"],
    );
  });

  it("writes version 2 and keeps the archived element in version 1", async () => {
    const result = await validateProtocol(holder, patientId, practitioner);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.versionNumber).toBe(2);
    }

    const validated = await validatedOf(patientId);
    expect(validated?.versionNumber).toBe(2);
    expect(validated?.snapshot.recommendations.map((row) => row.title)).toEqual(
      ["Lights out at 23:00", "A walk after lunch"],
    );

    const rows = (await versions().findMany({ patientId })).items;
    expect(rows.map((row) => row.versionNumber).sort()).toEqual([1, 2]);
    const first = rows.find((row) => row.versionNumber === 1);
    expect(first?.snapshot.recommendations.map((row) => row.title)).toContain(
      "Two litres of water",
    );
  });

  it("leaves out a calculation that needs a new validation", async () => {
    const calculations = getDatabase().collection<PatientCalculation>(
      "patient_calculations",
    );
    const [row] = (await calculations.findMany({ patientId, kind: "protein" }))
      .items;
    if (!row) {
      throw new Error("no protein row");
    }
    await calculations.update(row.id, { needsRevalidation: true });

    const result = await validateProtocol(holder, patientId, practitioner);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.versionNumber).toBe(3);
      expect(result.data.snapshot.calculations).toEqual([]);
    }
  });
});

describe("the scope of the validated protocol", () => {
  it("refuses another practitioner, as a missing file", async () => {
    const write = await validateProtocol(
      otherPractitioner,
      patientId,
      practitioner,
    );
    const read = await getValidatedProtocol(otherPractitioner, patientId);
    expect(write.ok).toBe(false);
    expect(read.ok).toBe(false);
    if (!write.ok && !read.ok) {
      expect(write.error).toBe("not_found");
      expect(read.error).toBe("not_found");
    }
    expect((await versions().findMany({ patientId })).items).toHaveLength(3);
  });

  it("refuses the validation by a read-only admin", async () => {
    const admin = operatorActor(
      { id: "00000000-0000-4000-8000-000000000003", role: "admin" },
      [patientId],
    );
    const read = await getValidatedProtocol(admin, patientId);
    const write = await validateProtocol(admin, patientId, practitioner);
    expect(read.ok).toBe(true);
    expect(write.ok).toBe(false);
  });

  it("lets the patient read its own validated protocol only", async () => {
    const own = await getValidatedProtocol(patientActor(patientId), patientId);
    expect(own.ok && own.data?.versionNumber).toBe(3);

    const otherPatientId = await newPatient("Louis", "to_validate");
    const other = await getValidatedProtocol(
      patientActor(otherPatientId),
      patientId,
    );
    expect(other.ok).toBe(false);
  });

  it("answers a malformed id as a missing file", async () => {
    const read = await getValidatedProtocol(systemActor, "not-an-id");
    expect(read.ok).toBe(false);
  });
});

describe("the limits of a validation", () => {
  it("refuses a file that is not yet at « Recommandations à valider »", async () => {
    const readyId = await newPatient("Nora", "to_complete");
    const added = await addPatientRecommendation(systemActor, readyId, {
      category: "nutrition",
      title: "Breakfast with protein",
    });
    expect(added.ok).toBe(true);
    const result = await validateProtocol(systemActor, readyId, practitioner);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("conflict");
    }
    expect(await validatedOf(readyId)).toBeNull();
  });

  it("validates a file at « Accompagnement actif » and changes no status", async () => {
    const activeId = await newPatient("Sam", "active");
    await addPatientGoal(systemActor, activeId, { title: "Sleep" });
    const result = await validateProtocol(systemActor, activeId, practitioner);
    expect(result.ok).toBe(true);
    expect((await profiles().findById(activeId))?.fileStatus).toBe("active");
  });

  it("reports a stored snapshot that fails the schema, and returns no content", async () => {
    const brokenId = await newPatient("Iris", "active");
    await versions().insert({
      patientId: brokenId,
      versionNumber: 1,
      validatedAt: new Date(),
      validatedBy: practitioner.id,
      snapshot: { schemaVersion: 1 } as unknown as ProtocolVersion["snapshot"],
    });
    const read = await getValidatedProtocol(systemActor, brokenId);
    expect(read.ok).toBe(false);
    if (!read.ok) {
      expect(read.error).toBe("upstream_failed");
    }
  });
});

describe("a coeliac disease that the patient names (REM-165)", () => {
  /** The same rows, read as the questionnaire reads them. */
  const answerRows = () =>
    getDatabase().collection<{
      id: string;
      pathologies: string | null;
      celiacDisease: boolean | null;
    }>("patient_profiles");

  it("refuses the validation until the practitioner answers", async () => {
    const id = await newPatient("Coeliac", "to_validate");
    await addPatientGoal(systemActor, id, { title: "Sleep" });
    await answerRows().update(id, { pathologies: "Maladie cœliaque" });

    const refused = await validateProtocol(holder, id, practitioner);
    expect(refused.ok).toBe(false);
    if (!refused.ok) {
      expect(refused.error).toBe("conflict");
      expect(refused.message).toBe("a coeliac disease is not confirmed");
    }
    expect(await validatedOf(id)).toBeNull();

    await answerRows().update(id, { celiacDisease: false });
    const validated = await validateProtocol(holder, id, practitioner);
    expect(validated.ok).toBe(true);
  });

  it("validates after the practitioner's « Oui »", async () => {
    const id = await newPatient("Confirmed", "to_validate");
    await addPatientGoal(systemActor, id, { title: "Sleep" });
    await answerRows().update(id, {
      pathologies: "Maladie cœliaque",
      celiacDisease: true,
    });
    const validated = await validateProtocol(holder, id, practitioner);
    expect(validated.ok).toBe(true);
  });
});
