import { beforeAll, describe, expect, it } from "vitest";
import { registerDatabase } from "../../client";
import { createMemoryDatabase } from "../../test-helpers";
import {
  createPatient,
  deletePatient,
  getPatient,
  getPatientByShareToken,
  listPatients,
  regenerateShareToken,
  updatePatient,
} from "./index";

beforeAll(() => {
  registerDatabase(createMemoryDatabase());
});

const unwrapOk = <T>(result: { ok: true; data: T } | { ok: false }): T => {
  expect(result.ok).toBe(true);
  if (!result.ok) {
    throw new Error("unreachable");
  }
  return result.data;
};

describe("patient profiles", () => {
  it("creates with defaults and an unguessable share token", async () => {
    const patient = unwrapOk(await createPatient({ pseudonym: "Claire" }));
    expect(patient.pseudonym).toBe("Claire");
    expect(patient.fullName).toBeNull();
    expect(patient.email).toBeNull();
    expect(patient.locale).toBe("fr");
    expect(patient.status).toBe("active");
    expect(patient.shareToken.length).toBeGreaterThanOrEqual(24);
  });

  it("requires a pseudonym", async () => {
    const result = await createPatient({ pseudonym: "   " });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("invalid_input");
    }
  });

  it("rejects an invalid email", async () => {
    const result = await createPatient({
      pseudonym: "Claire",
      email: "not-an-email",
    });
    expect(result.ok).toBe(false);
  });

  it("updates partially without blanking the rest", async () => {
    const created = unwrapOk(
      await createPatient({
        pseudonym: "Marc",
        objective: "sleep better",
        constraints: "no gluten",
      }),
    );
    const updated = unwrapOk(
      await updatePatient(created.id, { objective: "sleep and energy" }),
    );
    expect(updated.objective).toBe("sleep and energy");
    expect(updated.constraints).toBe("no gluten");
    expect(updated.pseudonym).toBe("Marc");
    expect(updated.shareToken).toBe(created.shareToken);
  });

  it("maps an emptied full name and email back to null", async () => {
    const created = unwrapOk(
      await createPatient({
        pseudonym: "Iris",
        fullName: "Iris Dupont",
        email: "iris@example.com",
      }),
    );
    const updated = unwrapOk(
      await updatePatient(created.id, { fullName: "", email: "" }),
    );
    expect(updated.fullName).toBeNull();
    expect(updated.email).toBeNull();
  });

  it("resolves the share token exactly, and not at all after regeneration", async () => {
    const created = unwrapOk(await createPatient({ pseudonym: "Nora" }));
    const byToken = unwrapOk(await getPatientByShareToken(created.shareToken));
    expect(byToken.id).toBe(created.id);

    const regenerated = unwrapOk(await regenerateShareToken(created.id));
    expect(regenerated.shareToken).not.toBe(created.shareToken);
    expect((await getPatientByShareToken(created.shareToken)).ok).toBe(false);
    expect((await getPatientByShareToken(regenerated.shareToken)).ok).toBe(
      true,
    );
  });

  it("treats a malformed id or token as not found, never as an error", async () => {
    expect((await getPatient("not-a-uuid")).ok).toBe(false);
    expect((await getPatientByShareToken("nope")).ok).toBe(false);
    expect((await updatePatient("not-a-uuid", {})).ok).toBe(false);
    expect((await deletePatient("not-a-uuid")).ok).toBe(false);
  });

  it("deletes, and the list reflects it", async () => {
    const created = unwrapOk(await createPatient({ pseudonym: "Temp" }));
    expect(unwrapOk(await deletePatient(created.id))).toBe(true);
    expect((await getPatient(created.id)).ok).toBe(false);
    const remaining = await listPatients();
    expect(remaining.some((patient) => patient.id === created.id)).toBe(false);
  });
});
