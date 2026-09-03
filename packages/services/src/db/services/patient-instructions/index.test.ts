import { beforeAll, describe, expect, it } from "vitest";
import { registerDatabase } from "../../client";
import { createMemoryDatabase } from "../../test-helpers";
import { createPatient, getPatientByShareToken } from "../patients";
import {
  deletePatientInstruction,
  getPatientInstruction,
  listArchivedPatientInstructions,
  setPatientInstruction,
} from "./index";

let patientId: string;
let shareToken: string;

beforeAll(async () => {
  registerDatabase(createMemoryDatabase());
  const created = await createPatient({ pseudonym: "Claire" });
  if (!created.ok) {
    throw new Error("test patient not created");
  }
  patientId = created.data.id;
  shareToken = created.data.shareToken;
});

describe("the standing instruction", () => {
  it("starts absent, and no absence is an error", async () => {
    expect(await getPatientInstruction(patientId)).toBeNull();
    expect(await listArchivedPatientInstructions(patientId)).toHaveLength(0);
  });

  it("archives the current one when a replacement lands", async () => {
    const first = await setPatientInstruction(
      patientId,
      "Priorité énergie, peu de changements la première semaine",
    );
    expect(first.ok).toBe(true);

    const second = await setPatientInstruction(
      patientId,
      "Priorité digestion, on relâche sur les féculents",
    );
    expect(second.ok).toBe(true);

    const active = await getPatientInstruction(patientId);
    expect(active?.body).toBe(
      "Priorité digestion, on relâche sur les féculents",
    );

    const superseded = await listArchivedPatientInstructions(patientId);
    expect(superseded).toHaveLength(1);
    expect(superseded[0].body).toBe(
      "Priorité énergie, peu de changements la première semaine",
    );
    expect(superseded[0].archivedAt).not.toBeNull();
  });

  it("never leaves two in force — every write but the last is archived", async () => {
    await setPatientInstruction(patientId, "Troisième consigne");
    expect((await getPatientInstruction(patientId))?.body).toBe(
      "Troisième consigne",
    );
    expect(await listArchivedPatientInstructions(patientId)).toHaveLength(2);
  });

  it("treats re-saving the same words as a no-op, not a replacement", async () => {
    const before = await getPatientInstruction(patientId);
    const archivedBefore = await listArchivedPatientInstructions(patientId);
    if (!before) {
      throw new Error("expected a standing instruction");
    }

    const again = await setPatientInstruction(patientId, before.body);
    expect(again.ok).toBe(true);
    if (again.ok) {
      expect(again.data?.id).toBe(before.id);
    }
    expect(await listArchivedPatientInstructions(patientId)).toHaveLength(
      archivedBefore.length,
    );
  });

  it("clears to none, keeping the trail", async () => {
    const cleared = await setPatientInstruction(patientId, "   ");
    expect(cleared.ok).toBe(true);
    if (cleared.ok) {
      expect(cleared.data).toBeNull();
    }
    expect(await getPatientInstruction(patientId)).toBeNull();
    expect(await listArchivedPatientInstructions(patientId)).toHaveLength(3);
  });

  it("deletes a row that should never have been written", async () => {
    const written = await setPatientInstruction(
      patientId,
      "Une faute de frappe",
    );
    if (!written.ok || !written.data) {
      throw new Error("instruction not written");
    }
    expect((await deletePatientInstruction(written.data.id)).ok).toBe(true);
    expect(await getPatientInstruction(patientId)).toBeNull();
  });

  it("treats malformed ids as empty or not found", async () => {
    expect(await getPatientInstruction("not-a-uuid")).toBeNull();
    expect((await setPatientInstruction("not-a-uuid", "x")).ok).toBe(false);
    expect((await deletePatientInstruction("not-a-uuid")).ok).toBe(false);
  });

  it("never reaches the patient link", async () => {
    await setPatientInstruction(patientId, "Priorité énergie");
    const patient = await getPatientByShareToken(shareToken);
    if (!patient.ok) {
      throw new Error("patient not found by share token");
    }
    // The link's read is `patient_profiles` alone: no goal, check-in or
    // instruction travels with the profile.
    expect(Object.keys(patient.data)).not.toContain("instruction");
    expect(Object.keys(patient.data)).not.toContain("goals");
    expect(await getPatientInstruction(patientId)).not.toBeNull();
  });
});
