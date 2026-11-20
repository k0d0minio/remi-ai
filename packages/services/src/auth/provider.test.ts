import { describe, expect, it } from "vitest";
import { ok } from "../shared/result";
import {
  getAuthProvider,
  isAuthProviderRegistered,
  isSessionReadError,
  registerAuthProvider,
  SessionReadError,
  type AuthProvider,
} from "./provider";

const fakeProvider = (name: string): AuthProvider => ({
  name,
  signUp: async () =>
    ok({ subject: "s", email: "e", name: "", emailVerified: false }),
  signIn: async () =>
    ok({ subject: "s", email: "e", name: "", emailVerified: false }),
  requestMagicLink: async () => ok(null),
  signOut: async () => ok(null),
  readIdentity: async () => null,
  requestPasswordReset: async () => ok(null),
  resetPassword: async () => ok(null),
  completeRedirectSignIn: async () => null,
  renewSessionCache: async () => null,
  routeHandlers: () => {
    throw new Error("not used");
  },
});

describe("the auth seam", () => {
  it("throws, naming the fix, before an adapter is registered", () => {
    expect(isAuthProviderRegistered()).toBe(false);
    expect(() => getAuthProvider()).toThrow(/registerAuthProvider/);
  });

  it("hands back the registered adapter", () => {
    const first = fakeProvider("first");
    registerAuthProvider(first);
    expect(isAuthProviderRegistered()).toBe(true);
    expect(getAuthProvider()).toBe(first);
  });

  it("accepts the same adapter twice, so ensure helpers stay idempotent", () => {
    const current = getAuthProvider();
    expect(() => registerAuthProvider(current)).not.toThrow();
  });

  it("refuses a second, different adapter", () => {
    expect(() => registerAuthProvider(fakeProvider("second"))).toThrow(
      /already registered/,
    );
  });
});

describe("the session read error", () => {
  it("is known by its name, across two copies of the module", () => {
    expect(isSessionReadError(new SessionReadError("502 NETWORK_ERROR"))).toBe(
      true,
    );
    // A copy of the class from another route bundle: not `instanceof`.
    expect(isSessionReadError({ name: "SessionReadError", reason: "x" })).toBe(
      true,
    );
    expect(isSessionReadError(new Error("NEXT_REDIRECT"))).toBe(false);
    expect(isSessionReadError(null)).toBe(false);
  });

  it("carries the reason, and names no session", () => {
    const failure = new SessionReadError("429 no code");
    expect(failure.reason).toBe("429 no code");
    expect(failure.message).toBe("the session read failed (429 no code)");
  });
});
