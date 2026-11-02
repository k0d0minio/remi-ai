import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { getDatabase, registerDatabase } from "../db/client";
import type { PatientProfile } from "../db/models/patient-profile";
import { listAuditEvents } from "../db/services/audit";
import { createOperator } from "../db/services/operators";
import { getPatientAccountByEmail } from "../db/services/patient-accounts";
import { getPatient } from "../db/services/patients";
import { createMemoryDatabase } from "../db/test-helpers";
import { err, ok } from "../shared/result";
import { signUpPatient, validateSignup, type SignupData } from "./patient-signup";
import { registerAuthProvider, type AuthIdentity } from "./provider";

/** The identity store of the fake adapter: e-mail → password and user. */
const users = new Map<string, { password: string; identity: AuthIdentity }>();
let nextSubject = 1;

const valid = {
  lastName: "Dupont",
  firstName: "Marie",
  birthDate: "1985-04-12",
  email: "Marie.Dupont@Example.be",
  phone: "+32 470 12 34 56",
  password: "correct horse",
};

const data = (overrides: Partial<typeof valid> = {}): SignupData => {
  const checked = validateSignup({ ...valid, ...overrides });
  if (!checked.ok) {
    throw new Error("test input refused");
  }
  return checked.data;
};

let practitionerId: string;
let token: string;

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
    routeHandlers: () => {
      throw new Error("not used");
    },
  });

  const operator = await createOperator({
    email: "morgane@example.be",
    name: "Morgane",
    password: "long enough password",
    role: "owner",
  });
  if (!operator.ok) {
    throw new Error("test practitioner not created");
  }
  practitionerId = operator.data.id;
  token = operator.data.signupLinkToken;
});

beforeEach(() => {
  users.clear();
});

const signUp = (overrides: Partial<typeof valid> = {}, link = token) =>
  signUpPatient({
    token: link,
    locale: "fr",
    data: data(overrides),
    callbackPath: "/fr/questionnaire",
  });

const profiles = async () =>
  (
    await getDatabase()
      .collection<PatientProfile>("patient_profiles")
      .findMany({}, { limit: 500 })
  ).items;

describe("the sign-up fields", () => {
  it("names each empty mandatory field as required", () => {
    const checked = validateSignup({});
    expect(checked).toEqual({
      ok: false,
      fields: {
        lastName: "required",
        firstName: "required",
        birthDate: "required",
        email: "required",
        phone: "required",
        password: "required",
      },
    });
  });

  it("refuses an e-mail that is not an address", () => {
    const checked = validateSignup({ ...valid, email: "marie@" });
    expect(checked).toEqual({ ok: false, fields: { email: "invalid" } });
  });

  it("refuses a day that does not exist or is not past", () => {
    for (const birthDate of ["1985-02-30", "12/04/1985", "2999-01-01"]) {
      const checked = validateSignup({ ...valid, birthDate });
      expect(checked).toEqual({ ok: false, fields: { birthDate: "invalid" } });
    }
  });

  it("accepts digits, spaces and one leading +, and stores the digits", () => {
    expect(data({ phone: " 0470 12 34 56 " }).phone).toBe("0470123456");
    for (const phone of ["0470-12-34", "+32 4", "++32470123456", "abc"]) {
      const checked = validateSignup({ ...valid, phone });
      expect(checked).toEqual({ ok: false, fields: { phone: "invalid" } });
    }
  });

  it("asks for 8 password characters", () => {
    const checked = validateSignup({ ...valid, password: "short" });
    expect(checked).toEqual({ ok: false, fields: { password: "too_short" } });
  });

  it("lower-cases the e-mail", () => {
    expect(data().email).toBe("marie.dupont@example.be");
  });
});

describe("the sign-up", () => {
  it("writes nothing for an unknown or malformed token", async () => {
    const before = (await profiles()).length;
    for (const link of ["not-a-token", "A".repeat(32)]) {
      const result = await signUp({}, link);
      expect(result).toMatchObject({ ok: false, error: "not_found" });
    }
    expect(await profiles()).toHaveLength(before);
    expect(users.size).toBe(0);
  });

  it("attaches the file to the link's practitioner and writes the account and one event", async () => {
    const result = await signUp({ email: "claire@example.be" });
    if (!result.ok) {
      throw new Error(result.message);
    }
    const patient = await getPatient(result.data.patientId);
    if (!patient.ok) {
      throw new Error("patient not written");
    }
    expect(patient.data).toMatchObject({
      practitionerId,
      firstName: "Marie",
      lastName: "Dupont",
      fullName: "Marie Dupont",
      phone: "+32470123456",
      birthDate: "1985-04-12",
      email: "claire@example.be",
      locale: "fr",
    });
    expect(patient.data.pseudonym).toMatch(/^Patient [A-HJ-NP-Z2-9]{4}$/);

    const account = await getPatientAccountByEmail("claire@example.be");
    expect(account?.patientProfileId).toBe(patient.data.id);
    expect(account?.authSubject).toBe(
      users.get("claire@example.be")?.identity.subject,
    );

    const events = await listAuditEvents({
      action: "patient.signed_up",
      targetId: patient.data.id,
    });
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      actorKind: "patient",
      actorId: patient.data.id,
    });
  });

  it("refuses an e-mail that already has an account and writes nothing", async () => {
    expect((await signUp({ email: "lea@example.be" })).ok).toBe(true);
    const before = (await profiles()).length;
    const again = await signUp({ email: "LEA@example.be" });
    expect(again).toMatchObject({ ok: false, error: "conflict" });
    expect(await profiles()).toHaveLength(before);
  });

  it("finishes a sign-up whose identity exists without a file", async () => {
    // A failed write left the identity store's user and no REMI rows.
    users.set("sam@example.be", {
      password: valid.password,
      identity: {
        subject: "user-orphan",
        email: "sam@example.be",
        name: "Sam",
        emailVerified: false,
      },
    });
    const result = await signUp({ email: "sam@example.be" });
    expect(result.ok).toBe(true);
    const account = await getPatientAccountByEmail("sam@example.be");
    expect(account?.authSubject).toBe("user-orphan");
  });

  it("refuses that identity with a wrong password and writes nothing", async () => {
    users.set("noa@example.be", {
      password: "another password",
      identity: {
        subject: "user-noa",
        email: "noa@example.be",
        name: "Noa",
        emailVerified: false,
      },
    });
    const before = (await profiles()).length;
    const result = await signUp({ email: "noa@example.be" });
    expect(result).toMatchObject({ ok: false, error: "conflict" });
    expect(await profiles()).toHaveLength(before);
  });
});
