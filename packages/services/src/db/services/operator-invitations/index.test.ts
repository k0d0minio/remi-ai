import { beforeAll, describe, expect, it } from "vitest";
import { registerDatabase } from "../../client";
import { createMemoryDatabase } from "../../test-helpers";
import { findOperatorByEmail, verifyOperator } from "../operators";
import {
  acceptInvitation,
  createInvitation,
  getInvitationByToken,
  listInvitations,
  listPendingInvitations,
  revokeInvitation,
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

const invite = (email: string, role: "owner" | "operator" = "operator") =>
  createInvitation({ email, name: "Invitee", role }, "morgane@example.com");

describe("operator invitations", () => {
  it("issues a token that is not what gets stored", async () => {
    const issued = unwrapOk(await invite("arnaud@example.com"));
    expect(issued.token.length).toBeGreaterThanOrEqual(32);
    expect(issued.invitation.tokenHash).not.toBe(issued.token);
    expect(issued.invitation.email).toBe("arnaud@example.com");
    expect(issued.invitation.acceptedAt).toBeNull();
    expect(issued.invitation.expiresAt.getTime()).toBeGreaterThan(Date.now());
  });

  it("resolves its own token and rejects a wrong one", async () => {
    const issued = unwrapOk(await invite("resolve@example.com"));
    expect(unwrapOk(await getInvitationByToken(issued.token)).id).toBe(
      issued.invitation.id,
    );
    expect((await getInvitationByToken("wrong-token-but-long-enough")).ok).toBe(
      false,
    );
    expect((await getInvitationByToken("short")).ok).toBe(false);
  });

  it("rejects an invalid email and an unknown role", async () => {
    expect(
      (
        await createInvitation(
          { email: "not-an-email", name: "", role: "operator" },
          "morgane@example.com",
        )
      ).ok,
    ).toBe(false);
  });

  it("re-inviting the same address invalidates the previous link", async () => {
    const first = unwrapOk(await invite("resend@example.com"));
    const second = unwrapOk(await invite("resend@example.com"));

    expect((await getInvitationByToken(first.token)).ok).toBe(false);
    expect((await getInvitationByToken(second.token)).ok).toBe(true);

    const pending = (await listInvitations()).filter(
      (invitation) => invitation.email === "resend@example.com",
    );
    expect(pending).toHaveLength(1);
  });

  it("turns an invitation into an account with the invited role, not a chosen one", async () => {
    const issued = unwrapOk(await invite("owner-to-be@example.com", "owner"));
    const operator = unwrapOk(
      await acceptInvitation(issued.token, {
        name: "New Owner",
        password: "a sufficiently long password",
      }),
    );
    expect(operator.email).toBe("owner-to-be@example.com");
    expect(operator.name).toBe("New Owner");
    expect(operator.role).toBe("owner");
    expect(
      (
        await verifyOperator(
          "owner-to-be@example.com",
          "a sufficiently long password",
        )
      ).ok,
    ).toBe(true);
  });

  it("refuses to accept the same invitation twice", async () => {
    const issued = unwrapOk(await invite("once@example.com"));
    expect(
      (
        await acceptInvitation(issued.token, {
          name: "Once",
          password: "a sufficiently long password",
        })
      ).ok,
    ).toBe(true);

    const again = await acceptInvitation(issued.token, {
      name: "Twice",
      password: "a sufficiently long password",
    });
    expect(again.ok).toBe(false);
    if (!again.ok) {
      expect(again.error).toBe("conflict");
    }
  });

  it("refuses a short password without consuming the invitation", async () => {
    const issued = unwrapOk(await invite("careful@example.com"));
    expect(
      (await acceptInvitation(issued.token, { name: "X", password: "short" }))
        .ok,
    ).toBe(false);
    expect(await findOperatorByEmail("careful@example.com")).toBeNull();
    // Still usable — a rejected form must not burn the only link they have.
    expect((await getInvitationByToken(issued.token)).ok).toBe(true);
  });

  it("refuses to invite an address that already has an account", async () => {
    const result = await invite("once@example.com");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("conflict");
    }
  });

  it("revokes a pending invitation", async () => {
    const issued = unwrapOk(await invite("revoked@example.com"));
    expect(unwrapOk(await revokeInvitation(issued.invitation.id))).toBe(true);
    expect((await getInvitationByToken(issued.token)).ok).toBe(false);
    expect((await revokeInvitation(issued.invitation.id)).ok).toBe(false);
    expect((await revokeInvitation("not-a-uuid")).ok).toBe(false);
  });

  it("lists the pending ones ahead of the used ones", async () => {
    const listed = await listInvitations();
    const firstUsed = listed.findIndex(
      (invitation) => invitation.acceptedAt !== null,
    );
    const lastPending = listed.reduce(
      (last, invitation, index) =>
        invitation.acceptedAt === null ? index : last,
      -1,
    );
    if (firstUsed !== -1) {
      expect(lastPending).toBeLessThan(firstUsed);
    }
  });

  it("leaves a used invitation out of the pending list", async () => {
    const issued = unwrapOk(await invite("used@example.com"));
    unwrapOk(
      await acceptInvitation(issued.token, {
        name: "Used Invite",
        password: "a sufficiently long password",
      }),
    );

    const emails = (list: readonly { email: string }[]) =>
      list.map((invitation) => invitation.email);
    expect(emails(await listPendingInvitations())).not.toContain(
      "used@example.com",
    );
    expect(emails(await listInvitations())).toContain("used@example.com");
  });
});
