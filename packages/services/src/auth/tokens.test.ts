import { afterEach, describe, expect, it, vi } from "vitest";
import { createSessionToken, hashSessionToken } from "./tokens";

describe("createSessionToken", () => {
  it("is 256 bits, url-safe", () => {
    const token = createSessionToken();
    expect(Buffer.from(token, "base64url")).toHaveLength(32);
    expect(token).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it("does not repeat", () => {
    const tokens = new Set(
      Array.from({ length: 200 }, () => createSessionToken()),
    );
    expect(tokens.size).toBe(200);
  });
});

describe("hashSessionToken", () => {
  it("is a stable sha256 HMAC — the same token always finds its row", () => {
    const token = createSessionToken();
    expect(hashSessionToken(token)).toBe(hashSessionToken(token));
    expect(hashSessionToken(token)).toMatch(/^[0-9a-f]{64}$/);
  });

  it("does not contain the token it hashed", () => {
    const token = createSessionToken();
    expect(hashSessionToken(token)).not.toContain(token);
  });

  it("separates tokens that differ by one character", () => {
    expect(hashSessionToken("aaaa")).not.toBe(hashSessionToken("aaab"));
  });
});

describe("without AUTH_SECRET", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("fails naming the variable rather than hashing against undefined", async () => {
    vi.stubEnv("AUTH_SECRET", "");
    vi.resetModules();

    // A fresh module registry, so `env()`'s cached parse is rebuilt from the
    // stubbed environment rather than the one the setup file left behind.
    const { hashSessionToken: fresh } = await import("./tokens");
    expect(() => fresh("anything")).toThrow(/AUTH_SECRET/);
  });
});
