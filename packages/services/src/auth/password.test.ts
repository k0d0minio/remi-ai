import { describe, expect, it } from "vitest";
import { hashPassword, MIN_PASSWORD_LENGTH, verifyPassword } from "./password";

const PASSWORD = "correct horse battery staple";

describe("hashPassword", () => {
  it("round-trips the password it was given", async () => {
    const stored = await hashPassword(PASSWORD);
    await expect(verifyPassword(PASSWORD, stored)).resolves.toBe(true);
  });

  it("never stores the password", async () => {
    const stored = await hashPassword(PASSWORD);
    expect(stored).not.toContain(PASSWORD);
    expect(stored).not.toContain("horse");
  });

  it("salts per user, so the same password hashes differently twice", async () => {
    const [first, second] = await Promise.all([
      hashPassword(PASSWORD),
      hashPassword(PASSWORD),
    ]);
    expect(first).not.toEqual(second);
    await expect(verifyPassword(PASSWORD, first)).resolves.toBe(true);
    await expect(verifyPassword(PASSWORD, second)).resolves.toBe(true);
  });

  it("records the cost parameters so they can be raised later", async () => {
    const [scheme, cost, blockSize, parallelism] = (
      await hashPassword(PASSWORD)
    ).split("$");
    expect(scheme).toBe("scrypt");
    expect(Number(cost)).toBeGreaterThanOrEqual(16_384);
    expect(Number(blockSize)).toBe(8);
    expect(Number(parallelism)).toBe(1);
  });

  it("refuses a password too short to be an operator credential", async () => {
    await expect(
      hashPassword("a".repeat(MIN_PASSWORD_LENGTH - 1)),
    ).rejects.toThrow(/at least/);
  });
});

describe("verifyPassword", () => {
  it("rejects the wrong password", async () => {
    const stored = await hashPassword(PASSWORD);
    await expect(
      verifyPassword("wrong horse battery staple", stored),
    ).resolves.toBe(false);
  });

  it("rejects an empty password against a real hash", async () => {
    const stored = await hashPassword(PASSWORD);
    await expect(verifyPassword("", stored)).resolves.toBe(false);
  });

  it("treats a password differing only in unicode form as the same one", async () => {
    // "café" composed vs decomposed — identical on screen, different bytes.
    const stored = await hashPassword("café au lait please");
    await expect(verifyPassword("café au lait please", stored)).resolves.toBe(
      true,
    );
  });

  it.each([
    ["empty", ""],
    ["not a scrypt string", "argon2$whatever"],
    ["too few fields", "scrypt$16384$8$1$abc"],
    ["an empty key", "scrypt$16384$8$1$YWJj$"],
    ["an empty salt", "scrypt$16384$8$1$$YWJj"],
    ["a non-numeric cost", "scrypt$oops$8$1$YWJj$YWJj"],
    ["an absurd cost", "scrypt$1073741824$8$1$YWJj$YWJj"],
  ])("returns false rather than throwing on %s", async (_label, stored) => {
    await expect(verifyPassword(PASSWORD, stored)).resolves.toBe(false);
  });
});
