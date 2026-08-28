"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  acceptInvitation,
  changeOperatorPassword,
  createInvitation,
  deleteOperator,
  operatorInvitationEmail,
  revokeInvitation,
  sendEmail,
  setOperatorRole,
  updateOperatorName,
} from "@remi/services/server";
import {
  appHref,
  operatorRoles,
  type OperatorRoleName,
} from "@remi/services/shared";
import { audit } from "@/lib/audit";
import { requireOperator, requireOwner } from "@/lib/auth/session";
import { setSessionCookie } from "@/lib/auth/cookie";
import { ensureDatabase } from "@/lib/database";
import { mailerReady } from "@/lib/mailer";

/**
 * Account management. Every action re-asserts its own guard before touching
 * anything — `requireOwner` for the ones that reach another account,
 * `requireOperator` for the ones that reach only your own. The page decides
 * what renders; an action is an endpoint of its own.
 */

const field = (formData: FormData, name: string) =>
  String(formData.get(name) ?? "");

const asRole = (value: string): OperatorRoleName =>
  (operatorRoles as readonly string[]).includes(value)
    ? (value as OperatorRoleName)
    : "operator";

export type InviteFormState = {
  error: string | null;
  /** Present on success — the link is shown whether or not the mail went out. */
  invited: {
    email: string;
    url: string;
    emailed: boolean;
  } | null;
};

/**
 * Issues an invitation and, where this deployment can send mail, emails it.
 *
 * The link comes back either way. A send that fails must not lose the only way
 * into the console — the inviter can always paste the link into a message
 * themselves, which is also the answer when the mail lands in a spam folder.
 */
export const inviteOperatorAction = async (
  _previous: InviteFormState,
  formData: FormData,
): Promise<InviteFormState> => {
  const operator = await requireOwner();
  ensureDatabase();

  const issued = await createInvitation(
    {
      email: field(formData, "email"),
      name: field(formData, "name"),
      role: asRole(field(formData, "role")),
    },
    operator.email,
  );
  if (!issued.ok) {
    return { error: issued.message, invited: null };
  }

  const { invitation, token } = issued.data;
  const url = appHref("admin", `/invitation/${token}`);

  let emailed = false;
  if (mailerReady()) {
    try {
      await sendEmail({
        to: invitation.email,
        ...operatorInvitationEmail({
          name: invitation.name,
          inviterName: operator.name,
          url,
          expiresAt: invitation.expiresAt,
        }),
      });
      emailed = true;
    } catch (cause) {
      // Not an error the inviter has to act on: the link below still works.
      console.error("[invite] the invitation email could not be sent", cause);
    }
  }

  await audit(operator, "operator.invited", {
    type: "operator",
    id: invitation.id,
    label: invitation.email,
    detail: emailed ? "invitation envoyée par email" : "lien à transmettre",
  });
  revalidatePath("/team");

  return { error: null, invited: { email: invitation.email, url, emailed } };
};

export const revokeInvitationAction = async (formData: FormData) => {
  const operator = await requireOwner();
  ensureDatabase();
  const id = field(formData, "id");
  const email = field(formData, "email");
  const revoked = await revokeInvitation(id);
  if (revoked.ok) {
    await audit(operator, "operator.invite_revoked", {
      type: "operator",
      id,
      label: email,
    });
  }
  revalidatePath("/team");
};

export type OperatorActionState = { error: string | null };

export const setOperatorRoleAction = async (
  _previous: OperatorActionState,
  formData: FormData,
): Promise<OperatorActionState> => {
  const operator = await requireOwner();
  ensureDatabase();
  const id = field(formData, "id");
  const role = asRole(field(formData, "role"));
  const result = await setOperatorRole(id, role);
  if (!result.ok) {
    return { error: result.message };
  }
  await audit(operator, "operator.role_changed", {
    type: "operator",
    id,
    label: result.data.email,
    detail: role,
  });
  revalidatePath("/team");
  return { error: null };
};

export const removeOperatorAction = async (
  _previous: OperatorActionState,
  formData: FormData,
): Promise<OperatorActionState> => {
  const operator = await requireOwner();
  ensureDatabase();
  const id = field(formData, "id");
  const email = field(formData, "email");
  if (id === operator.id) {
    return {
      error: "vous ne pouvez pas supprimer votre propre compte",
    };
  }
  const result = await deleteOperator(id);
  if (!result.ok) {
    return { error: result.message };
  }
  await audit(operator, "operator.removed", {
    type: "operator",
    id,
    label: email,
  });
  revalidatePath("/team");
  return { error: null };
};

export type AcceptFormState = { error: string | null };

/**
 * The one action here with no operator guard, because it is how someone stops
 * being a stranger: the token IS the credential. The email and the role come
 * from the invitation rather than the form, so a posted `role` field cannot
 * turn an operator invite into an owner account.
 */
export const acceptInvitationAction = async (
  _previous: AcceptFormState,
  formData: FormData,
): Promise<AcceptFormState> => {
  ensureDatabase();
  const token = field(formData, "token");
  const result = await acceptInvitation(token, {
    name: field(formData, "name"),
    password: field(formData, "password"),
  });
  if (!result.ok) {
    return { error: result.message };
  }
  await audit(result.data, "operator.joined", {
    type: "operator",
    id: result.data.id,
    label: result.data.email,
  });
  await setSessionCookie(result.data.id);
  redirect("/patients");
};

export type AccountFormState = { error: string | null; saved: boolean };

export const updateAccountNameAction = async (
  _previous: AccountFormState,
  formData: FormData,
): Promise<AccountFormState> => {
  const operator = await requireOperator();
  ensureDatabase();
  const result = await updateOperatorName(operator.id, field(formData, "name"));
  if (!result.ok) {
    return { error: result.message, saved: false };
  }
  revalidatePath("/account");
  revalidatePath("/team");
  return { error: null, saved: true };
};

export const changePasswordAction = async (
  _previous: AccountFormState,
  formData: FormData,
): Promise<AccountFormState> => {
  const operator = await requireOperator();
  ensureDatabase();
  if (field(formData, "password") !== field(formData, "confirmation")) {
    return {
      error: "les deux mots de passe ne correspondent pas",
      saved: false,
    };
  }
  const result = await changeOperatorPassword(
    operator.id,
    field(formData, "currentPassword"),
    field(formData, "password"),
  );
  if (!result.ok) {
    return { error: result.message, saved: false };
  }
  return { error: null, saved: true };
};
