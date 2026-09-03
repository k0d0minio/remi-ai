import { beforeAll, describe, expect, it } from "vitest";
import { registerDatabase } from "../../client";
import { createMemoryDatabase } from "../../test-helpers";
import { createPatient, getPatient, getPatientByShareToken } from "../patients";
import { getPatientSummary, setPatientSummary } from "./index";

let patientId: string;
let shareToken: string;

/**
 * `lastEditedAt` is millisecond-resolution, so a write in the same tick as the
 * read before it is indistinguishable. The stamp assertion needs a real gap.
 */
const tick = () => new Promise((resolve) => setTimeout(resolve, 5));

beforeAll(async () => {
  registerDatabase(createMemoryDatabase());
  const created = await createPatient({ pseudonym: "Claire" });
  if (!created.ok) {
    throw new Error("test patient not created");
  }
  patientId = created.data.id;
  shareToken = created.data.shareToken;
});

/** The single row per patient, read straight off the collection. */
const rowCount = async (): Promise<number> => {
  const one = await getPatientSummary(patientId);
  return one ? 1 : 0;
};

describe("the living summary", () => {
  it("starts absent, and no absence is an error", async () => {
    expect(await getPatientSummary(patientId)).toBeNull();
  });

  it("inserts the first body written", async () => {
    const result = await setPatientSummary(
      patientId,
      "Contexte : fatigue chronique. Vigilance : fer bas. Va bien : sommeil.",
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data?.body).toContain("fatigue chronique");
    }
    expect(await rowCount()).toBe(1);
  });

  it("updates in place rather than adding a second row", async () => {
    const first = await getPatientSummary(patientId);
    const second = await setPatientSummary(
      patientId,
      "Révisé : l'énergie remonte, le fer est corrigé.",
    );
    expect(second.ok).toBe(true);

    const active = await getPatientSummary(patientId);
    expect(active?.body).toBe(
      "Révisé : l'énergie remonte, le fer est corrigé.",
    );
    expect(active?.id).toBe(first?.id);
    expect(await rowCount()).toBe(1);
  });

  it("treats re-saving the same words as a no-op, not a revision", async () => {
    const before = await getPatientSummary(patientId);
    if (!before) {
      throw new Error("expected a summary");
    }
    const again = await setPatientSummary(patientId, before.body);
    expect(again.ok).toBe(true);
    if (again.ok) {
      expect(again.data?.id).toBe(before.id);
      expect(again.data?.updatedAt.getTime()).toBe(before.updatedAt.getTime());
    }
    expect(await rowCount()).toBe(1);
  });

  it("clears to none when saved empty, keeping no blank row", async () => {
    const cleared = await setPatientSummary(patientId, "   ");
    expect(cleared.ok).toBe(true);
    if (cleared.ok) {
      expect(cleared.data).toBeNull();
    }
    expect(await getPatientSummary(patientId)).toBeNull();
    expect(await rowCount()).toBe(0);
  });

  it("treats clearing a patient who has none as a no-op", async () => {
    const cleared = await setPatientSummary(patientId, "");
    expect(cleared.ok).toBe(true);
    if (cleared.ok) {
      expect(cleared.data).toBeNull();
    }
  });

  it("moves the roster's last-edited stamp on a real write", async () => {
    const before = await getPatient(patientId);
    await tick();
    await setPatientSummary(patientId, "Nouveau point de départ.");
    const after = await getPatient(patientId);
    if (!before.ok || !after.ok) {
      throw new Error("patient not found");
    }
    expect(after.data.lastEditedAt.getTime()).toBeGreaterThan(
      before.data.lastEditedAt.getTime(),
    );
  });

  it("treats malformed ids as empty or not found", async () => {
    expect(await getPatientSummary("not-a-uuid")).toBeNull();
    expect((await setPatientSummary("not-a-uuid", "x")).ok).toBe(false);
  });

  it("never reaches the patient link", async () => {
    await setPatientSummary(patientId, "Résumé vivant, écrit pour elle.");
    const patient = await getPatientByShareToken(shareToken);
    if (!patient.ok) {
      throw new Error("patient not found by share token");
    }
    // The link's read is `patient_profiles` alone: no summary travels with the
    // profile. § J's render at the link is the patient-surface epic's.
    expect(Object.keys(patient.data)).not.toContain("summary");
    expect(await getPatientSummary(patientId)).not.toBeNull();
  });
});
