import { beforeAll, describe, expect, it } from "vitest";
import { registerDatabase } from "../../client";
import { createMemoryDatabase } from "../../test-helpers";
import {
  createOperator,
  findOperatorByEmail,
  hasOperator,
  verifyOperator,
} from "./index";

beforeAll(() => {
  registerDatabase(createMemoryDatabase());
});

describe("operators", () => {
  it("starts with no operator — the bootstrap flow's condition", async () => {
    expect(await hasOperator()).toBe(false);
  });

  it("creates, normalising the email, then verifies the credentials", async () => {
    const created = await createOperator({
      email: "  Morgane@Example.com ",
      name: "Morgane",
      password: "long enough password",
    });
    expect(created.ok).toBe(true);
    expect(await hasOperator()).toBe(true);
    expect(await findOperatorByEmail("morgane@example.com")).not.toBeNull();

    const verified = await verifyOperator(
      "MORGANE@example.com",
      "long enough password",
    );
    expect(verified.ok).toBe(true);
  });

  it("answers a wrong password and an unknown email identically", async () => {
    const wrongPassword = await verifyOperator(
      "morgane@example.com",
      "not the password",
    );
    const unknownEmail = await verifyOperator(
      "nobody@example.com",
      "long enough password",
    );
    expect(wrongPassword.ok).toBe(false);
    expect(unknownEmail.ok).toBe(false);
    if (!wrongPassword.ok && !unknownEmail.ok) {
      expect(wrongPassword.message).toBe(unknownEmail.message);
    }
  });

  it("refuses a second operator on the same email", async () => {
    const duplicate = await createOperator({
      email: "morgane@example.com",
      name: "Someone else",
      password: "another long password",
    });
    expect(duplicate.ok).toBe(false);
    if (!duplicate.ok) {
      expect(duplicate.error).toBe("conflict");
    }
  });

  it("refuses a short password", async () => {
    const result = await createOperator({
      email: "second@example.com",
      name: "Short",
      password: "too short",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("invalid_input");
    }
  });
});
