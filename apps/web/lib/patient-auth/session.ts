import { redirect } from "next/navigation";
import {
  careConsentInForce,
  getPatient,
  patientActor,
  patientLandingFor,
  readPatientAccount,
  type PatientAccount,
} from "@remi/services/server";
import {
  localePath,
  type Locale,
  type PatientLanding,
} from "@remi/services/shared";
import { ensureAuthProvider } from "@/lib/auth/provider";
import { ensureDatabase } from "@/lib/database";
import { CARE_CONSENT_PATH, landingPaths, SIGN_IN_PATH } from "./paths";

/**
 * The signed-in patient's account, or `null`. With the auth variables unset,
 * nobody is signed in: the log names the variable.
 *
 * `null` means that the auth server answered "nobody is signed in". When the
 * read itself failed, this throws `SessionReadError` (the auth seam). A page
 * then shows the error page of its segment, with « Réessayer », and the
 * patient keeps their session. The patient is not sent to the sign-in page,
 * and no page or action runs without a session that was read.
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

/**
 * Where this patient stands now: the questionnaire, the waiting screen or the
 * home (`patientLandingFor`, the one rule). It reads the file status at each
 * call, as the patient, so an activation shows at the next request with no
 * sign-out. A file that cannot be read lands on the questionnaire.
 */
export const patientLanding = async (
  account: PatientAccount,
): Promise<PatientLanding> => {
  const patientId = account.patientProfileId;
  const patient = await getPatient(patientActor(patientId), patientId);
  return patient.ok ? patientLandingFor(patient.data) : "questionnaire";
};

/**
 * True when the care consent of this patient is in force now (REM-43). It
 * reads the table at each call, as the patient, so a withdrawal applies at the
 * next request.
 */
export const careConsentHeld = async (
  account: PatientAccount,
): Promise<boolean> => {
  const patientId = account.patientProfileId;
  return careConsentInForce(patientActor(patientId), patientId);
};

/**
 * The guard of the patient space (stories 19 and 22): `requirePatient`, then
 * the activation, then the care consent (REM-43). A patient whose care is not
 * active goes to their own page, the questionnaire or the waiting screen. A
 * patient whose care consent is not in force goes to the consent screen,
 * which says what stops and how to give the consent again. The layout of the
 * space calls it, and so does each page of the space, because a page renders
 * alongside its layout.
 */
export const requireActivePatient = async (
  locale: Locale,
): Promise<PatientAccount> => {
  const account = await requirePatient(locale);
  const landing = await patientLanding(account);
  if (landing !== "home") {
    redirect(localePath(locale, landingPaths[landing]));
  }
  if (!(await careConsentHeld(account))) {
    redirect(localePath(locale, CARE_CONSENT_PATH));
  }
  return account;
};
