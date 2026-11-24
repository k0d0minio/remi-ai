import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { currentConsentText } from "../consent";
import { getDatabase, registerDatabase } from "../db/client";
import type { PatientFileClaim } from "../db/models/patient-file-claim";
import type { PatientProfile } from "../db/models/patient-profile";
import { systemActor } from "../db/services/access";
import { listAuditEvents } from "../db/services/audit";
import { createOperator } from "../db/services/operators";
import {
  createPatientAccount,
  getPatientAccountByProfile,
} from "../db/services/patient-accounts";
import { consentsOf } from "../db/services/patient-consents";
import { issueFileClaim } from "../db/services/patient-file-claims";
import { createPatient, getPatient } from "../db/services/patients";
import { createMemoryDatabase } from "../db/test-helpers";
import { consoleMailer, registerMailer, type EmailMessage } from "../email";
import type { ShownConsent } from "../shared/consent";
import { err, ok } from "../shared/result";
import { signUpPatient, validateSignup } from "./patient-signup";
import {
  checkFileTakeover,
  issueActivationLink,
  requestFileClaim,
  takeOverPatientFile,
} from "./patient-takeover";
import { registerAuthProvider, type AuthIdentity } from "./provider";

/** The identity store of the fake adapter: e-mail → password and user. */
const users = new Map<string, { password: string; identity: AuthIdentity }>();
let nextSubject = 1;
let sent: EmailMessage[] = [];

let practitionerId: string;
let practitionerToken: string;
let otherPractitionerToken: string;

/** The URL the app would build: the token is the last segment. */
const linkFor = (token: string, locale: string) =>
  `https://app.test/${locale}/inscription/reprendre/${token}`;

const tokenOf = (url: string) => url.split("/").at(-1) ?? "";

beforeAll(async () => {
  registerDatabase(createMemoryDatabase());
  registerAuthProvider({
    name: "fake",
    signUp: async ({ email, password, name }) => {
      if (users.has(email)) {
        return err("conflict", "user exists");
      }
      const identity = {
        subject: `user-${nextSubject++}`,
        email,
        name,
        emailVerified: false,
      };
      users.set(email, { password, identity });
      return ok(identity);
    },
    signIn: async ({ email, password }) => {
      const user = users.get(email);
      return user && user.password === password
        ? ok(user.identity)
        : err("not_permitted", "wrong e-mail or password");
    },
    requestMagicLink: async () => ok(null),
    signOut: async () => ok(null),
    readIdentity: async () => null,
    requestPasswordReset: async () => ok(null),
    resetPassword: async () => ok(null),
    completeRedirectSignIn: async () => null,
    renewSessionCache: async () => null,
    deleteUser: async () => ok(null),
    routeHandlers: () => {
      throw new Error("not used");
    },
  });

  const morgane = await createOperator({
    email: "morgane@example.be",
    name: "Morgane",
    password: "long enough password",
    role: "admin",
  });
  const other = await createOperator({
    email: "other@example.be",
    name: "Other",
    password: "long enough password",
    role: "practitioner",
  });
  if (!morgane.ok || !other.ok) {
    throw new Error("test practitioners not created");
  }
  practitionerId = morgane.data.id;
  practitionerToken = morgane.data.signupLinkToken;
  otherPractitionerToken = other.data.signupLinkToken;
});

beforeEach(async () => {
  for (const name of [
    "patient_profiles",
    "patient_accounts",
    "patient_consents",
    "patient_file_claims",
    "audit_events",
  ]) {
    const rows = getDatabase().collection<{ id: string }>(name);
    const page = await rows.findMany({}, { limit: 10_000 });
    for (const row of page.items) {
      await rows.remove(row.id);
    }
  }
  users.clear();
  sent = [];
  registerMailer({
    provider: "test",
    send: async (message) => {
      sent.push(message);
      return { id: `test-${sent.length}`, provider: "test" };
    },
  });
});

/** A file the practitioner created in the console: no account. */
const practitionerFile = async (email = "Marie.Dupont@Example.be") => {
  const created = await createPatient(systemActor, {
    practitionerId,
    pseudonym: "Patient ABCD",
    fullName: "Marie Dupont",
    firstName: "Marie",
    email,
    locale: "fr",
    heightCm: 168,
  });
  if (!created.ok) {
    throw new Error("test file not created");
  }
  return created.data;
};

const care = (): ShownConsent => {
  const text = currentConsentText("care", "fr-BE");
  return { key: "care", version: text.version, locale: text.locale };
};

/** The CGV text the box shows now (REM-207). */
const cgv = (): ShownConsent => {
  const text = currentConsentText("cgv", "fr-BE");
  return { key: "cgv", version: text.version, locale: text.locale };
};

/** The two texts that the one box of the page posts. */
const box = () => [care(), cgv()];

const activationToken = async (patientId: string) => {
  const link = await issueActivationLink(patientId, linkFor);
  if (!link.ok) {
    throw new Error("no activation link");
  }
  return tokenOf(link.data.url);
};

const takeOver = (
  token: string,
  overrides: { password?: string; consents?: readonly ShownConsent[] } = {},
) =>
  takeOverPatientFile({
    token,
    password: overrides.password ?? "correct horse",
    consents: overrides.consents ?? box(),
    callbackPath: "/fr/questionnaire",
  });

const profiles = async () =>
  (
    await getDatabase()
      .collection<PatientProfile>("patient_profiles")
      .findMany({}, { limit: 500 })
  ).items;

describe("the activation link (path 1)", () => {
  it("attaches an account to the existing file and keeps its data", async () => {
    const file = await practitionerFile();
    const token = await activationToken(file.id);

    const result = await takeOver(token);

    expect(result).toEqual({ ok: true, data: { patientId: file.id } });
    const account = await getPatientAccountByProfile(file.id);
    expect(account?.email).toBe("marie.dupont@example.be");
    expect(await profiles()).toHaveLength(1);
    const kept = await getPatient(systemActor, file.id);
    expect(kept.ok && kept.data.heightCm).toBe(168);
    expect(kept.ok && kept.data.fullName).toBe("Marie Dupont");
  });

  it("writes one takeover event with the path, and the consent", async () => {
    const file = await practitionerFile();
    await takeOver(await activationToken(file.id));

    const events = await listAuditEvents(systemActor, {
      action: "patient.file_taken_over",
    });
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      actorKind: "patient",
      targetId: file.id,
      detail: "activation",
    });
    const consents = await consentsOf(systemActor, file.id);
    expect(consents.care?.decision).toBe("given");
    // REM-207: the takeover records the CGV that the box accepted.
    expect(consents.cgv).toMatchObject({
      decision: "given",
      textVersion: "1",
      textLocale: "fr-BE",
      textHash: currentConsentText("cgv", "fr-BE").hash,
    });
  });

  it("writes nothing without the mandatory consent, not even the identity", async () => {
    const file = await practitionerFile();
    const token = await activationToken(file.id);

    const result = await takeOver(token, { consents: [] });

    expect(result.ok).toBe(false);
    expect(!result.ok && result.error).toBe("invalid_input");
    expect(users.size).toBe(0);
    expect(await getPatientAccountByProfile(file.id)).toBeNull();
    // The link stays open: the patient ticks and submits again.
    expect((await checkFileTakeover(token)).ok).toBe(true);
  });

  it("refuses a short password and writes nothing", async () => {
    const file = await practitionerFile();
    const result = await takeOver(await activationToken(file.id), {
      password: "short",
    });
    expect(!result.ok && result.error).toBe("invalid_input");
    expect(users.size).toBe(0);
  });

  it("works once", async () => {
    const file = await practitionerFile();
    const token = await activationToken(file.id);
    expect((await takeOver(token)).ok).toBe(true);

    const again = await takeOver(token);

    expect(!again.ok && again.error).toBe("spent");
    expect(!again.ok && again.error).not.toBe("has_account");
  });

  it("refuses an expired link", async () => {
    const file = await practitionerFile();
    const old = await issueFileClaim(file.id, "activation", {
      now: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    });
    if (!old.ok) {
      throw new Error("no link");
    }
    const check = await checkFileTakeover(old.data.token);
    expect(!check.ok && check.error).toBe("spent");
    expect(!(await takeOver(old.data.token)).ok).toBe(true);
    expect(users.size).toBe(0);
  });

  it("answers not_found for an unknown or malformed token", async () => {
    expect((await checkFileTakeover("not a token")).ok).toBe(false);
    const unknown = await checkFileTakeover("A".repeat(43));
    expect(!unknown.ok && unknown.error).toBe("not_found");
  });

  it("refuses a link on an e-mail that already has an account, with has_account", async () => {
    const file = await practitionerFile();
    const token = await activationToken(file.id);
    const elsewhere = await createPatient(systemActor, {
      practitionerId,
      pseudonym: "Patient WXYZ",
    });
    if (!elsewhere.ok) {
      throw new Error("no second file");
    }
    await createPatientAccount({
      patientProfileId: elsewhere.data.id,
      email: "marie.dupont@example.be",
      authSubject: "user-existing",
    });

    const check = await checkFileTakeover(token);
    const result = await takeOver(token);

    expect(!check.ok && check.error).toBe("has_account");
    expect(!result.ok && result.error).toBe("has_account");
    expect(users.size).toBe(0);
  });

  it("refuses to issue a link for a file that has an account", async () => {
    const file = await practitionerFile();
    await takeOver(await activationToken(file.id));
    const again = await issueActivationLink(file.id, linkFor);
    expect(!again.ok && again.error).toBe("conflict");
  });

  it("voids the earlier link when a new one is issued", async () => {
    const file = await practitionerFile();
    const first = await activationToken(file.id);
    const second = await activationToken(file.id);

    expect(!(await checkFileTakeover(first)).ok).toBe(true);
    expect((await checkFileTakeover(second)).ok).toBe(true);
  });

  it("stores the token hashed, never in plain text", async () => {
    const file = await practitionerFile();
    const token = await activationToken(file.id);
    const rows = await getDatabase()
      .collection<PatientFileClaim>("patient_file_claims")
      .findMany({}, { limit: 10 });
    expect(rows.items).toHaveLength(1);
    expect(rows.items[0].tokenHash).not.toBe(token);
    expect(JSON.stringify(rows.items[0])).not.toContain(token);
  });
});

describe("the sign-up with the e-mail of a practitioner-created file (path 2)", () => {
  const signUp = (email: string, link = practitionerToken) => {
    const checked = validateSignup({
      lastName: "Dupont",
      firstName: "Marie",
      birthDate: "1985-04-12",
      email,
      phone: "+32 470 12 34 56",
      password: "correct horse",
    });
    if (!checked.ok) {
      throw new Error("test input refused");
    }
    return signUpPatient({
      token: link,
      locale: "fr",
      data: checked.data,
      callbackPath: "/fr/questionnaire",
      consents: box(),
    });
  };

  it("creates no new row and answers file_exists, whatever the case", async () => {
    await practitionerFile();

    const result = await signUp("MARIE.dupont@example.be");

    expect(!result.ok && result.error).toBe("file_exists");
    expect(await profiles()).toHaveLength(1);
    expect(users.size).toBe(0);
  });

  it("keeps another practitioner's link out of this file", async () => {
    await practitionerFile();
    const result = await signUp(
      "marie.dupont@example.be",
      otherPractitionerToken,
    );
    expect(result.ok).toBe(true);
    expect(await profiles()).toHaveLength(2);
  });

  it("sends one claim e-mail in the file's language, and its link takes the file over", async () => {
    const file = await practitionerFile();

    const request = await requestFileClaim({
      practitionerToken,
      email: "marie.dupont@example.be",
      linkFor,
    });

    expect(request.ok).toBe(true);
    expect(sent).toHaveLength(1);
    expect(sent[0].to).toBe("Marie.Dupont@Example.be");
    expect(sent[0].subject).toBe("Reprends ton dossier REMI");
    const url = sent[0].text
      .split("\n")
      .find((line) => line.startsWith("https://"));
    expect(url).toBeDefined();
    const events = await listAuditEvents(systemActor, {
      action: "patient.file_claim_sent",
    });
    expect(events).toHaveLength(1);

    const result = await takeOver(tokenOf(url ?? ""));
    expect(result).toEqual({ ok: true, data: { patientId: file.id } });
    const taken = await listAuditEvents(systemActor, {
      action: "patient.file_taken_over",
    });
    expect(taken[0].detail).toBe("claim");
    expect(await profiles()).toHaveLength(1);
  });

  it("sends nothing for an e-mail on no file, and answers the same", async () => {
    const request = await requestFileClaim({
      practitionerToken,
      email: "nobody@example.be",
      linkFor,
    });
    expect(request.ok).toBe(true);
    expect(sent).toHaveLength(0);
  });

  it("sends at most one claim e-mail per five minutes", async () => {
    await practitionerFile();
    const input = {
      practitionerToken,
      email: "marie.dupont@example.be",
      linkFor,
    };
    expect((await requestFileClaim(input)).ok).toBe(true);

    const again = await requestFileClaim(input);

    expect(!again.ok && again.error).toBe("rate_limited");
    expect(sent).toHaveLength(1);
  });

  it("refuses an unknown practitioner token", async () => {
    const request = await requestFileClaim({
      practitionerToken: "nope",
      email: "marie.dupont@example.be",
      linkFor,
    });
    expect(!request.ok && request.error).toBe("not_found");
  });

  it("answers upstream_failed when the mailer throws", async () => {
    await practitionerFile();
    registerMailer({
      provider: "broken",
      send: async () => {
        throw new Error("down");
      },
    });
    const request = await requestFileClaim({
      practitionerToken,
      email: "marie.dupont@example.be",
      linkFor,
    });
    expect(!request.ok && request.error).toBe("upstream_failed");
    expect(
      await listAuditEvents(systemActor, { action: "patient.file_claim_sent" }),
    ).toHaveLength(0);
    registerMailer(consoleMailer);
  });
});
