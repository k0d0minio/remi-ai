import type { DatabaseClient } from "../db/client";
import { getPatientAccountBySubject } from "../db/services/patient-accounts";
import type { Id } from "../types";
import { getAuthProvider, type AuthIdentity } from "./provider";

/**
 * Who the signed-in person is to REMI. D-28 puts both kinds behind one seam.
 * Only `patient` comes back today: operators still sign in through the admin
 * console's own cookie until their move onto the seam.
 */
export type PrincipalKind = "patient" | "operator";

export type Principal = { kind: PrincipalKind; id: Id };

export type AuthSession = {
  identity: AuthIdentity;
  /**
   * `null` while the identity has no REMI account yet — a magic link that
   * created the user before the sign-up page linked it to a patient file.
   */
  principal: Principal | null;
};

/** The current request's session, or `null` when nobody is signed in. */
export const readSession = async (
  db?: DatabaseClient,
): Promise<AuthSession | null> => {
  const identity = await getAuthProvider().readIdentity();
  if (!identity) {
    return null;
  }
  const account = await getPatientAccountBySubject(identity.subject, db);
  return {
    identity,
    principal: account ? { kind: "patient", id: account.id } : null,
  };
};
