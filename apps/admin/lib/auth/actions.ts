"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  createOperator,
  env,
  hasOperator,
  verifyOperator,
} from "@remi/services/server";
import { audit } from "@/lib/audit";
import { ensureDatabase } from "@/lib/database";
import { setSessionCookie } from "./cookie";
import { SESSION_COOKIE } from "./session";

export type AuthFormState = { error: string | null };

export const signInAction = async (
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> => {
  ensureDatabase();
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const result = await verifyOperator(email, password);
  if (!result.ok) {
    return { error: result.message };
  }
  await audit(result.data, "operator.signed_in");
  await setSessionCookie(result.data.id);
  redirect("/patients");
};

/**
 * First-run only: creates the console's first account. Twice guarded — it works
 * only while no operator exists, and only for the email named by
 * `OPERATOR_EMAIL` in the deployment's environment. There is no self-serve
 * sign-up behind it.
 *
 * It mints an **owner**, and it is the only path that does so without an
 * existing owner's say-so. That is the point: a deployment with no accounts has
 * nobody who could invite the first one, so this is the way in — and once one
 * account exists it stops working, which is what keeps it from being a second
 * door.
 */
export const bootstrapAction = async (
  _previous: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> => {
  ensureDatabase();
  if (await hasOperator()) {
    return { error: "un compte existe déjà — connectez-vous plutôt" };
  }
  const allowed = env().OPERATOR_EMAIL;
  if (!allowed) {
    return {
      error:
        "OPERATOR_EMAIL n'est pas défini sur ce déploiement : la création de compte est désactivée",
    };
  }
  const email = String(formData.get("email") ?? "");
  if (email.trim().toLowerCase() !== allowed.trim().toLowerCase()) {
    return {
      error: "cette adresse n'est pas autorisée à créer le premier compte",
    };
  }
  const result = await createOperator({
    email,
    name: String(formData.get("name") ?? ""),
    password: String(formData.get("password") ?? ""),
    role: "owner",
  });
  if (!result.ok) {
    return { error: result.message };
  }
  await audit(result.data, "operator.joined", {
    type: "operator",
    id: result.data.id,
    label: result.data.email,
    detail: "premier compte du déploiement",
  });
  await setSessionCookie(result.data.id);
  redirect("/patients");
};

export const signOutAction = async () => {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
  redirect("/sign-in");
};
