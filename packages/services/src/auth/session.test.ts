import { beforeAll, describe, expect, it } from "vitest";
import { registerDatabase } from "../db/client";
import {
  createPatientAccount,
  recordPatientAccountSeen,
} from "../db/services/patient-accounts";
import { createPatient } from "../db/services/patients";
import { createMemoryDatabase, testPractitionerId } from "../db/test-helpers";
import { ok } from "../shared/result";
import { registerAuthProvider, type AuthIdentity } from "./provider";
import { completePatientSignIn } from "./patient-sign-in";
import { readPatientAccount, readSession } from "./session";
import { systemActor } from "../db/services/access";

/** The identity the fake adapter reports. Each test sets it. */
let current: AuthIdentity | null = null;

const linked: AuthIdentity = {
  subject: "user-linked",
  email: "claire@example.be",
  name: "Claire",
  emailVerified: true,
};

let accountId: string;

beforeAll(async () => {
  registerDatabase(createMemoryDatabase());
  registerAuthProvider({
    name: "fake",
    signUp: async () => ok(linked),
    signIn: async () => ok(linked),
    requestMagicLink: async () => ok(null),
    signOut: async () => ok(null),
    readIdentity: async () => current,
    requestPasswordReset: async () => ok(null),
    resetPassword: async () => ok(null),
    completeRedirectSignIn: async () => null,
    routeHandlers: () => {
      throw new Error("not used");
    },
  });

  const patient = await createPatient(systemActor, {
    practitionerId: testPractitionerId,
    pseudonym: "Claire",
  });
  if (!patient.ok) {
    throw new Error("test patient not created");
  }
  const account = await createPatientAccount({
    patientProfileId: patient.data.id,
    email: linked.email,
    authSubject: linked.subject,
  });
  if (!account.ok) {
    throw new Error("test account not created");
  }
  accountId = account.data.id;
});

describe("the session read", () => {
  it("is null when nobody is signed in", async () => {
    current = null;
    expect(await readSession()).toBeNull();
  });

  it("returns the patient kind and the account id for a linked identity", async () => {
    current = linked;
    const session = await readSession();
    expect(session?.identity.subject).toBe("user-linked");
    expect(session?.principal).toEqual({ kind: "patient", id: accountId });
  });

  it("keeps the identity but no principal before the account is linked", async () => {
    current = { ...linked, subject: "user-new", email: "new@example.be" };
    const session = await readSession();
    expect(session?.identity.email).toBe("new@example.be");
    expect(session?.principal).toBeNull();
  });
});

describe("the patient account read", () => {
  it("is null for a visitor and for an identity with no patient file", async () => {
    current = null;
    expect(await readPatientAccount()).toBeNull();
    current = { ...linked, subject: "user-new", email: "new@example.be" };
    expect(await readPatientAccount()).toBeNull();
  });

  it("returns the signed-in patient's own account", async () => {
    current = linked;
    const account = await readPatientAccount();
    expect(account?.id).toBe(accountId);
    expect(account?.authSubject).toBe("user-linked");
  });
});

describe("the last sign-in, for the inactivity clock", () => {
  it("stamps a live session at most once a day", async () => {
    current = linked;
    const first = await readPatientAccount();
    const stamped = first?.lastSeenAt?.getTime();
    expect(stamped).toBeTypeOf("number");
    const second = await readPatientAccount();
    expect(second?.lastSeenAt?.getTime()).toBe(stamped);
  });

  it("stamps a session again after a day", async () => {
    current = linked;
    const account = await readPatientAccount();
    if (!account?.lastSeenAt) {
      throw new Error("the session was not stamped");
    }
    const tomorrow = new Date(account.lastSeenAt.getTime() + 25 * 3600_000);
    const later = await recordPatientAccountSeen(account, { now: tomorrow });
    expect(later.lastSeenAt).toEqual(tomorrow);
  });

  it("stamps every sign-in", async () => {
    const before = Date.now();
    const result = await completePatientSignIn(linked, "password");
    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }
    expect(result.data.account.lastSeenAt?.getTime()).toBeGreaterThanOrEqual(
      before,
    );
  });
});
