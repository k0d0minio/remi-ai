import { createHash, randomBytes } from "node:crypto";
import { z } from "zod";
import { operatorRoles } from "../../../shared/operator";
import { err, ok, type Result } from "../../../shared/result";
import type { Id } from "../../../types";
import { getDatabase } from "../../client";
import type { Operator } from "../../models/operator";
import type { OperatorInvitation } from "../../models/operator-invitation";
import { createOperator, findOperatorByEmail } from "../operators";

/**
 * Invitations to the admin console — how Morgane and Arnaud get accounts
 * without a shared password or a seed script.
 *
 * The token is a capability, and it is stored hashed. That is the one design
 * decision here worth stating: a database dump of this table must not be a set
 * of working invite links, so the plaintext exists exactly twice — in the
 * email, and in the link shown once to whoever sent the invite.
 *
 * SHA-256 and not scrypt, unlike the password hash beside it: the token is 32
 * random bytes, so there is no dictionary to slow an attacker down through.
 * Stretching a 256-bit secret buys nothing and costs a lookup.
 */

const invitations = () =>
  getDatabase().collection<OperatorInvitation>("operator_invitations");

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const normaliseEmail = (email: string) => email.trim().toLowerCase();

const newToken = () => randomBytes(32).toString("base64url");

const digest = (token: string) =>
  createHash("sha256").update(token).digest("hex");

const inviteSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email("a valid email address is required")),
  name: z.string().trim().max(200),
  role: z.enum(operatorRoles),
});

export type InvitationInput = z.input<typeof inviteSchema>;

/** The plaintext token comes back once, with the row. It is never readable again. */
export type IssuedInvitation = {
  invitation: OperatorInvitation;
  token: string;
};

const isPending = (invitation: OperatorInvitation, now = Date.now()) =>
  invitation.acceptedAt === null && invitation.expiresAt.getTime() > now;

/** Pending first, then the rest — newest of each. */
export const listInvitations = async (): Promise<
  readonly OperatorInvitation[]
> => {
  const page = await invitations().findMany({}, { limit: 200 });
  const now = Date.now();
  return [...page.items].sort((a, b) => {
    const pendingDelta = Number(isPending(b, now)) - Number(isPending(a, now));
    return pendingDelta !== 0
      ? pendingDelta
      : b.createdAt.getTime() - a.createdAt.getTime();
  });
};

/**
 * Only the invitations still worth acting on: unaccepted, and not yet expired.
 *
 * It lives here rather than as a filter at the call site because deciding it
 * means reading the clock, and a React render body may not do that — "pending"
 * is one predicate, applied once, on the server.
 */
export const listPendingInvitations = async (): Promise<
  readonly OperatorInvitation[]
> => {
  const now = Date.now();
  return (await listInvitations()).filter((invitation) =>
    isPending(invitation, now),
  );
};

/**
 * Issues an invitation, replacing any invitation still pending for the same
 * address. Re-inviting is the normal response to "the mail never arrived", and
 * it must invalidate the previous link rather than leave two working — so the
 * replacement is a delete, not a second row.
 */
export const createInvitation = async (
  input: InvitationInput,
  invitedByEmail: string,
): Promise<Result<IssuedInvitation>> => {
  const parsed = inviteSchema.safeParse(input);
  if (!parsed.success) {
    return err("invalid_input", parsed.error.issues[0].message);
  }
  const email = parsed.data.email;
  if (await findOperatorByEmail(email)) {
    return err("conflict", "that address already has an account");
  }

  const existing = await invitations().findMany({ email }, { limit: 50 });
  for (const invitation of existing.items) {
    if (invitation.acceptedAt === null) {
      await invitations().remove(invitation.id);
    }
  }

  const token = newToken();
  const invitation = await invitations().insert({
    email,
    name: parsed.data.name,
    role: parsed.data.role,
    tokenHash: digest(token),
    expiresAt: new Date(Date.now() + INVITE_TTL_MS),
    acceptedAt: null,
    invitedByEmail: normaliseEmail(invitedByEmail),
  });
  return ok({ invitation, token });
};

/**
 * Resolves a token to the invitation it opens, or says why it does not. The
 * three failures are deliberately distinguishable — an expired invitation is a
 * thing the recipient can act on ("ask for a new link"), unlike a wrong token.
 */
export const getInvitationByToken = async (
  token: string,
): Promise<Result<OperatorInvitation>> => {
  if (!/^[A-Za-z0-9_-]{16,128}$/.test(token)) {
    return err("not_found", "this invitation link is not valid");
  }
  const page = await invitations().findMany(
    { tokenHash: digest(token) },
    { limit: 1 },
  );
  const invitation = page.items[0];
  if (!invitation) {
    return err("not_found", "this invitation link is not valid");
  }
  if (invitation.acceptedAt !== null) {
    return err("conflict", "this invitation has already been used");
  }
  if (invitation.expiresAt.getTime() <= Date.now()) {
    return err("not_permitted", "this invitation has expired");
  }
  return ok(invitation);
};

const acceptSchema = z.object({
  name: z.string().trim().min(1, "a name is required").max(200),
  password: z
    .string()
    .min(12, "the password needs at least 12 characters")
    .max(1_000),
});

export type AcceptInput = z.input<typeof acceptSchema>;

/**
 * Turns an invitation into an account. The email and the role come from the
 * invitation, never from the form: the recipient chooses their name and their
 * password, and nothing else. Otherwise an invitation for `operator` would be
 * a form field away from minting an owner.
 */
export const acceptInvitation = async (
  token: string,
  input: AcceptInput,
): Promise<Result<Operator>> => {
  const found = await getInvitationByToken(token);
  if (!found.ok) {
    return found;
  }
  const parsed = acceptSchema.safeParse(input);
  if (!parsed.success) {
    return err("invalid_input", parsed.error.issues[0].message);
  }
  const invitation = found.data;
  const created = await createOperator({
    email: invitation.email,
    name: parsed.data.name,
    password: parsed.data.password,
    role: invitation.role,
  });
  if (!created.ok) {
    return created;
  }
  // Marked used only after the account exists: the other order turns a failed
  // create into an invitation nobody can retry.
  await invitations().update(invitation.id, { acceptedAt: new Date() });
  return ok(created.data);
};

export const revokeInvitation = async (id: Id): Promise<Result<true>> => {
  if (!z.uuid().safeParse(id).success) {
    return err("not_found", "no such invitation");
  }
  const removed = await invitations().remove(id);
  return removed ? ok(true) : err("not_found", "no such invitation");
};
