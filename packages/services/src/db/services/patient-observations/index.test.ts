import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { registerDatabase } from "../../client";
import { createMemoryDatabase } from "../../test-helpers";
import { addMealEntry, archiveMealEntry } from "../meal-entries";
import { createPatient } from "../patients";
import {
  addPatientObservation,
  archivePatientObservation,
  deletePatientObservation,
  listArchivedPatientObservations,
  listPatientLearnings,
  listPatientObservations,
  updatePatientObservation,
} from "./index";

let patientId: string;

beforeAll(() => {
  registerDatabase(createMemoryDatabase());
});

/** A fresh patient per test — the same isolation the service itself gives. */
beforeEach(async () => {
  const created = await createPatient({ pseudonym: "Claire" });
  if (!created.ok) {
    throw new Error("test patient not created");
  }
  patientId = created.data.id;
});

const observe = async (body: string, observedOn: string) => {
  const result = await addPatientObservation(patientId, { body, observedOn });
  if (!result.ok) {
    throw new Error(`expected an observation, got ${result.message}`);
  }
  return result.data;
};

describe("patient observations", () => {
  it("records an observation against a day", async () => {
    const observation = await observe("Yaourts sucrés le matin", "2026-09-01");

    expect(observation.body).toBe("Yaourts sucrés le matin");
    expect(observation.observedOn).toBe("2026-09-01");
    expect(await listPatientObservations(patientId)).toHaveLength(1);
  });

  it("requires a body and a valid date", async () => {
    expect(
      (
        await addPatientObservation(patientId, {
          body: "",
          observedOn: "2026-09-01",
        })
      ).ok,
    ).toBe(false);
    expect(
      (
        await addPatientObservation(patientId, {
          body: "Quelque chose",
          observedOn: "hier",
        })
      ).ok,
    ).toBe(false);
    expect(
      (
        await addPatientObservation(patientId, {
          body: "x".repeat(1001),
          observedOn: "2026-09-01",
        })
      ).ok,
    ).toBe(false);
  });

  it("refuses an observation for a patient that does not exist", async () => {
    const result = await addPatientObservation("not-a-uuid", {
      body: "Quelque chose",
      observedOn: "2026-09-01",
    });

    expect(result.ok).toBe(false);
  });

  it("edits, archives, restores and deletes", async () => {
    const observation = await observe("Première version", "2026-09-01");

    const edited = await updatePatientObservation(observation.id, {
      body: "Deuxième version",
    });
    expect(edited.ok).toBe(true);

    await archivePatientObservation(observation.id, true);
    expect(await listPatientObservations(patientId)).toHaveLength(0);
    expect(await listArchivedPatientObservations(patientId)).toHaveLength(1);

    await archivePatientObservation(observation.id, false);
    expect(await listPatientObservations(patientId)).toHaveLength(1);

    expect((await deletePatientObservation(observation.id)).ok).toBe(true);
    expect((await deletePatientObservation(observation.id)).ok).toBe(false);
  });
});

describe("the learnings view", () => {
  it("merges per-entry learnings with standalone observations, newest first", async () => {
    await addMealEntry(patientId, {
      eatenOn: "2026-09-02",
      description: "Saumon",
      learning: "Aime le saumon",
    });
    await observe("Yaourts sucrés le matin", "2026-09-03");
    await addMealEntry(patientId, {
      eatenOn: "2026-08-31",
      description: "Pâtes",
      learning: "Portion de pâtes trop grande",
    });

    const learnings = await listPatientLearnings(patientId);

    expect(learnings.map((learning) => learning.body)).toEqual([
      "Yaourts sucrés le matin",
      "Aime le saumon",
      "Portion de pâtes trop grande",
    ]);
    expect(learnings.map((learning) => learning.kind)).toEqual([
      "observation",
      "meal",
      "meal",
    ]);
  });

  it("carries the meal a per-entry learning came from", async () => {
    await addMealEntry(patientId, {
      eatenOn: "2026-09-02",
      description: "Saumon, riz complet",
      learning: "Aime le saumon",
    });

    const [learning] = await listPatientLearnings(patientId);
    expect(learning.kind).toBe("meal");
    if (learning.kind !== "meal") {
      return;
    }
    expect(learning.entry.description).toBe("Saumon, riz complet");
  });

  it("leaves out meals that carry no learning", async () => {
    await addMealEntry(patientId, {
      eatenOn: "2026-09-02",
      description: "Un plat sans remarque",
    });

    expect(await listPatientLearnings(patientId)).toHaveLength(0);
  });

  it("drops a learning when its entry is archived, and an archived observation", async () => {
    const entry = await addMealEntry(patientId, {
      eatenOn: "2026-09-02",
      description: "Saumon",
      learning: "Aime le saumon",
    });
    const observation = await observe("Yaourts sucrés", "2026-09-03");
    if (!entry.ok) {
      throw new Error("test entry not created");
    }

    await archiveMealEntry(entry.data.id, true);
    await archivePatientObservation(observation.id, true);

    expect(await listPatientLearnings(patientId)).toHaveLength(0);
  });
});
