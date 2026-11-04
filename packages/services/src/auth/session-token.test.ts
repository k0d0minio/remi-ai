import { beforeAll, describe, expect, it } from "vitest";
import {
  createOpenGrantToken,
  createSessionToken,
  verifyOpenGrantToken,
  verifySessionToken,
} from "./session-token";

const OPERATOR_ID = "e3a1c1de-0000-4000-8000-000000000001";

beforeAll(() => {
  // Before the first token call: env() caches on first read.
  process.env.AUTH_SECRET = "a test secret, never a real one";
});

describe("session tokens", () => {
  it("round-trips the operator id", () => {
    const token = createSessionToken(OPERATOR_ID);
    expect(verifySessionToken(token)).toBe(OPERATOR_ID);
  });

  it("rejects an expired token", () => {
    const token = createSessionToken(OPERATOR_ID, -10);
    expect(verifySessionToken(token)).toBeNull();
  });

  it("rejects a payload swapped under a valid signature", () => {
    const token = createSessionToken(OPERATOR_ID);
    const signature = token.split(".")[1];
    const forged = Buffer.from(
      JSON.stringify({
        sub: "e3a1c1de-0000-4000-8000-999999999999",
        exp: Math.floor(Date.now() / 1000) + 3600,
      }),
    ).toString("base64url");
    expect(verifySessionToken(`${forged}.${signature}`)).toBeNull();
  });

  it("rejects garbage", () => {
    expect(verifySessionToken("")).toBeNull();
    expect(verifySessionToken("just-one-part")).toBeNull();
    expect(verifySessionToken("two.parts")).toBeNull();
    expect(verifySessionToken("a.b.c")).toBeNull();
  });
});

describe("admin open grants", () => {
  const admin = "00000000-0000-4000-8000-00000000ad00";
  const file = "00000000-0000-4000-8000-00000000f11e";

  it("names the opened file for its own admin only", () => {
    const token = createOpenGrantToken(admin, file);
    expect(verifyOpenGrantToken(token, admin)).toBe(file);
    expect(
      verifyOpenGrantToken(token, "00000000-0000-4000-8000-00000000b2a0"),
    ).toBeNull();
  });

  it("refuses an expired or a tampered grant", () => {
    expect(
      verifyOpenGrantToken(createOpenGrantToken(admin, file, -1), admin),
    ).toBeNull();
    const [payload] = createOpenGrantToken(admin, file).split(".");
    expect(verifyOpenGrantToken(`${payload}.forged`, admin)).toBeNull();
  });

  it("never verifies as a session, nor a session as a grant", () => {
    expect(verifySessionToken(createOpenGrantToken(admin, file))).toBeNull();
    expect(verifyOpenGrantToken(createSessionToken(admin), admin)).toBeNull();
  });
});
