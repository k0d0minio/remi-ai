import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { getDatabase, registerDatabase } from "../db/client";
import type { AuditAction } from "../db/models/audit-event";
import type { PatientAccount } from "../db/models/patient-account";
import { listAuditEvents } from "../db/services/audit";
import { createPatientAccount } from "../db/services/patient-accounts";
import { createPatient } from "../db/services/patients";
import { createMemoryDatabase, testPractitionerId } from "../db/test-helpers";
import { err, ok, type ServiceErrorCode } from "../shared/result";
import {
  patientLandingFor,
  requestPatientMagicLink,
  requestPatientPasswordReset,
  resetPatientPassword,
  signInPatient,
} from "./patient-sign-in";
import { registerAuthProvider, type AuthIdentity } from "./provider";
import { systemActor } from "../db/services/access";

/** The identity store of the fake adapter: e-mail → password and user. */
const users = new Map<string, { password: string; identity: AuthIdentity }>();
/** The one valid reset token, and the e-mail it resets. */
const resetTokens = new Map<string, string>();
/** Set to make the next identity store call fail with this code. */
let failNext: ServiceErrorCode | null = null;
let signOuts = 0;
let resetRequests: string[] = [];
let magicLinks: string[] = [];

const identity = (subject: string, email: string): AuthIdentity => ({
  subject,
  email,
  name: "",
  emailVerified: true,
});

let claire: PatientAccount;
let claireId: string;

beforeAll(async () => {
  registerDatabase(createMemoryDatabase());
  registerAuthProvider({
    name: "fake",
    signUp: async () => err("upstream_failed", "not used"),
    signIn: async ({ email, password }) => {
      if (failNext) {
        const code = failNext;
        failNext = null;
        return err(code, "the store refused");
      }
      const user = users.get(email);
      return user && user.password === password
        ? ok(user.identity)
        : err("not_permitted", "wrong e-mail or password");
    },
    requestMagicLink: async ({ email }) => {
      if (failNext) {
        const code = failNext;
        failNext = null;
        return err(code, "the store refused");
      }
      magicLinks.push(email);
      return ok(null);
    },
    signOut: async () => {
      signOuts += 1;
      return ok(null);
    },
    readIdentity: async () => null,
    requestPasswordReset: async ({ email }) => {
      if (failNext) {
        const code = failNext;
        failNext = null;
        return err(code, "the store refused");
      }
      resetRequests.push(email);
      return ok(null);
    },
    resetPassword: async ({ token, newPassword }) => {
      const email = resetTokens.get(token);
      if (!email) {
        return err("not_permitted", "invalid token");
      }
      // A token works once.
      resetTokens.delete(token);
      const user = users.get(email);
      if (user) {
        users.set(email, { ...user, password: newPassword });
      }
      return ok(null);
    },
    completeRedirectSignIn: async () => null,
    routeHandlers: () => {
      throw new Error("not used");
    },
  });

  const patient = await createPatient(systemActor, {
    practitionerId: testPractitionerId,
    pseudonym: "Patient ABCD",
  });
  if (!patient.ok) {
    throw new Error("test patient not created");
  }
  claireId = patient.data.id;
  const account = await createPatientAccount({
    patientProfileId: claireId,
    email: "claire@example.be",
    authSubject: "user-claire",
  });
  if (!account.ok) {
    throw new Error("test account not created");
  }
  claire = account.data;
  users.set("claire@example.be", {
    password: "correct horse",
    identity: identity("user-claire", "claire@example.be"),
  });
  // A user of the identity store with no patient file.
  users.set("stray@example.be", {
    password: "correct horse",
    identity: identity("user-stray", "stray@example.be"),
  });
});

beforeEach(() => {
  failNext = null;
  signOuts = 0;
  resetRequests = [];
  magicLinks = [];
});

const countOf = async (action: AuditAction) =>
  (await listAuditEvents(systemActor, { action })).length;

describe("the landing", () => {
  it("is the questionnaire before activation and the home after it", () => {
    expect(patientLandingFor({ activatedAt: null })).toBe("questionnaire");
    expect(patientLandingFor({ activatedAt: new Date() })).toBe("home");
  });
});

describe("the password sign-in", () => {
  it("signs the patient in, lands on the questionnaire and writes one event", async () => {
    const before = await countOf("patient.signed_in");
    const result = await signInPatient({
      email: "  Claire@Example.BE ",
      password: "correct horse",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.account.id).toBe(claire.id);
      expect(result.data.landing).toBe("questionnaire");
    }
    const events = await listAuditEvents(systemActor, {
      action: "patient.signed_in",
    });
    expect(events).toHaveLength(before + 1);
    expect(events).toContainEqual(
      expect.objectContaining({
        actorKind: "patient",
        actorId: claireId,
        actorName: "Patient ABCD",
        targetId: claireId,
        detail: "password",
      }),
    );
  });

  it("lands an activated patient on the home", async () => {
    await getDatabase()
      .collection<PatientAccount>("patient_accounts")
      .update(claire.id, { activatedAt: new Date() });
    const result = await signInPatient({
      email: "claire@example.be",
      password: "correct horse",
    });
    await getDatabase()
      .collection<PatientAccount>("patient_accounts")
      .update(claire.id, { activatedAt: null });
    expect(result.ok ? result.data.landing : null).toBe("home");
  });

  it("answers one code for a wrong password and for an unknown e-mail", async () => {
    const wrongPassword = await signInPatient({
      email: "claire@example.be",
      password: "wrong",
    });
    const unknownEmail = await signInPatient({
      email: "nobody@example.be",
      password: "correct horse",
    });
    const notAnEmail = await signInPatient({
      email: "claire",
      password: "correct horse",
    });
    expect(wrongPassword.ok ? null : wrongPassword.error).toBe("not_permitted");
    expect(unknownEmail.ok ? null : unknownEmail.error).toBe("not_permitted");
    expect(notAnEmail.ok ? null : notAnEmail.error).toBe("not_permitted");
  });

  it("refuses an identity with no patient file and closes its session", async () => {
    const result = await signInPatient({
      email: "stray@example.be",
      password: "correct horse",
    });
    expect(result.ok ? null : result.error).toBe("not_found");
    expect(signOuts).toBe(1);
  });

  it("passes a rate limit through, and hides any other store failure", async () => {
    failNext = "rate_limited";
    const limited = await signInPatient({
      email: "claire@example.be",
      password: "correct horse",
    });
    failNext = "conflict";
    const broken = await signInPatient({
      email: "claire@example.be",
      password: "correct horse",
    });
    expect(limited.ok ? null : limited.error).toBe("rate_limited");
    expect(broken.ok ? null : broken.error).toBe("upstream_failed");
  });
});

describe("the magic link request", () => {
  it("sends a link to an e-mail that holds a patient account", async () => {
    const result = await requestPatientMagicLink({
      email: " Claire@Example.be",
      callbackPath: "/fr/connexion/lien",
    });
    expect(result.ok).toBe(true);
    expect(magicLinks).toEqual(["claire@example.be"]);
  });

  it("sends nothing for any other e-mail, and answers the same", async () => {
    const stray = await requestPatientMagicLink({
      email: "stray@example.be",
      callbackPath: "/fr/connexion/lien",
    });
    const malformed = await requestPatientMagicLink({
      email: "claire",
      callbackPath: "/fr/connexion/lien",
    });
    expect(stray.ok).toBe(true);
    expect(malformed.ok).toBe(true);
    expect(magicLinks).toEqual([]);
  });

  it("passes a rate limit through", async () => {
    failNext = "rate_limited";
    const result = await requestPatientMagicLink({
      email: "claire@example.be",
      callbackPath: "/fr/connexion/lien",
    });
    expect(result.ok ? null : result.error).toBe("rate_limited");
  });
});

describe("the reset request", () => {
  it("asks the store for a link and writes one event for an account", async () => {
    const before = await countOf("patient.password_reset_requested");
    const result = await requestPatientPasswordReset({
      email: "Claire@example.be",
      redirectPath: "/fr/connexion/nouveau-mot-de-passe",
    });
    expect(result.ok).toBe(true);
    expect(resetRequests).toEqual(["claire@example.be"]);
    const events = await listAuditEvents(systemActor, {
      action: "patient.password_reset_requested",
    });
    expect(events).toHaveLength(before + 1);
    expect(events).toContainEqual(
      expect.objectContaining({ actorId: claireId }),
    );
  });

  it("answers the same for an unknown e-mail, and writes no event", async () => {
    const before = await countOf("patient.password_reset_requested");
    const unknown = await requestPatientPasswordReset({
      email: "nobody@example.be",
      redirectPath: "/fr/connexion/nouveau-mot-de-passe",
    });
    const malformed = await requestPatientPasswordReset({
      email: "nobody",
      redirectPath: "/fr/connexion/nouveau-mot-de-passe",
    });
    expect(unknown.ok).toBe(true);
    expect(malformed.ok).toBe(true);
    expect(resetRequests).toEqual(["nobody@example.be"]);
    expect(await countOf("patient.password_reset_requested")).toBe(before);
  });

  it("passes a rate limit through", async () => {
    failNext = "rate_limited";
    const result = await requestPatientPasswordReset({
      email: "claire@example.be",
      redirectPath: "/fr/connexion/nouveau-mot-de-passe",
    });
    expect(result.ok ? null : result.error).toBe("rate_limited");
  });
});

describe("the new password", () => {
  it("sets the password once, signs the patient in and writes the events", async () => {
    resetTokens.set("token-1", "claire@example.be");
    const result = await resetPatientPassword({
      token: "token-1",
      email: "claire@example.be",
      newPassword: "new horse staple",
    });
    expect(result).toEqual({
      ok: true,
      data: { signedIn: true, landing: "questionnaire" },
    });
    const resets = await listAuditEvents(systemActor, {
      action: "patient.password_reset",
    });
    expect(resets).toContainEqual(
      expect.objectContaining({ actorId: claireId }),
    );
    const signIns = await listAuditEvents(systemActor, {
      action: "patient.signed_in",
    });
    expect(signIns).toContainEqual(
      expect.objectContaining({ detail: "password_reset" }),
    );

    const again = await resetPatientPassword({
      token: "token-1",
      email: "claire@example.be",
      newPassword: "another horse",
    });
    expect(again.ok ? null : again.error).toBe("invalid_link");
    const signedIn = await signInPatient({
      email: "claire@example.be",
      password: "new horse staple",
    });
    expect(signedIn.ok).toBe(true);
    users.set("claire@example.be", {
      password: "correct horse",
      identity: identity("user-claire", "claire@example.be"),
    });
  });

  it("keeps the new password when the typed e-mail does not sign in", async () => {
    resetTokens.set("token-2", "claire@example.be");
    const result = await resetPatientPassword({
      token: "token-2",
      email: "typo@example.be",
      newPassword: "new horse staple",
    });
    expect(result).toEqual({ ok: true, data: { signedIn: false } });
    expect(users.get("claire@example.be")?.password).toBe("new horse staple");
    const resets = await listAuditEvents(systemActor, {
      action: "patient.password_reset",
    });
    expect(resets).toContainEqual(
      expect.objectContaining({
        actorId: null,
        detail: "patient not identified",
      }),
    );
    users.set("claire@example.be", {
      password: "correct horse",
      identity: identity("user-claire", "claire@example.be"),
    });
  });

  it("refuses a short password before it spends the link", async () => {
    resetTokens.set("token-3", "claire@example.be");
    const result = await resetPatientPassword({
      token: "token-3",
      email: "claire@example.be",
      newPassword: "short",
    });
    expect(result.ok ? null : result.error).toBe("too_short");
    expect(resetTokens.has("token-3")).toBe(true);
  });

  it("refuses an unknown or empty token", async () => {
    const unknown = await resetPatientPassword({
      token: "nope",
      email: "claire@example.be",
      newPassword: "new horse staple",
    });
    const empty = await resetPatientPassword({
      token: "",
      email: "claire@example.be",
      newPassword: "new horse staple",
    });
    expect(unknown.ok ? null : unknown.error).toBe("invalid_link");
    expect(empty.ok ? null : empty.error).toBe("invalid_link");
  });
});
