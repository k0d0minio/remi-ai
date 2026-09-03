import { beforeAll, describe, expect, it } from "vitest";
import { registerDatabase } from "../../client";
import { createMemoryDatabase } from "../../test-helpers";
import type { PatientSupplement } from "../../models/patient-supplement";
import { createPatient } from "../patients";
import {
  addPatientSupplement,
  archivePatientSupplement,
  deletePatientSupplement,
  listArchivedPatientSupplements,
  listPatientSupplements,
  movePatientSupplement,
  updatePatientSupplement,
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

const names = async (id: string) =>
  (await listPatientSupplements(id)).map((entry) => entry.name);

/** Throws rather than asserting non-null — a missing row is a broken test. */
const entryNamed = (
  entries: readonly PatientSupplement[],
  name: string,
): PatientSupplement => {
  const found = entries.find((entry) => entry.name === name);
  if (!found) {
    throw new Error(`no supplement named "${name}"`);
  }
  return found;
};

describe("patient supplements", () => {
  it("round-trips all four fields", async () => {
    const result = await addPatientSupplement(patientId, {
      name: "Magnésium bisglycinate",
      dose: "300 mg",
      timing: "le soir, au coucher",
      reason: "sommeil et crampes",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.data.name).toBe("Magnésium bisglycinate");
    expect(result.data.dose).toBe("300 mg");
    expect(result.data.timing).toBe("le soir, au coucher");
    expect(result.data.reason).toBe("sommeil et crampes");
    expect(result.data.archivedAt).toBeNull();
  });

  it("requires a name", async () => {
    const result = await addPatientSupplement(patientId, { name: "  " });
    expect(result.ok).toBe(false);
  });

  it("appends in order and reorders on request", async () => {
    await addPatientSupplement(patientId, { name: "Oméga-3" });
    await addPatientSupplement(patientId, { name: "Vitamine D" });
    expect(await names(patientId)).toEqual([
      "Magnésium bisglycinate",
      "Oméga-3",
      "Vitamine D",
    ]);

    const last = entryNamed(
      await listPatientSupplements(patientId),
      "Vitamine D",
    );
    const moved = await movePatientSupplement(last.id, "up");
    expect(moved.ok).toBe(true);
    expect(await names(patientId)).toEqual([
      "Magnésium bisglycinate",
      "Vitamine D",
      "Oméga-3",
    ]);
  });

  it("moving past the end does nothing and is not an error", async () => {
    const first = (await listPatientSupplements(patientId))[0];
    const before = await names(patientId);
    const result = await movePatientSupplement(first.id, "up");
    expect(result.ok).toBe(true);
    expect(await names(patientId)).toEqual(before);
  });

  it("updates a field without disturbing the others", async () => {
    const entry = entryNamed(
      await listPatientSupplements(patientId),
      "Oméga-3",
    );
    const updated = await updatePatientSupplement(entry.id, { dose: "2 g" });
    expect(updated.ok).toBe(true);
    if (!updated.ok) {
      return;
    }
    expect(updated.data.dose).toBe("2 g");
    expect(updated.data.name).toBe("Oméga-3");
  });

  it("archives out of the protocol then restores, keeping the row", async () => {
    const entry = entryNamed(
      await listPatientSupplements(patientId),
      "Vitamine D",
    );
    const archived = await archivePatientSupplement(entry.id, true);
    expect(archived.ok).toBe(true);
    expect(await names(patientId)).not.toContain("Vitamine D");

    const history = await listArchivedPatientSupplements(patientId);
    expect(history.map((item) => item.name)).toContain("Vitamine D");

    const restored = await archivePatientSupplement(entry.id, false);
    expect(restored.ok).toBe(true);
    expect(await names(patientId)).toContain("Vitamine D");
  });

  it("deletes an entry permanently", async () => {
    const first = (await listPatientSupplements(patientId))[0];
    const deleted = await deletePatientSupplement(first.id);
    expect(deleted.ok).toBe(true);
    const remaining = await listPatientSupplements(patientId);
    expect(remaining.some((entry) => entry.id === first.id)).toBe(false);
  });

  it("answers an empty list for a malformed patient id", async () => {
    expect(await listPatientSupplements("not-a-uuid")).toEqual([]);
    expect(await listArchivedPatientSupplements("not-a-uuid")).toEqual([]);
  });

  it("treats a malformed entry id as not found", async () => {
    expect((await movePatientSupplement("not-a-uuid", "up")).ok).toBe(false);
    expect((await archivePatientSupplement("not-a-uuid", true)).ok).toBe(false);
    expect((await updatePatientSupplement("not-a-uuid", {})).ok).toBe(false);
    expect((await deletePatientSupplement("not-a-uuid")).ok).toBe(false);
  });
});
