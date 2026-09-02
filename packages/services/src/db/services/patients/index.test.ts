import { beforeAll, describe, expect, it } from "vitest";
import { registerDatabase } from "../../client";
import { createMemoryDatabase } from "../../test-helpers";
import {
  createPatient,
  deletePatient,
  getPatient,
  getPatientByShareToken,
  listPatients,
  recordPatientLinkOpened,
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

/**
 * `lastEditedAt` is millisecond-resolution, so two writes in the same tick are
 * indistinguishable. The ordering assertions below need a real gap, not a
 * faster machine.
 */
const tick = () => new Promise((resolve) => setTimeout(resolve, 5));

describe("patient profiles", () => {
  it("creates with defaults and an unguessable share token", async () => {
    const patient = unwrapOk(await createPatient({ pseudonym: "Claire" }));
    expect(patient.pseudonym).toBe("Claire");
    expect(patient.fullName).toBeNull();
    expect(patient.email).toBeNull();
    expect(patient.locale).toBe("fr");
    expect(patient.status).toBe("active");
    expect(patient.sex).toBe("unspecified");
    expect(patient.birthDate).toBeNull();
    expect(patient.heightCm).toBeNull();
    expect(patient.weightKg).toBeNull();
    expect(patient.consentDate).toBeNull();
    expect(patient.consentChannel).toBeNull();
    expect(patient.linkLastOpenedAt).toBeNull();
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

describe("clinical fields", () => {
  it("records a birth date, sex and measurements", async () => {
    const created = unwrapOk(
      await createPatient({
        pseudonym: "Alix",
        birthDate: "1984-03-11",
        sex: "female",
        heightCm: "168",
        weightKg: "62.5",
        medications: "levothyroxine 50 µg",
        supplements: "vitamin D",
        referral: "Dr Laurent",
      }),
    );
    expect(created.birthDate).toBe("1984-03-11");
    expect(created.sex).toBe("female");
    expect(created.heightCm).toBe(168);
    expect(created.weightKg).toBe(62.5);
    expect(created.medications).toBe("levothyroxine 50 µg");
    expect(created.referral).toBe("Dr Laurent");
  });

  it("rejects a malformed birth date and an out-of-range measurement", async () => {
    expect(
      (await createPatient({ pseudonym: "Bad", birthDate: "11/03/1984" })).ok,
    ).toBe(false);
    expect(
      (await createPatient({ pseudonym: "Bad", birthDate: "1984-13-45" })).ok,
    ).toBe(false);
    expect((await createPatient({ pseudonym: "Bad", heightCm: "0" })).ok).toBe(
      false,
    );
    expect(
      (await createPatient({ pseudonym: "Bad", weightKg: "heavy" })).ok,
    ).toBe(false);
  });

  it("clears an optional number and date with an empty string", async () => {
    const created = unwrapOk(
      await createPatient({
        pseudonym: "Clear",
        birthDate: "1990-01-01",
        heightCm: "170",
        weightKg: "70",
      }),
    );
    const cleared = unwrapOk(
      await updatePatient(created.id, {
        birthDate: "",
        heightCm: "",
        weightKg: "",
      }),
    );
    expect(cleared.birthDate).toBeNull();
    expect(cleared.heightCm).toBeNull();
    expect(cleared.weightKg).toBeNull();
  });
});

describe("consent", () => {
  it("records a date and a channel", async () => {
    const created = unwrapOk(
      await createPatient({
        pseudonym: "Consented",
        consentDate: "2026-08-14",
        consentChannel: "whatsapp",
      }),
    );
    expect(created.consentDate).toBe("2026-08-14");
    expect(created.consentChannel).toBe("whatsapp");
  });

  it("records it after the fact, without touching the rest of the profile", async () => {
    const created = unwrapOk(
      await createPatient({ pseudonym: "Later", objective: "sleep better" }),
    );
    expect(created.consentDate).toBeNull();

    const updated = unwrapOk(
      await updatePatient(created.id, {
        consentDate: "2026-09-01",
        consentChannel: "consultation",
      }),
    );
    expect(updated.consentDate).toBe("2026-09-01");
    expect(updated.consentChannel).toBe("consultation");
    expect(updated.objective).toBe("sleep better");
  });

  it("rejects a channel outside the closed set and a malformed date", async () => {
    expect(
      (
        await createPatient({
          pseudonym: "Bad",
          // The whole point of the enum: "par courrier" is not a channel.
          consentChannel: "post" as never,
        })
      ).ok,
    ).toBe(false);
    expect(
      (await createPatient({ pseudonym: "Bad", consentDate: "14/08/2026" })).ok,
    ).toBe(false);
  });

  it("clears both with an empty string", async () => {
    const created = unwrapOk(
      await createPatient({
        pseudonym: "Withdrawn",
        consentDate: "2026-08-14",
        consentChannel: "email",
      }),
    );
    const cleared = unwrapOk(
      await updatePatient(created.id, { consentDate: "", consentChannel: "" }),
    );
    expect(cleared.consentDate).toBeNull();
    expect(cleared.consentChannel).toBeNull();
  });

  it("blocks nothing: a profile with no consent still saves and still shares", async () => {
    const created = unwrapOk(await createPatient({ pseudonym: "No consent" }));
    const updated = unwrapOk(
      await updatePatient(created.id, { objective: "more energy" }),
    );
    expect(updated.objective).toBe("more energy");
    expect(updated.consentDate).toBeNull();
    expect(unwrapOk(await getPatientByShareToken(created.shareToken)).id).toBe(
      created.id,
    );
  });
});

describe("the roster query", () => {
  it("searches the pseudonym, the full name and the email", async () => {
    await createPatient({
      pseudonym: "Zephyr",
      fullName: "Camille Rousseau",
      email: "camille@example.com",
    });
    expect(
      (await listPatients({ search: "zeph" })).some(
        (patient) => patient.pseudonym === "Zephyr",
      ),
    ).toBe(true);
    expect(
      (await listPatients({ search: "ROUSSEAU" })).some(
        (patient) => patient.pseudonym === "Zephyr",
      ),
    ).toBe(true);
    expect(
      (await listPatients({ search: "camille@" })).some(
        (patient) => patient.pseudonym === "Zephyr",
      ),
    ).toBe(true);
    expect(await listPatients({ search: "no such patient" })).toEqual([]);
  });

  it("filters by status, and 'all' is not a filter", async () => {
    const created = unwrapOk(await createPatient({ pseudonym: "Paused one" }));
    await updatePatient(created.id, { status: "paused" });

    const paused = await listPatients({ status: "paused" });
    expect(paused.every((patient) => patient.status === "paused")).toBe(true);
    expect(paused.some((patient) => patient.id === created.id)).toBe(true);

    const active = await listPatients({ status: "active" });
    expect(active.some((patient) => patient.id === created.id)).toBe(false);

    const all = await listPatients({ status: "all" });
    expect(all.length).toBeGreaterThan(paused.length);
  });

  it("sorts by name, and by the last operator edit", async () => {
    const byName = await listPatients({ sort: "name" });
    const pseudonyms = byName.map((patient) => patient.pseudonym);
    expect(pseudonyms).toEqual(
      [...pseudonyms].sort((a, b) => a.localeCompare(b, "fr")),
    );

    const target = unwrapOk(await createPatient({ pseudonym: "Most recent" }));
    await tick();
    await updatePatient(target.id, { objective: "touched last" });
    const byRecent = await listPatients({ sort: "recent" });
    expect(byRecent[0]?.id).toBe(target.id);
  });
});

describe("the share link's last-opened stamp", () => {
  it("records the first open and leaves the operator's edit stamp alone", async () => {
    const created = unwrapOk(await createPatient({ pseudonym: "Opened" }));
    await tick();
    await recordPatientLinkOpened(created.id);

    const opened = unwrapOk(await getPatient(created.id));
    expect(opened.linkLastOpenedAt).not.toBeNull();
    // The whole reason the two timestamps are separate columns: a patient
    // reading their page must not reorder Morgane's roster.
    expect(opened.lastEditedAt.getTime()).toBe(created.lastEditedAt.getTime());
  });

  it("does not rewrite the stamp on a second open inside the interval", async () => {
    const created = unwrapOk(await createPatient({ pseudonym: "Hammered" }));
    await recordPatientLinkOpened(created.id);
    const first = unwrapOk(await getPatient(created.id)).linkLastOpenedAt;

    await tick();
    await recordPatientLinkOpened(created.id);
    const second = unwrapOk(await getPatient(created.id)).linkLastOpenedAt;

    expect(second?.getTime()).toBe(first?.getTime());
  });

  it("forgets the stamp when the link is regenerated", async () => {
    const created = unwrapOk(await createPatient({ pseudonym: "Rotated" }));
    await recordPatientLinkOpened(created.id);
    const regenerated = unwrapOk(await regenerateShareToken(created.id));
    expect(regenerated.linkLastOpenedAt).toBeNull();
  });

  it("ignores a malformed id rather than throwing", async () => {
    await expect(
      recordPatientLinkOpened("not-a-uuid"),
    ).resolves.toBeUndefined();
  });
});
