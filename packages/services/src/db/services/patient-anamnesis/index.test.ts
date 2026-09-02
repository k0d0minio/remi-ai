import { beforeAll, describe, expect, it } from "vitest";
import { anamnesisCategories } from "../../../shared/patient";
import { registerDatabase } from "../../client";
import { createMemoryDatabase } from "../../test-helpers";
import { createPatient, getPatient, getPatientByShareToken } from "../patients";
import { listPatientAnamnesis, setPatientAnamnesis } from "./index";

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

const unwrapOk = <T>(result: { ok: true; data: T } | { ok: false }): T => {
  expect(result.ok).toBe(true);
  if (!result.ok) {
    throw new Error("unreachable");
  }
  return result.data;
};

describe("structured anamnesis", () => {
  it("covers § B's twelve categories", () => {
    expect(anamnesisCategories).toHaveLength(12);
    expect(new Set(anamnesisCategories).size).toBe(12);
  });

  it("starts with no rows at all — an empty category costs nothing", async () => {
    expect(await listPatientAnamnesis(patientId)).toEqual([]);
  });

  it("records one category and reads it back", async () => {
    const written = unwrapOk(
      await setPatientAnamnesis(patientId, "digestion", "  Ballonnements.  "),
    );
    expect(written?.body).toBe("Ballonnements.");
    expect(written?.category).toBe("digestion");
  });

  it("updates a category in place rather than adding a second row", async () => {
    await setPatientAnamnesis(patientId, "digestion", "Ballonnements le soir.");
    const listed = await listPatientAnamnesis(patientId);
    expect(
      listed.filter((entry) => entry.category === "digestion"),
    ).toHaveLength(1);
    expect(listed[0].body).toBe("Ballonnements le soir.");
  });

  it("leaves the other categories byte-for-byte unchanged", async () => {
    unwrapOk(await setPatientAnamnesis(patientId, "sleep", "Réveils à 3h."));
    const before = await listPatientAnamnesis(patientId);
    const digestion = before.find((entry) => entry.category === "digestion");

    unwrapOk(await setPatientAnamnesis(patientId, "sleep", "Réveils à 4h."));
    const after = await listPatientAnamnesis(patientId);

    expect(after.find((entry) => entry.category === "digestion")).toEqual(
      digestion,
    );
  });

  it("reads in § B's order, not the order she typed them", async () => {
    // `motive` is § B's first category and was recorded after the other two.
    unwrapOk(await setPatientAnamnesis(patientId, "motive", "Fatigue."));
    expect(
      (await listPatientAnamnesis(patientId)).map((entry) => entry.category),
    ).toEqual(["motive", "digestion", "sleep"]);
  });

  it("deletes the row when the body is cleared", async () => {
    expect(unwrapOk(await setPatientAnamnesis(patientId, "sleep", ""))).toBe(
      null,
    );
    expect(
      (await listPatientAnamnesis(patientId)).some(
        (entry) => entry.category === "sleep",
      ),
    ).toBe(false);
  });

  it("treats whitespace as empty, and clearing an absent category as a no-op", async () => {
    expect(
      unwrapOk(await setPatientAnamnesis(patientId, "hydration", "   ")),
    ).toBe(null);
    expect(unwrapOk(await setPatientAnamnesis(patientId, "immunity", ""))).toBe(
      null,
    );
    expect(await listPatientAnamnesis(patientId)).toHaveLength(2);
  });

  it("refuses a category that is not in the vocabulary", async () => {
    const result = await setPatientAnamnesis(patientId, "astrology", "…");
    expect(result.ok).toBe(false);
    expect(await listPatientAnamnesis(patientId)).toHaveLength(2);
  });

  it("marks the profile as worked on", async () => {
    const before = unwrapOk(await getPatient(patientId));
    await new Promise((resolve) => setTimeout(resolve, 5));
    unwrapOk(await setPatientAnamnesis(patientId, "context", "Deux enfants."));
    const after = unwrapOk(await getPatient(patientId));
    expect(after.lastEditedAt.getTime()).toBeGreaterThan(
      before.lastEditedAt.getTime(),
    );
  });

  it("treats malformed ids as empty or not found", async () => {
    expect(await listPatientAnamnesis("not-a-uuid")).toEqual([]);
    expect((await setPatientAnamnesis("not-a-uuid", "motive", "x")).ok).toBe(
      false,
    );
  });

  it("never reaches the patient link", async () => {
    const patient = unwrapOk(await getPatientByShareToken(shareToken));
    // The link's read is `patient_profiles` alone: no anamnesis entry travels
    // with the profile, and the legacy blob it does carry stays empty here.
    expect(Object.keys(patient)).not.toContain("anamnesisEntries");
    expect(patient.anamnesis).toBe("");
    expect(await listPatientAnamnesis(patientId)).toHaveLength(3);
  });
});
