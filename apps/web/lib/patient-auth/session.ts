import { redirect } from "next/navigation";
import { readPatientAccount, type PatientAccount } from "@remi/services/server";
import { localePath, type Locale } from "@remi/services/shared";
import { ensureAuthProvider } from "@/lib/auth/provider";
import { ensureDatabase } from "@/lib/database";
import { SIGN_IN_PATH } from "./paths";

/**
 * The signed-in patient's account, or `null`. With the auth variables unset,
 * nobody is signed in: the log names the variable.
 */
export const currentPatient = async (): Promise<PatientAccount | null> => {
  ensureDatabase();
  return ensureAuthProvider() ? readPatientAccount() : null;
};

/**
 * The guard of every page behind the patient session. It returns the
 * signed-in patient's own account, or sends the visitor to the sign-in page.
 * A page reads the patient's id from this account, never from its URL.
 */
export const requirePatient = async (
  locale: Locale,
): Promise<PatientAccount> => {
  const account = await currentPatient();
  if (!account) {
    redirect(localePath(locale, SIGN_IN_PATH));
  }
  return account;
};
