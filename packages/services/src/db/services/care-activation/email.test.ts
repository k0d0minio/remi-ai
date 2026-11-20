import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  consoleMailer,
  registerMailer,
  type EmailMessage,
} from "../../../email";
import { getDatabase, registerDatabase } from "../../client";
import type { AuditEvent } from "../../models/audit-event";
import type { PatientFileClaim } from "../../models/patient-file-claim";
import type { PatientProfile } from "../../models/patient-profile";
import {
  createMemoryDatabase,
  practitionerActor,
  testPractitionerId,
} from "../../test-helpers";
import { operatorActor, systemActor } from "../access";
import { createPatientAccount } from "../patient-accounts";
import { createPatient } from "../patients";
import {
  getActivationEmailStatus,
  sendActivationEmail,
  type ActivationEmailInput,
} from "./email";

const practitioner = {
  id: testPractitionerId,
  email: "morgane@example.test",
  name: "Morgane",
};

const holder = practitionerActor();

const otherPractitioner = operatorActor({
  id: "00000000-0000-4000-8000-000000000002",
  role: "practitioner",
});

const admin = operatorActor({
  id: "00000000-0000-4000-8000-000000000003",
  role: "admin",
});

const SIGN_IN = "https://app.test/fr/connexion";
const TAKEOVER = "https://app.test/fr/inscription/reprendre/";

const input = (trigger: ActivationEmailInput["trigger"]): ActivationEmailInput => ({
  trigger,
  linkFor: (token, locale) =>
    `https://app.test/${locale}/inscription/reprendre/${token}`,
  signInUrl: (locale) => `https://app.test/${locale}/connexion`,
});

let sent: EmailMessage[] = [];

/** A mailer that records each message, or refuses each one. */
const fakeMailer = (refuses = false) =>
  registerMailer({
    provider: "test",
    send: async (message) => {
      if (refuses) {
        throw new Error("the provider said no");
      }
      sent.push(message);
      return { id: `test-${sent.length}`, provider: "test" };
    },
  });

const profiles = () =>
  getDatabase().collection<PatientProfile>("patient_profiles");

const emailEvents = async (patientId: string) =>
  (
    await getDatabase()
      .collection<AuditEvent>("audit_events")
      .findMany({ targetId: patientId }, { limit: 500 })
  ).items.filter((event) => event.action.startsWith("activation_email."));

/** A file the practitioner created, at the status the test names. */
const newFile = async (
  pseudonym: string,
  email: string | null,
  fileStatus: PatientProfile["fileStatus"] = "active",
) => {
  const created = await createPatient(systemActor, {
    practitionerId: testPractitionerId,
    pseudonym,
    firstName: "Marie",
    ...(email ? { email } : {}),
  });
  if (!created.ok) {
    throw new Error("test patient not created");
  }
  await profiles().update(created.data.id, { fileStatus });
  return created.data.id;
};

const withAccount = async (patientId: string, email: string) => {
  const account = await createPatientAccount({
    patientProfileId: patientId,
    email,
    authSubject: `user-${patientId}`,
  });
  if (!account.ok) {
    throw new Error("test account not created");
  }
};

beforeAll(() => {
  registerDatabase(createMemoryDatabase());
});

beforeEach(() => {
  sent = [];
  fakeMailer();
});

describe("the send of « Votre espace REMI est prêt »", () => {
  it("sends the sign-in link to a patient who has an account", async () => {
    const patientId = await newFile("Alice", "file-alice@example.test");
    await withAccount(patientId, "alice@example.test");

    const result = await sendActivationEmail(
      holder,
      patientId,
      practitioner,
      input("activation"),
    );
    expect(result).toEqual({ ok: true, data: { sent: true } });
    expect(sent).toHaveLength(1);
    expect(sent[0]?.to).toBe("alice@example.test");
    expect(sent[0]?.subject).toBe("Votre espace REMI est prêt");
    expect(sent[0]?.text).toContain(SIGN_IN);
    expect(sent[0]?.text).not.toContain(TAKEOVER);
    expect(sent[0]?.text).toContain("Bonjour Marie,");
    expect(sent[0]?.text).toContain("Sur iPhone");
    expect(sent[0]?.text).toContain("Sur Android");

    const events = await emailEvents(patientId);
    expect(events).toHaveLength(1);
    expect(events[0]?.action).toBe("activation_email.sent");
    expect(events[0]?.detail).toBe("sign_in");
    expect(events[0]?.actorId).toBe(practitioner.id);
  });

  it("sends the take-over link for a file with no account, and stores its hash only", async () => {
    const patientId = await newFile("Bruno", "bruno@example.test");

    const result = await sendActivationEmail(
      holder,
      patientId,
      practitioner,
      input("activation"),
    );
    expect(result).toEqual({ ok: true, data: { sent: true } });
    expect(sent[0]?.to).toBe("bruno@example.test");
    const link = sent[0]?.text
      .split("\n")
      .find((line) => line.startsWith(TAKEOVER));
    expect(link).toBeDefined();
    const token = link?.slice(TAKEOVER.length) ?? "";
    expect(token.length).toBeGreaterThan(15);

    const claims = await getDatabase()
      .collection<PatientFileClaim>("patient_file_claims")
      .findMany({ patientProfileId: patientId }, { limit: 10 });
    expect(claims.items).toHaveLength(1);
    expect(claims.items[0]?.purpose).toBe("activation");
    expect(JSON.stringify(claims.items)).not.toContain(token);

    const events = await emailEvents(patientId);
    expect(events[0]?.detail).toBe("takeover");
    expect(JSON.stringify(events)).not.toContain(token);
    expect(JSON.stringify(events)).not.toContain("bruno@example.test");
  });

  it("sends nothing a second time, at the activation or on a resend", async () => {
    const patientId = await newFile("Chloe", "chloe@example.test");
    await sendActivationEmail(holder, patientId, practitioner, input("activation"));

    for (const trigger of ["activation", "resend"] as const) {
      const again = await sendActivationEmail(
        holder,
        patientId,
        practitioner,
        input(trigger),
      );
      expect(again.ok).toBe(false);
      if (!again.ok) {
        expect(again.error).toBe("conflict");
      }
    }
    expect(sent).toHaveLength(1);
    expect(await emailEvents(patientId)).toHaveLength(1);
  });

  it("sends nothing for a file that is not active, and writes no event", async () => {
    const patientId = await newFile("David", "david@example.test", "to_validate");
    const result = await sendActivationEmail(
      holder,
      patientId,
      practitioner,
      input("activation"),
    );
    expect(result.ok).toBe(false);
    expect(sent).toHaveLength(0);
    expect(await emailEvents(patientId)).toHaveLength(0);
  });

  it("records a refused send, then sends on a resend", async () => {
    const patientId = await newFile("Emma", "emma@example.test");
    fakeMailer(true);
    const first = await sendActivationEmail(
      holder,
      patientId,
      practitioner,
      input("activation"),
    );
    expect(first).toEqual({
      ok: true,
      data: { sent: false, reason: "send_failed" },
    });
    expect((await profiles().findById(patientId))?.fileStatus).toBe("active");
    const status = await getActivationEmailStatus(holder, patientId);
    expect(status?.state.kind).toBe("failed");

    // A second activation call sends nothing.
    fakeMailer();
    const second = await sendActivationEmail(
      holder,
      patientId,
      practitioner,
      input("activation"),
    );
    expect(second.ok).toBe(false);
    expect(sent).toHaveLength(0);

    const resend = await sendActivationEmail(
      holder,
      patientId,
      practitioner,
      input("resend"),
    );
    expect(resend).toEqual({ ok: true, data: { sent: true } });
    expect(sent).toHaveLength(1);
    expect((await emailEvents(patientId)).map((event) => event.action).sort()).toEqual(
      ["activation_email.failed", "activation_email.sent"],
    );
    expect((await getActivationEmailStatus(holder, patientId))?.state.kind).toBe(
      "sent",
    );
  });

  it("records that no mailer is registered, and makes no link", async () => {
    const patientId = await newFile("Farid", "farid@example.test");
    registerMailer(consoleMailer);
    const result = await sendActivationEmail(
      holder,
      patientId,
      practitioner,
      input("activation"),
    );
    expect(result).toEqual({
      ok: true,
      data: { sent: false, reason: "no_mailer" },
    });
    const claims = await getDatabase()
      .collection<PatientFileClaim>("patient_file_claims")
      .findMany({ patientProfileId: patientId }, { limit: 10 });
    expect(claims.items).toHaveLength(0);
    expect((await emailEvents(patientId))[0]?.detail).toBe("no_mailer");
  });

  it("records a file with no e-mail address", async () => {
    const patientId = await newFile("Gaelle", null);
    const result = await sendActivationEmail(
      holder,
      patientId,
      practitioner,
      input("activation"),
    );
    expect(result).toEqual({
      ok: true,
      data: { sent: false, reason: "no_email" },
    });
    expect(sent).toHaveLength(0);
    const status = await getActivationEmailStatus(holder, patientId);
    expect(status).toEqual({
      state: {
        kind: "failed",
        reason: "no_email",
        at: (await emailEvents(patientId))[0]?.createdAt,
      },
      hasRecipient: false,
    });
  });

  it("is refused for another practitioner and for an admin's read-only open", async () => {
    const patientId = await newFile("Hugo", "hugo@example.test");
    for (const actor of [otherPractitioner, admin]) {
      const result = await sendActivationEmail(
        actor,
        patientId,
        practitioner,
        input("resend"),
      );
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBe("not_found");
      }
    }
    expect(sent).toHaveLength(0);
    expect(await emailEvents(patientId)).toHaveLength(0);
    expect(await getActivationEmailStatus(otherPractitioner, patientId)).toBeNull();
  });
});
