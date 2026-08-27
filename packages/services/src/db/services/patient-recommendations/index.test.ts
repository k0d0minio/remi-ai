import { beforeAll, describe, expect, it } from "vitest";
import { registerDatabase } from "../../client";
import { createMemoryDatabase } from "../../test-helpers";
import { createPatient } from "../patients";
import {
  addPatientRecommendation,
  deletePatientRecommendation,
  listPatientRecommendations,
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

  it("lists in the order they were encoded", async () => {
    await addPatientRecommendation(patientId, {
      category: "nutrition",
      title: "No gluten for 8 weeks",
    });
    const listed = await listPatientRecommendations(patientId);
    expect(listed.map((entry) => entry.title)).toEqual([
      "Omega-3 — 2 g daily",
      "No gluten for 8 weeks",
    ]);
  });

  it("updates and deletes an entry", async () => {
    const listed = await listPatientRecommendations(patientId);
    const first = listed[0];
    const updated = await updatePatientRecommendation(first.id, {
      title: "Omega-3 — 1 g daily",
    });
    expect(updated.ok).toBe(true);

    const deleted = await deletePatientRecommendation(first.id);
    expect(deleted.ok).toBe(true);
    const remaining = await listPatientRecommendations(patientId);
    expect(remaining.some((entry) => entry.id === first.id)).toBe(false);
  });

  it("answers an empty list for a malformed patient id", async () => {
    expect(await listPatientRecommendations("not-a-uuid")).toEqual([]);
  });
});
