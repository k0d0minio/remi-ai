import { beforeAll, describe, expect, it } from "vitest";
import { suggestPlannedMeal } from "../../../server/meals/suggest";
import { getDatabase, registerDatabase } from "../../client";
import type { PatientConsent } from "../../models/patient-consent";
import { createMemoryDatabase, testPractitionerId } from "../../test-helpers";
import { patientActor, systemActor } from "../access";
import { listAuditEvents, type AuditActor } from "../audit";
import { macroProfileOf } from "../patient-questionnaire";
import { createPatient } from "../patients";
import {
  careConsentInForce,
  consentsOf,
  recordConsent,
  withdrawConsent,
} from "./index";

/**
 * The patient's withdrawal from the settings (REM-43): one new row, no change
 * of an earlier row, the audit event, and the consequence at the next read.
 */

let claireId: string;
let claire: AuditActor;

const morgane: AuditActor = {
  id: "11111111-1111-4111-8111-111111111111",
  email: "morgane@example.com",
  name: "Morgane",
};

/** Two rows share a millisecond otherwise, and the latest is chosen by time. */
const tick = () => new Promise((resolve) => setTimeout(resolve, 5));

const rows = () => getDatabase().collection<PatientConsent>("patient_consents");

const rowsOf = async (patientId: string) =>
  (await rows().findMany({ patientProfileId: patientId }, { limit: 100 }))
    .items;

const newPatient = async (pseudonym: string) => {
  const created = await createPatient(systemActor, {
    practitionerId: testPractitionerId,
    pseudonym,
  });
  if (!created.ok) {
    throw new Error("test patient not created");
  }
  return created.data.id;
};

const give = async (key: "care" | "genetic", version: string) => {
  const given = await recordConsent(systemActor, {
    patientId: claireId,
    key,
    version,
    locale: "fr-BE",
    decision: "given",
    actor: claire,
  });
  if (!given.ok) {
    throw new Error("test consent not recorded");
  }
  await tick();
  return given.data;
};

beforeAll(async () => {
  registerDatabase(createMemoryDatabase());
  claireId = await newPatient("Claire");
  claire = { kind: "patient", id: claireId, name: "Claire" };
});

describe("withdrawConsent", () => {
  it("refuses a withdrawal with no consent in force, and writes no row", async () => {
    const refused = await withdrawConsent(patientActor(claireId), {
      patientId: claireId,
      key: "care",
      actor: claire,
    });
    expect(refused.ok).toBe(false);
    if (!refused.ok) {
      expect(refused.error).toBe("conflict");
    }
    expect(await rowsOf(claireId)).toHaveLength(0);
  });

  it("writes one withdrawn row with the time and the version of the consent in force", async () => {
    const given = await give("care", "3");
    const before = Date.now();
    const withdrawn = await withdrawConsent(patientActor(claireId), {
      patientId: claireId,
      key: "care",
      actor: claire,
    });
    expect(withdrawn.ok).toBe(true);
    if (withdrawn.ok) {
      expect(withdrawn.data.decision).toBe("withdrawn");
      expect(withdrawn.data.consentKey).toBe("care");
      expect(withdrawn.data.textVersion).toBe("3");
      expect(withdrawn.data.textLocale).toBe("fr-BE");
      expect(withdrawn.data.textHash).toBe(given.textHash);
      expect(withdrawn.data.channel).toBe("app");
      expect(withdrawn.data.actorKind).toBe("patient");
      expect(withdrawn.data.decidedAt.getTime()).toBeGreaterThanOrEqual(before);
    }
    const all = await rowsOf(claireId);
    expect(all).toHaveLength(2);
    // No earlier row changes.
    expect(all.find((row) => row.id === given.id)).toEqual(given);
  });

  it("makes the withdrawal the patient's answer at the next read", async () => {
    const latest = await consentsOf(systemActor, claireId);
    expect(latest.care?.decision).toBe("withdrawn");
    expect(await careConsentInForce(patientActor(claireId), claireId)).toBe(
      false,
    );
  });

  it("writes one audit event for the withdrawal, under the patient actor", async () => {
    const events = await listAuditEvents(systemActor, {
      action: "consent.withdrawn",
    });
    expect(events).toHaveLength(1);
    expect(events[0]?.actorKind).toBe("patient");
    expect(events[0]?.targetId).toBe(claireId);
    expect(events[0]?.detail).toBe("care v3 fr-BE");
  });

  it("refuses a second withdrawal of the same consent", async () => {
    const again = await withdrawConsent(patientActor(claireId), {
      patientId: claireId,
      key: "care",
      actor: claire,
    });
    expect(again.ok).toBe(false);
    expect(await rowsOf(claireId)).toHaveLength(2);
  });

  it("refuses an operator and another patient", async () => {
    await give("care", "3");
    const byOperator = await withdrawConsent(systemActor, {
      patientId: claireId,
      key: "care",
      actor: morgane,
    });
    expect(byOperator.ok).toBe(false);
    if (!byOperator.ok) {
      expect(byOperator.error).toBe("not_permitted");
    }
    const otherId = await newPatient("Marc");
    const byOther = await withdrawConsent(patientActor(otherId), {
      patientId: claireId,
      key: "care",
      actor: { kind: "patient", id: otherId, name: "Marc" },
    });
    expect(byOther.ok).toBe(false);
    expect(await careConsentInForce(systemActor, claireId)).toBe(true);
  });

  it("clears the three genotypes with the genetic consent, and the profile is DEFAULT at once", async () => {
    await give("genetic", "2");
    await getDatabase()
      .collection<{
        id: string;
        geneticTest: string;
        apoe: string;
        dio2: string;
        amy1a: string;
      }>("patient_profiles")
      .update(claireId, {
        geneticTest: "yes",
        apoe: "E3/E3",
        dio2: "Thr/Thr",
        amy1a: "4",
      });

    const withdrawn = await withdrawConsent(patientActor(claireId), {
      patientId: claireId,
      key: "genetic",
      actor: claire,
    });
    expect(withdrawn.ok).toBe(true);

    const profile = await getDatabase()
      .collection<{ id: string; apoe: unknown; dio2: unknown; amy1a: unknown }>(
        "patient_profiles",
      )
      .findById(claireId);
    expect(profile?.apoe).toBeNull();
    expect(profile?.dio2).toBeNull();
    expect(profile?.amy1a).toBeNull();

    const macros = await macroProfileOf(systemActor, claireId);
    expect(macros.ok).toBe(true);
    if (macros.ok) {
      expect(macros.data.source).toBe("default");
      expect(macros.data.reason).toBe("no-consent");
    }

    const cleared = await listAuditEvents(systemActor, {
      action: "genotype.cleared",
    });
    expect(cleared).toHaveLength(1);
    expect(cleared[0]?.detail).toBe("consent withdrawn");
  });

  it("withdraws a legacy consent, which has no text file", async () => {
    const legacyId = await newPatient("Lea");
    await rows().insert({
      patientProfileId: legacyId,
      consentKey: "care",
      textVersion: "legacy",
      textLocale: null,
      textHash: null,
      decision: "given",
      channel: "consultation",
      decidedAt: new Date("2026-09-01T10:00:00Z"),
      actorKind: "operator",
    });
    const withdrawn = await withdrawConsent(patientActor(legacyId), {
      patientId: legacyId,
      key: "care",
      actor: { kind: "patient", id: legacyId, name: "Lea" },
    });
    expect(withdrawn.ok).toBe(true);
    if (withdrawn.ok) {
      expect(withdrawn.data.textVersion).toBe("legacy");
      expect(withdrawn.data.textLocale).toBeNull();
      expect(withdrawn.data.textHash).toBeNull();
    }
  });
});

describe("the care consent and the suggestions", () => {
  it("refuses a suggestion at once after the withdrawal, before any other read", async () => {
    const withdrawn = await withdrawConsent(patientActor(claireId), {
      patientId: claireId,
      key: "care",
      actor: claire,
    });
    expect(withdrawn.ok).toBe(true);
    const suggested = await suggestPlannedMeal(
      patientActor(claireId),
      claireId,
      "Une salade de lentilles",
    );
    expect(suggested.ok).toBe(false);
    if (!suggested.ok) {
      expect(suggested.error).toBe("not_permitted");
      expect(suggested.message).toBe("the care consent is not in force");
    }
  });
});

describe("the accepted CGV (REM-207)", () => {
  it("records an acceptance, and refuses a refusal or a withdrawal", async () => {
    const louId = await newPatient("Lou");
    const lou: AuditActor = { kind: "patient", id: louId, name: "Lou" };
    const accepted = await recordConsent(systemActor, {
      patientId: louId,
      key: "cgv",
      version: "1",
      locale: "fr-BE",
      decision: "given",
      actor: lou,
    });
    expect(accepted.ok).toBe(true);

    const refused = await recordConsent(systemActor, {
      patientId: louId,
      key: "cgv",
      version: "1",
      locale: "fr-BE",
      decision: "refused",
      actor: lou,
    });
    expect(!refused.ok && refused.error).toBe("not_permitted");

    const withdrawn = await withdrawConsent(patientActor(louId), {
      patientId: louId,
      key: "cgv",
      actor: lou,
    });
    expect(!withdrawn.ok && withdrawn.error).toBe("not_permitted");

    const all = await rowsOf(louId);
    expect(all).toHaveLength(1);
    expect(all[0]?.decision).toBe("given");
  });
});
