import { beforeAll, describe, expect, it } from "vitest";
import { registerDatabase } from "../db/client";
import { createPatientAccount } from "../db/services/patient-accounts";
import { createPatient } from "../db/services/patients";
import { createMemoryDatabase, testPractitionerId } from "../db/test-helpers";
import { ok } from "../shared/result";
import { registerAuthProvider, type AuthIdentity } from "./provider";
import { readSession } from "./session";

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
    routeHandlers: () => {
      throw new Error("not used");
    },
  });

  const patient = await createPatient({
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
