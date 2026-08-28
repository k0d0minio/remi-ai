import { beforeAll, describe, expect, it } from "vitest";
import { registerDatabase } from "../../client";
import { createMemoryDatabase } from "../../test-helpers";
import type { PatientRecommendation } from "../../models/patient-recommendation";
import { createPatient } from "../patients";
import {
  addPatientRecommendation,
  archivePatientRecommendation,
  deletePatientRecommendation,
  listArchivedPatientRecommendations,
  listPatientRecommendations,
  movePatientRecommendation,
  updatePatientRecommendation,
} from "./index";

let patientId: string;

beforeAll(async () => {
  registerDatabase(createMemoryDatabase());
  const created = await createPatient({ pseudonym: "Claire" });
  if (!created.ok) {
    throw new Error("test patient not created");
  }
  patientId = created.data.id;
});

const titles = async (id: string) =>
  (await listPatientRecommendations(id)).map((entry) => entry.title);

/** Throws rather than asserting non-null — a missing row is a broken test. */
const entryTitled = (
  entries: readonly PatientRecommendation[],
  title: string,
): PatientRecommendation => {
  const found = entries.find((entry) => entry.title === title);
  if (!found) {
    throw new Error(`no recommendation titled "${title}"`);
  }
  return found;
};

describe("patient recommendations", () => {
  it("encodes an entry with its category", async () => {
    const result = await addPatientRecommendation(patientId, {
      category: "supplement",
      title: "Omega-3 — 2 g daily",
      detail: "With a meal, for 12 weeks.",
    });
    expect(result.ok).toBe(true);
  });

  it("requires a title", async () => {
    const result = await addPatientRecommendation(patientId, {
      category: "nutrition",
      title: "  ",
    });
    expect(result.ok).toBe(false);
  });

  it("groups by category in the protocol's reading order", async () => {
    await addPatientRecommendation(patientId, {
      category: "nutrition",
      title: "No gluten for 8 weeks",
    });
    // Nutrition precedes supplement in `recommendationCategories`, so the
    // later entry reads first — the list is a protocol, not a log.
    expect(await titles(patientId)).toEqual([
      "No gluten for 8 weeks",
      "Omega-3 — 2 g daily",
    ]);
  });

  it("appends within a category and reorders on request", async () => {
    await addPatientRecommendation(patientId, {
      category: "nutrition",
      title: "Two litres of water",
    });
    await addPatientRecommendation(patientId, {
      category: "nutrition",
      title: "Protein at breakfast",
    });
    expect(await titles(patientId)).toEqual([
      "No gluten for 8 weeks",
      "Two litres of water",
      "Protein at breakfast",
      "Omega-3 — 2 g daily",
    ]);

    const last = entryTitled(
      await listPatientRecommendations(patientId),
      "Protein at breakfast",
    );
    const moved = await movePatientRecommendation(last.id, "up");
    expect(moved.ok).toBe(true);
    expect(await titles(patientId)).toEqual([
      "No gluten for 8 weeks",
      "Protein at breakfast",
      "Two litres of water",
      "Omega-3 — 2 g daily",
    ]);
  });

  it("moving past the end of a category does nothing and is not an error", async () => {
    const listed = await listPatientRecommendations(patientId);
    const first = listed[0];
    const before = await titles(patientId);
    const result = await movePatientRecommendation(first.id, "up");
    expect(result.ok).toBe(true);
    expect(await titles(patientId)).toEqual(before);
  });

  it("appends to the destination when an entry changes category", async () => {
    const entry = entryTitled(
      await listPatientRecommendations(patientId),
      "Protein at breakfast",
    );
    const updated = await updatePatientRecommendation(entry.id, {
      category: "habit",
    });
    expect(updated.ok).toBe(true);
    // Habit sits after nutrition and before supplement in the vocabulary.
    expect(await titles(patientId)).toEqual([
      "No gluten for 8 weeks",
      "Two litres of water",
      "Protein at breakfast",
      "Omega-3 — 2 g daily",
    ]);
  });

  it("archives out of the protocol without losing the row", async () => {
    const entry = entryTitled(
      await listPatientRecommendations(patientId),
      "Two litres of water",
    );
    const archived = await archivePatientRecommendation(entry.id, true);
    expect(archived.ok).toBe(true);
    expect(await titles(patientId)).not.toContain("Two litres of water");

    const history = await listArchivedPatientRecommendations(patientId);
    expect(history.map((item) => item.title)).toContain("Two litres of water");

    const restored = await archivePatientRecommendation(entry.id, false);
    expect(restored.ok).toBe(true);
    expect(await titles(patientId)).toContain("Two litres of water");
  });

  it("updates and deletes an entry", async () => {
    const listed = await listPatientRecommendations(patientId);
    const first = listed[0];
    const updated = await updatePatientRecommendation(first.id, {
      title: "No gluten for 12 weeks",
    });
    expect(updated.ok).toBe(true);

    const deleted = await deletePatientRecommendation(first.id);
    expect(deleted.ok).toBe(true);
    const remaining = await listPatientRecommendations(patientId);
    expect(remaining.some((entry) => entry.id === first.id)).toBe(false);
  });

  it("answers an empty list for a malformed patient id", async () => {
    expect(await listPatientRecommendations("not-a-uuid")).toEqual([]);
    expect(await listArchivedPatientRecommendations("not-a-uuid")).toEqual([]);
  });

  it("treats a malformed entry id as not found", async () => {
    expect((await movePatientRecommendation("not-a-uuid", "up")).ok).toBe(
      false,
    );
    expect((await archivePatientRecommendation("not-a-uuid", true)).ok).toBe(
      false,
    );
    expect((await updatePatientRecommendation("not-a-uuid", {})).ok).toBe(
      false,
    );
    expect((await deletePatientRecommendation("not-a-uuid")).ok).toBe(false);
  });
});
