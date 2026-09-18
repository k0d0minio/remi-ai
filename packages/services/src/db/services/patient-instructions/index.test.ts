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
    const first = await setPatientInstruction(patientId, {
      body: "Priorité énergie, peu de changements la première semaine",
      patientBody: "",
    });
    expect(first.ok).toBe(true);

    const second = await setPatientInstruction(patientId, {
      body: "Priorité digestion, on relâche sur les féculents",
      patientBody: "",
    });
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
    await setPatientInstruction(patientId, {
      body: "Troisième consigne",
      patientBody: "",
    });
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

    const again = await setPatientInstruction(patientId, {
      body: before.body,
      patientBody: before.patientBody ?? "",
    });
    expect(again.ok).toBe(true);
    if (again.ok) {
      expect(again.data?.id).toBe(before.id);
    }
    expect(await listArchivedPatientInstructions(patientId)).toHaveLength(
      archivedBefore.length,
    );
  });

  it("clears to none, keeping the trail", async () => {
    const cleared = await setPatientInstruction(patientId, {
      body: "   ",
      patientBody: "   ",
    });
    expect(cleared.ok).toBe(true);
    if (cleared.ok) {
      expect(cleared.data).toBeNull();
    }
    expect(await getPatientInstruction(patientId)).toBeNull();
    expect(await listArchivedPatientInstructions(patientId)).toHaveLength(3);
  });

  it("deletes a row that should never have been written", async () => {
    const written = await setPatientInstruction(patientId, {
      body: "Une faute de frappe",
      patientBody: "",
    });
    if (!written.ok || !written.data) {
      throw new Error("instruction not written");
    }
    expect((await deletePatientInstruction(written.data.id)).ok).toBe(true);
    expect(await getPatientInstruction(patientId)).toBeNull();
  });

  it("treats malformed ids as empty or not found", async () => {
    expect(await getPatientInstruction("not-a-uuid")).toBeNull();
    expect(
      (
        await setPatientInstruction("not-a-uuid", {
          body: "x",
          patientBody: "",
        })
      ).ok,
    ).toBe(false);
    expect((await deletePatientInstruction("not-a-uuid")).ok).toBe(false);
  });

  it("never reaches the patient link", async () => {
    await setPatientInstruction(patientId, {
      body: "Priorité énergie",
      patientBody: "",
    });
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

describe("the patient-facing half of the consigne", () => {
  let ownId: string;

  beforeAll(async () => {
    const created = await createPatient({ pseudonym: "Inès" });
    if (!created.ok) {
      throw new Error("test patient not created");
    }
    ownId = created.data.id;
  });

  it("is absent until she writes one, and never falls back to the REMI line", async () => {
    await setPatientInstruction(ownId, {
      body: "Priorité énergie, peu de changements",
      patientBody: "",
    });

    const active = await getPatientInstruction(ownId);
    expect(active?.body).toBe("Priorité énergie, peu de changements");
    // The home renders nothing rather than showing the line above, which is
    // addressed to REMI.
    expect(active?.patientBody).toBeNull();
  });

  it("holds both halves on the one row, each with its own words", async () => {
    await setPatientInstruction(ownId, {
      body: "Priorité digestion, on relâche sur les féculents",
      patientBody: "Cette semaine : un légume cuit à chaque repas.",
    });

    const active = await getPatientInstruction(ownId);
    expect(active?.body).toBe(
      "Priorité digestion, on relâche sur les féculents",
    );
    expect(active?.patientBody).toBe(
      "Cette semaine : un légume cuit à chaque repas.",
    );
  });

  it("counts a change to either half as a replacement", async () => {
    const before = await getPatientInstruction(ownId);
    if (!before) {
      throw new Error("expected a standing instruction");
    }
    const archivedBefore = await listArchivedPatientInstructions(ownId);

    await setPatientInstruction(ownId, {
      body: before.body,
      patientBody: "Cette semaine : deux légumes cuits par jour.",
    });

    const after = await getPatientInstruction(ownId);
    expect(after?.id).not.toBe(before.id);
    expect(await listArchivedPatientInstructions(ownId)).toHaveLength(
      archivedBefore.length + 1,
    );
  });

  it("takes a patient-facing consigne with no REMI line at all", async () => {
    await setPatientInstruction(ownId, {
      body: "",
      patientBody: "Cette semaine : on boit un verre d'eau au réveil.",
    });

    const active = await getPatientInstruction(ownId);
    expect(active?.body).toBe("");
    expect(active?.patientBody).toBe(
      "Cette semaine : on boit un verre d'eau au réveil.",
    );
  });

  it("clears only when both halves are empty", async () => {
    await setPatientInstruction(ownId, { body: "", patientBody: "   " });
    expect(await getPatientInstruction(ownId)).toBeNull();
  });

  it("treats re-saving both halves unchanged as a no-op", async () => {
    const written = await setPatientInstruction(ownId, {
      body: "Priorité sommeil",
      patientBody: "Cette semaine : au lit avant 23h.",
    });
    if (!written.ok || !written.data) {
      throw new Error("instruction not written");
    }
    const archivedBefore = await listArchivedPatientInstructions(ownId);

    const again = await setPatientInstruction(ownId, {
      body: "Priorité sommeil",
      patientBody: "Cette semaine : au lit avant 23h.",
    });
    expect(again.ok).toBe(true);
    if (again.ok) {
      expect(again.data?.id).toBe(written.data.id);
    }
    expect(await listArchivedPatientInstructions(ownId)).toHaveLength(
      archivedBefore.length,
    );
  });
});
