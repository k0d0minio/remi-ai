import { beforeAll, describe, expect, it } from "vitest";
import { getDatabase, registerDatabase } from "../../client";
import { createMemoryDatabase } from "../../test-helpers";
import {
  changeOperatorPassword,
  createOperator,
  deleteOperator,
  findOperatorByEmail,
  getOperator,
  getPractitionerBySignupToken,
  hasOperator,
  listOperators,
  setOperatorRole,
  updateOperatorName,
  verifyOperator,
} from "./index";

beforeAll(() => {
  registerDatabase(createMemoryDatabase());
});

const unwrapOk = <T>(result: { ok: true; data: T } | { ok: false }): T => {
  expect(result.ok).toBe(true);
  if (!result.ok) {
    throw new Error("unreachable");
  }
  return result.data;
};

describe("operators", () => {
  it("starts with no operator — the bootstrap flow's condition", async () => {
    expect(await hasOperator()).toBe(false);
  });

  it("creates, normalising the email, then verifies the credentials", async () => {
    const created = await createOperator({
      email: "  Morgane@Example.com ",
      name: "Morgane",
      password: "long enough password",
      role: "owner",
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

  it("defaults a new account to the lesser role", async () => {
    const created = unwrapOk(
      await createOperator({
        email: "arnaud@example.com",
        name: "Arnaud",
        password: "another long password",
      }),
    );
    expect(created.role).toBe("operator");
  });

  it("lists owners first, then alphabetically", async () => {
    const listed = await listOperators();
    expect(listed[0]?.role).toBe("owner");
    expect(listed.map((operator) => operator.name)).toEqual([
      "Morgane",
      "Arnaud",
    ]);
  });
});

describe("the last-owner invariant", () => {
  it("refuses to demote the only owner", async () => {
    const morgane = await findOperatorByEmail("morgane@example.com");
    expect(morgane).not.toBeNull();
    if (!morgane) {
      throw new Error("unreachable");
    }
    const result = await setOperatorRole(morgane.id, "operator");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("not_permitted");
    }
    expect((await getOperator(morgane.id))?.role).toBe("owner");
  });

  it("refuses to delete the only owner", async () => {
    const morgane = await findOperatorByEmail("morgane@example.com");
    if (!morgane) {
      throw new Error("unreachable");
    }
    const result = await deleteOperator(morgane.id);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("not_permitted");
    }
  });

  it("allows both once a second owner exists", async () => {
    const arnaud = await findOperatorByEmail("arnaud@example.com");
    const morgane = await findOperatorByEmail("morgane@example.com");
    if (!arnaud || !morgane) {
      throw new Error("unreachable");
    }
    expect(unwrapOk(await setOperatorRole(arnaud.id, "owner")).role).toBe(
      "owner",
    );
    expect(unwrapOk(await setOperatorRole(morgane.id, "operator")).role).toBe(
      "operator",
    );
    expect(unwrapOk(await deleteOperator(morgane.id))).toBe(true);
    expect(await findOperatorByEmail("morgane@example.com")).toBeNull();
  });

  it("refuses to delete an account that still holds a patient file", async () => {
    const holder = unwrapOk(
      await createOperator({
        email: "holder@example.com",
        name: "Holder",
        password: "a long enough password",
      }),
    );
    await getDatabase()
      .collection<{ id: string; practitionerId: string }>("patient_profiles")
      .insert({ practitionerId: holder.id });
    const result = await deleteOperator(holder.id);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("not_permitted");
    }
    expect(await getOperator(holder.id)).not.toBeNull();
  });

  it("setting the role an account already holds is a no-op, not a refusal", async () => {
    const arnaud = await findOperatorByEmail("arnaud@example.com");
    if (!arnaud) {
      throw new Error("unreachable");
    }
    expect(unwrapOk(await setOperatorRole(arnaud.id, "owner")).role).toBe(
      "owner",
    );
  });
});

describe("an operator's own account", () => {
  it("renames, and refuses an empty name", async () => {
    const arnaud = await findOperatorByEmail("arnaud@example.com");
    if (!arnaud) {
      throw new Error("unreachable");
    }
    expect(
      unwrapOk(await updateOperatorName(arnaud.id, " Arnaud B ")).name,
    ).toBe("Arnaud B");
    expect((await updateOperatorName(arnaud.id, "  ")).ok).toBe(false);
  });

  it("changes the password only with the current one", async () => {
    const arnaud = await findOperatorByEmail("arnaud@example.com");
    if (!arnaud) {
      throw new Error("unreachable");
    }
    const wrong = await changeOperatorPassword(
      arnaud.id,
      "not the password",
      "a brand new long password",
    );
    expect(wrong.ok).toBe(false);
    if (!wrong.ok) {
      expect(wrong.error).toBe("not_permitted");
    }

    const tooShort = await changeOperatorPassword(
      arnaud.id,
      "another long password",
      "short",
    );
    expect(tooShort.ok).toBe(false);

    expect(
      (
        await changeOperatorPassword(
          arnaud.id,
          "another long password",
          "a brand new long password",
        )
      ).ok,
    ).toBe(true);
    expect(
      (await verifyOperator("arnaud@example.com", "a brand new long password"))
        .ok,
    ).toBe(true);
  });

  it("treats a malformed id as not found", async () => {
    expect(await getOperator("not-a-uuid")).toBeNull();
    expect((await setOperatorRole("not-a-uuid", "owner")).ok).toBe(false);
    expect((await deleteOperator("not-a-uuid")).ok).toBe(false);
    expect((await updateOperatorName("not-a-uuid", "Name")).ok).toBe(false);
    expect(
      (await changeOperatorPassword("not-a-uuid", "a", "a long password here"))
        .ok,
    ).toBe(false);
  });
});

describe("the permanent sign-up link", () => {
  const create = async (email: string) =>
    unwrapOk(
      await createOperator({
        email,
        name: email.split("@")[0],
        password: "a long enough password",
      }),
    );

  it("gives each new account one token of 32 base64url characters", async () => {
    const first = await create("link-one@example.com");
    const second = await create("link-two@example.com");
    expect(first.signupLinkToken).toMatch(/^[A-Za-z0-9_-]{32}$/);
    expect(second.signupLinkToken).toMatch(/^[A-Za-z0-9_-]{32}$/);
    expect(first.signupLinkToken).not.toBe(second.signupLinkToken);
  });

  it("resolves a token to its practitioner, every time, with no email and no hash", async () => {
    const practitioner = await create("link-resolve@example.com");
    // Two resolutions of one link name the same practitioner: the link is reusable.
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const resolved = unwrapOk(
        await getPractitionerBySignupToken(practitioner.signupLinkToken),
      );
      expect(resolved).toEqual({
        id: practitioner.id,
        name: practitioner.name,
      });
    }
  });

  it("refuses an unknown token and a malformed one", async () => {
    const unknown = await getPractitionerBySignupToken("A".repeat(32));
    const tooShort = await getPractitionerBySignupToken("abc");
    const badCharacter = await getPractitionerBySignupToken(
      `${"A".repeat(31)}/`,
    );
    for (const result of [unknown, tooShort, badCharacter]) {
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBe("not_found");
      }
    }
  });

  it("keeps the token through a password change and a rename", async () => {
    const practitioner = await create("link-keep@example.com");
    unwrapOk(
      await changeOperatorPassword(
        practitioner.id,
        "a long enough password",
        "a different long password",
      ),
    );
    unwrapOk(await updateOperatorName(practitioner.id, "Renamed"));
    expect((await getOperator(practitioner.id))?.signupLinkToken).toBe(
      practitioner.signupLinkToken,
    );
  });
});
