import { beforeAll, describe, expect, it } from "vitest";
import { consentText } from "../../../consent";
import { registerDatabase } from "../../client";
import { createMemoryDatabase, testPractitionerId } from "../../test-helpers";
import { listAuditEvents, type AuditActor } from "../audit";
import { createPatient } from "../patients";
import { consentsOf, recordConsent } from "./index";

let claireId: string;
let claire: AuditActor;

const morgane: AuditActor = {
  id: "11111111-1111-4111-8111-111111111111",
  email: "morgane@example.com",
  name: "Morgane",
};

/** Two rows share a millisecond otherwise, and the latest is chosen by time. */
const tick = () => new Promise((resolve) => setTimeout(resolve, 5));

beforeAll(async () => {
  registerDatabase(createMemoryDatabase());
  const created = await createPatient({
    practitionerId: testPractitionerId,
    pseudonym: "Claire",
  });
  if (!created.ok) {
    throw new Error("test patient not created");
  }
  claireId = created.data.id;
  claire = { kind: "patient", id: claireId, name: "Claire" };
});

describe("patient consents", () => {
  it("stores the key, the version, the locale, the hash, the decision and the time", async () => {
    const before = Date.now();
    const recorded = await recordConsent({
      patientId: claireId,
      key: "care",
      version: "1",
      locale: "fr-BE",
      decision: "given",
      actor: claire,
    });
    expect(recorded.ok).toBe(true);
    if (recorded.ok) {
      expect(recorded.data.consentKey).toBe("care");
      expect(recorded.data.textVersion).toBe("1");
      expect(recorded.data.textLocale).toBe("fr-BE");
      expect(recorded.data.textHash).toBe(
        consentText("care", "1", "fr-BE")?.hash,
      );
      expect(recorded.data.decision).toBe("given");
      expect(recorded.data.channel).toBe("app");
      expect(recorded.data.actorKind).toBe("patient");
      expect(recorded.data.decidedAt.getTime()).toBeGreaterThanOrEqual(before);
    }
  });

  it("writes one audit event per decision, under the patient actor", async () => {
    const events = await listAuditEvents({ targetId: claireId });
    const given = events.filter((event) => event.action === "consent.given");
    expect(given).toHaveLength(1);
    expect(given[0].actorKind).toBe("patient");
    expect(given[0].targetLabel).toBe("Claire");
    expect(given[0].detail).toBe("care v1 fr-BE");
  });

  it("returns the latest decision per key, and no entry for a key never asked", async () => {
    await tick();
    const refused = await recordConsent({
      patientId: claireId,
      key: "genetic",
      version: "1",
      locale: "fr-BE",
      decision: "refused",
      actor: claire,
    });
    expect(refused.ok).toBe(true);
    await tick();
    await recordConsent({
      patientId: claireId,
      key: "genetic",
      version: "1",
      locale: "fr-BE",
      decision: "given",
      actor: claire,
    });

    const latest = await consentsOf(claireId);
    expect(latest.care?.decision).toBe("given");
    expect(latest.genetic?.decision).toBe("given");

    const marc = await createPatient({
      practitionerId: testPractitionerId,
      pseudonym: "Marc",
    });
    if (!marc.ok) {
      throw new Error("test patient not created");
    }
    expect(await consentsOf(marc.data.id)).toEqual({});
  });

  it("withdraws a consent in force, and the withdrawal becomes the answer", async () => {
    await tick();
    const withdrawn = await recordConsent({
      patientId: claireId,
      key: "genetic",
      version: "1",
      locale: "fr-BE",
      decision: "withdrawn",
      actor: claire,
    });
    expect(withdrawn.ok).toBe(true);
    expect((await consentsOf(claireId)).genetic?.decision).toBe("withdrawn");

    const events = await listAuditEvents({ action: "consent.withdrawn" });
    expect(events).toHaveLength(1);
  });

  it("refuses a withdrawal with no consent in force", async () => {
    const again = await recordConsent({
      patientId: claireId,
      key: "genetic",
      version: "1",
      locale: "fr-BE",
      decision: "withdrawn",
      actor: claire,
    });
    expect(again.ok).toBe(false);
    if (!again.ok) {
      expect(again.error).toBe("conflict");
    }
  });

  it("records an operator's decision under the operator actor", async () => {
    await tick();
    const recorded = await recordConsent({
      patientId: claireId,
      key: "care",
      version: "1",
      locale: "fr-BE",
      decision: "given",
      actor: morgane,
    });
    expect(recorded.ok).toBe(true);
    if (recorded.ok) {
      expect(recorded.data.actorKind).toBe("operator");
    }
  });

  it("refuses a version, a locale or a key that no text file carries", async () => {
    const cases = [
      { key: "care", version: "legacy", locale: "fr-BE" },
      { key: "care", version: "9", locale: "fr-BE" },
      { key: "care", version: "1", locale: "en" },
      { key: "cookies" as never, version: "1", locale: "fr-BE" },
    ] as const;
    for (const named of cases) {
      const result = await recordConsent({
        ...named,
        patientId: claireId,
        decision: "given",
        actor: claire,
      });
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBe("invalid_input");
      }
    }
  });

  it("refuses an unknown patient", async () => {
    const recorded = await recordConsent({
      patientId: "33333333-3333-4333-8333-333333333333",
      key: "care",
      version: "1",
      locale: "fr-BE",
      decision: "given",
      actor: morgane,
    });
    expect(recorded.ok).toBe(false);
    if (!recorded.ok) {
      expect(recorded.error).toBe("not_found");
    }
  });
});
