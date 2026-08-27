"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  SESSION_TTL_SECONDS,
  createOperator,
  createSessionToken,
  env,
  hasOperator,
  verifyOperator,
} from "@remi/services/server";
import { SESSION_COOKIE } from "./session";

export type AuthFormState = { error: string | null };

const setSessionCookie = async (operatorId: string) => {
  const store = await cookies();
  store.set(SESSION_COOKIE, createSessionToken(operatorId), {
    httpOnly: true,
    secure: env().NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
};

export const signInAction = async (
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> => {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const result = await verifyOperator(email, password);
  if (!result.ok) {
    return { error: result.message };
  }
  await setSessionCookie(result.data.id);
  redirect("/patients");
};

/**
 * First-run only: creates the single operator account. Twice guarded — it
 * works only while no operator exists, and only for the email named by
 * `OPERATOR_EMAIL` in the deployment's environment. There is no self-serve
 * sign-up behind it and no role to choose; this is how Morgane's account
 * comes to exist without a seed script or a shared password.
 */
export const bootstrapAction = async (
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> => {
  if (await hasOperator()) {
    return { error: "the operator account already exists — sign in instead" };
  }
  const allowed = env().OPERATOR_EMAIL;
  if (!allowed) {
    return {
      error:
        "OPERATOR_EMAIL is not set on this deployment, so account creation is disabled",
    };
  }
  const email = String(formData.get("email") ?? "");
  if (email.trim().toLowerCase() !== allowed.trim().toLowerCase()) {
    return {
      error: "that email is not allowed to create the operator account",
    };
  }
  const result = await createOperator({
    email,
    name: String(formData.get("name") ?? ""),
    password: String(formData.get("password") ?? ""),
  });
  if (!result.ok) {
    return { error: result.message };
  }
  await setSessionCookie(result.data.id);
  redirect("/patients");
};

export const signOutAction = async () => {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/sign-in");
};
