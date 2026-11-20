import { beforeAll, describe, expect, it } from "vitest";
import { getDatabase, registerDatabase } from "../client";
import type { AuditEvent } from "../models/audit-event";
import type { PatientProfile } from "../models/patient-profile";
import { createMemoryDatabase, testPractitionerId } from "../test-helpers";
import { systemActor } from "./access";
import { firstRecommendationReason } from "./first-recommendation";
import { addPatientGoal } from "./patient-goals";
import { setPatientInstruction } from "./patient-instructions";
import {
  addPatientRecommendation,
  savePatientRecommendations,
} from "./patient-recommendations";
import {
  addPatientSupplement,
  savePatientSupplements,
} from "./patient-supplements";
import { createPatient } from "./patients";

const profiles = () =>
  getDatabase().collection<PatientProfile>("patient_profiles");

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

const statusOf = async (patientId: string) =>
  (await profiles().findById(patientId))?.fileStatus;

const movesOf = async (patientId: string) =>
  (
    await getDatabase()
      .collection<AuditEvent>("audit_events")
      .findMany({ targetId: patientId, action: "patient.file_status_changed" })
  ).items;

beforeAll(() => {
  registerDatabase(createMemoryDatabase());
});

describe("the move to « Recommandations à valider » (D-31)", () => {
  it("follows the first recommendation on a file at « Prêt pour consultation »", async () => {
    const patientId = await newPatient("Claire", "ready");
    const added = await addPatientRecommendation(systemActor, patientId, {
      category: "nutrition",
      title: "Two litres of water",
    });
    expect(added.ok).toBe(true);
    expect(await statusOf(patientId)).toBe("to_validate");

    const moves = await movesOf(patientId);
    expect(moves).toHaveLength(1);
    expect(moves[0]?.actorKind).toBe("system");
    expect(moves[0]?.detail).toBe(
      `ready → to_validate: ${firstRecommendationReason}`,
    );
  });

  it("writes one event only: a second save moves nothing", async () => {
    const patientId = await newPatient("Louis", "ready");
    await addPatientGoal(systemActor, patientId, { title: "More energy" });
    await addPatientSupplement(systemActor, patientId, { name: "Magnesium" });
    expect(await statusOf(patientId)).toBe("to_validate");
    expect(await movesOf(patientId)).toHaveLength(1);
  });

  const saves = [
    {
      kind: "a goal",
      save: (patientId: string) =>
        addPatientGoal(systemActor, patientId, { title: "Sleep" }),
    },
    {
      kind: "a supplement",
      save: (patientId: string) =>
        addPatientSupplement(systemActor, patientId, { name: "Zinc" }),
    },
    {
      kind: "the instruction",
      save: (patientId: string) =>
        setPatientInstruction(systemActor, patientId, {
          body: "Energy first",
          patientBody: "",
        }),
    },
    {
      kind: "a saved section of recommendations",
      save: (patientId: string) =>
        savePatientRecommendations(systemActor, patientId, [
          { category: "habit", title: "Lights out at 23:00", detail: "" },
        ]),
    },
    {
      kind: "a saved section of supplements",
      save: (patientId: string) =>
        savePatientSupplements(systemActor, patientId, [
          { name: "Omega-3", dose: "", timing: "", reason: "" },
        ]),
    },
  ];

  it.each(saves)("follows $kind", async ({ save }) => {
    const patientId = await newPatient("Nora", "ready");
    const saved = await save(patientId);
    expect(saved.ok).toBe(true);
    expect(await statusOf(patientId)).toBe("to_validate");
  });

  it("moves nothing on a file still « à compléter »", async () => {
    const patientId = await newPatient("Sam", "to_complete");
    await addPatientRecommendation(systemActor, patientId, {
      category: "nutrition",
      title: "Breakfast with protein",
    });
    expect(await statusOf(patientId)).toBe("to_complete");
    expect(await movesOf(patientId)).toHaveLength(0);
  });

  it("moves nothing on a file at « Accompagnement actif »", async () => {
    const patientId = await newPatient("Iris", "active");
    await addPatientGoal(systemActor, patientId, { title: "Sleep" });
    expect(await statusOf(patientId)).toBe("active");
    expect(await movesOf(patientId)).toHaveLength(0);
  });

  it("moves nothing for a refused save or an empty section", async () => {
    const patientId = await newPatient("Lou", "ready");
    const refused = await addPatientRecommendation(systemActor, patientId, {
      category: "nutrition",
      title: "",
    });
    const empty = await savePatientRecommendations(systemActor, patientId, []);
    expect(refused.ok).toBe(false);
    expect(empty.ok).toBe(true);
    expect(await statusOf(patientId)).toBe("ready");
  });
});
