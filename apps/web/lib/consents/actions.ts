"use server";

import {
  consentsOf,
  currentConsentText,
  getPatient,
  isSessionReadError,
  patientActor,
  recordConsent,
  withdrawConsent,
  type PatientAccount,
} from "@remi/services/server";
import {
  consentKeys,
  consentSummaries,
  consentTextLocales,
  isLocale,
  type ConsentKey,
} from "@remi/services/shared";
import { currentPatient } from "@/lib/patient-auth/session";
import type { ConsentActionError, ConsentActionResult } from "./state";

/**
 * The patient's consent settings (REM-43). Public endpoints: the key, the
 * version and the locale are caller input, and the patient's id comes from the
 * session, never from the page (D-26). The service writes the row and its
 * audit event (D-32).
 */

const failed = (error: ConsentActionError): ConsentActionResult => ({
  ok: false,
  error,
});

const isConsentKey = (value: unknown): value is ConsentKey =>
  (consentKeys as readonly unknown[]).includes(value);

/**
 * The patient of the session. `null` with no session. `"unavailable"` when the
 * session read failed: the patient keeps their session and tries again.
 */
const sessionPatient = async (): Promise<
  PatientAccount | null | "unavailable"
> => {
  try {
    return await currentPatient();
  } catch (cause) {
    if (isSessionReadError(cause)) {
      return "unavailable";
    }
    throw cause;
  }
};

/** The patient as the audit trail names them: the pseudonym, never the name. */
const auditActorOf = async (patientId: string) => {
  const patient = await getPatient(patientActor(patientId), patientId);
  return patient.ok
    ? { kind: "patient" as const, id: patientId, name: patient.data.pseudonym }
    : null;
};

/**
 * « Retirer mon consentement », after the confirmation. The service writes
 * one row `withdrawn` with the version of the consent in force, and it empties
 * the genotype for `genetic`. The consequence applies at the next read.
 *
 * The action sends no redirect: the page refreshes after the answer, and the
 * guard of the space (`requireActivePatient`) then sends a patient with no
 * care consent to the consent screen.
 */
export const withdrawConsentAction = async (
  locale: unknown,
  key: unknown,
): Promise<ConsentActionResult> => {
  if (typeof locale !== "string" || !isLocale(locale) || !isConsentKey(key)) {
    return failed("unavailable");
  }
  const account = await sessionPatient();
  if (account === "unavailable") {
    return failed("unavailable");
  }
  if (!account) {
    return failed("signed_out");
  }
  const patientId = account.patientProfileId;
  const actor = await auditActorOf(patientId);
  if (!actor) {
    return failed("unavailable");
  }
  const withdrawn = await withdrawConsent(patientActor(patientId), {
    patientId,
    key,
    actor,
  });
  if (!withdrawn.ok) {
    // The code only: no line of this file logs patient data.
    console.error("[consents] no withdrawal", { error: withdrawn.error });
    return failed("unavailable");
  }
  return { ok: true };
};

/**
 * « Donner à nouveau mon consentement ». The page names the text that it
 * showed. The action refuses a text that is not the current one, and a key
 * that the settings do not offer (`consentSummaries`). The service checks the
 * text file and writes the row `given` and its audit event.
 */
export const giveConsentAction = async (
  locale: unknown,
  key: unknown,
  version: unknown,
  textLocale: unknown,
): Promise<ConsentActionResult> => {
  const shownLocale = consentTextLocales.find((known) => known === textLocale);
  if (
    typeof locale !== "string" ||
    !isLocale(locale) ||
    !isConsentKey(key) ||
    typeof version !== "string" ||
    !shownLocale
  ) {
    return failed("unavailable");
  }
  const account = await sessionPatient();
  if (account === "unavailable") {
    return failed("unavailable");
  }
  if (!account) {
    return failed("signed_out");
  }
  const patientId = account.patientProfileId;
  const current = currentConsentText(key, shownLocale);
  if (current.version !== version || current.locale !== shownLocale) {
    return failed("stale");
  }
  const latest = await consentsOf(patientActor(patientId), patientId);
  const summary = consentSummaries(latest).find((entry) => entry.key === key);
  const actor = await auditActorOf(patientId);
  if (!summary?.canGive || !actor) {
    return failed("unavailable");
  }
  const given = await recordConsent(patientActor(patientId), {
    patientId,
    key,
    version,
    locale: shownLocale,
    decision: "given",
    actor,
  });
  if (!given.ok) {
    console.error("[consents] no consent recorded", { error: given.error });
    return failed("unavailable");
  }
  return { ok: true };
};
