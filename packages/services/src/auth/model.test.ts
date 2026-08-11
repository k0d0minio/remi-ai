import { describe, expect, it } from "vitest";
import {
  isAuthRole,
  isAuthUserStatus,
  isOperator,
  type Session,
} from "./model";

const session = (overrides: Partial<Session> = {}): Session => ({
  id: "session-1",
  actor: { id: "user-1", email: "dana@example.com", roles: ["operator"] },
  role: "operator",
  status: "active",
  expiresAt: new Date("2026-08-11T18:00:00Z"),
  ...overrides,
});

/**
 * The whole authorisation rule for both consoles. It is pure precisely so it can
 * be pinned down here — the gate itself is one call to it in one layout, and a
 * regression in this function is a regression in every gated route at once.
 */
describe("isOperator", () => {
  it("grants an active operator", () => {
    expect(isOperator(session())).toBe(true);
  });

  it("refuses a signed-out visitor", () => {
    expect(isOperator(null)).toBe(false);
  });

  it("refuses a suspended operator, without waiting for the session to expire", () => {
    expect(isOperator(session({ status: "suspended" }))).toBe(false);
  });

  it.each(["practitioner", "person", "admin", "OPERATOR", ""])(
    "refuses the role %o",
    (role) => {
      expect(isOperator(session({ role }))).toBe(false);
    },
  );
});

describe("role and status vocabulary", () => {
  it("recognises only the roles the database CHECK constraint allows", () => {
    expect(isAuthRole("operator")).toBe(true);
    expect(isAuthRole("practitioner")).toBe(false);
    expect(isAuthRole(undefined)).toBe(false);
  });

  it("recognises only the statuses the database CHECK constraint allows", () => {
    expect(isAuthUserStatus("active")).toBe(true);
    expect(isAuthUserStatus("suspended")).toBe(true);
    expect(isAuthUserStatus("deleted")).toBe(false);
  });
});
