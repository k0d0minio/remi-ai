import { randomInt } from "node:crypto";
import { z } from "zod";
import { checkSignupConsents } from "../consent";
import { getDatabase } from "../db/client";
import type { PatientProfile } from "../db/models/patient-profile";
import { recordAuditEvent, type AuditRecord } from "../db/services/audit";
import { getPractitionerBySignupToken } from "../db/services/operators";
import {
  createPatientAccount,
  getPatientAccountByEmail,
  getPatientAccountByProfile,
  getPatientAccountBySubject,
} from "../db/services/patient-accounts";
import { insertConsent } from "../db/services/patient-consents";
import { createPatient, findPatientByEmail } from "../db/services/patients";
import type { ShownConsent } from "../shared/consent";
import type { Locale } from "../shared/i18n";
import { err, ok, type Result, type ServiceErrorCode } from "../shared/result";
import {
  minPasswordLength,
  signupFields,
  type SignupField,
  type SignupFieldError,
  type SignupFieldErrors,
} from "../shared/signup";
import type { Id } from "../types";
import { getAuthProvider, type AuthIdentity, type AuthResult } from "./provider";

/**
 * A patient creates their own account from their practitioner's permanent
 * link (story 2). The link names the practitioner. The form names the patient.
 *
 * The order is fixed by who owns what. The identity store creates the user
 * first, because the account row needs its subject. Then one transaction
 * writes the patient file, the account and the consent rows. A failure there
 * leaves a user with no file. The next submit with the same e-mail and
 * password signs that user in and writes the missing rows, so the patient
 * never meets a dead end.
 */

/** A message is a `SignupFieldError` code, read back by `validateSignup`. */
const required = (max: number) =>
  z.string().trim().min(1, "required").max(max, "invalid");

const isoDate = /^\d{4}-\d{2}-\d{2}$/;

/** A real calendar day, after 1900 and before today. */
const isPastDay = (value: string) => {
  const day = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(day.getTime())) {
    return false;
  }
  // `2026-02-31` parses to 3 March: the round trip refuses it.
  if (day.toISOString().slice(0, 10) !== value) {
    return false;
  }
  const today = new Date().toISOString().slice(0, 10);
  return value >= "1900-01-01" && value < today;
};

/** Digits and spaces, one leading `+`, 8 to 15 digits (default of Morgane's question 3). */
const phoneShape = /^\+?[\d ]+$/;

const signupSchema = z.object({
  lastName: required(100),
  firstName: required(100),
  birthDate: z
    .string()
    .trim()
    .min(1, "required")
    .regex(isoDate, "invalid")
    .refine(isPastDay, "invalid"),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "required")
    .pipe(z.email("invalid")),
  phone: z
    .string()
    .trim()
    .min(1, "required")
    .regex(phoneShape, "invalid")
    .transform((value) => value.replace(/ /g, ""))
    .refine((value) => {
      const digits = value.replace("+", "").length;
      return digits >= 8 && digits <= 15;
    }, "invalid"),
  // Never trimmed: a space is a character of the password.
  password: z
    .string()
    .min(1, "required")
    .min(minPasswordLength, "too_short")
    .max(128, "invalid"),
});

export type SignupData = z.output<typeof signupSchema>;

export type SignupValidation =
  | { ok: true; data: SignupData }
  | { ok: false; fields: SignupFieldErrors };

const isFieldError = (code: string): code is SignupFieldError =>
  code === "required" || code === "invalid" || code === "too_short";

/**
 * Checks the six fields. Each refused field gets one code: the first rule it
 * broke, so an empty field reads « required », not « invalid ».
 */
export const validateSignup = (
  input: Partial<Record<SignupField, unknown>>,
): SignupValidation => {
  const values = Object.fromEntries(
    signupFields.map((name) => [
      name,
      typeof input[name] === "string" ? input[name] : "",
    ]),
  );
  const parsed = signupSchema.safeParse(values);
  if (parsed.success) {
    return { ok: true, data: parsed.data };
  }
  const fields: SignupFieldErrors = {};
  for (const issue of parsed.error.issues) {
    const name = issue.path[0] as SignupField;
    if (!fields[name]) {
      fields[name] = isFieldError(issue.message) ? issue.message : "invalid";
    }
  }
  return { ok: false, fields };
};

/** No 0, O, 1 or I: the practitioner reads the code aloud. */
const codeAlphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/**
 * The working name an AI provider may later see. Neutral on purpose: the
 * practitioner renames the file in the console (question 3, the default).
 */
const newPseudonym = () =>
  `Patient ${Array.from({ length: 4 }, () => codeAlphabet[randomInt(codeAlphabet.length)]).join("")}`;

const alreadyRegistered = () =>
  err("conflict", "this e-mail already has an account");

/**
 * The identity store's user for this e-mail. A `conflict` on sign-up means the
 * user exists: the password then decides. It signs in a user with no REMI
 * account (a retry after a failed write). Anything else is « already
 * registered ».
 */
const identityFor = async (
  data: SignupData,
  callbackPath: string,
): Promise<AuthResult<AuthIdentity>> => {
  const auth = getAuthProvider();
  const created = await auth.signUp({
    email: data.email,
    password: data.password,
    name: `${data.firstName} ${data.lastName}`,
    callbackPath,
  });
  if (created.ok || created.error !== "conflict") {
    return created;
  }
  const signedIn = await auth.signIn({
    email: data.email,
    password: data.password,
  });
  if (!signedIn.ok || (await getPatientAccountBySubject(signedIn.data.subject))) {
    return alreadyRegistered();
  }
  return signedIn;
};

class RollbackSignal extends Error {
  constructor(readonly failure: Result<never>) {
    super("sign-up rolled back");
    this.name = "RollbackSignal";
  }
}

const orRollback = <T>(result: Result<T>): T => {
  if (!result.ok) {
    throw new RollbackSignal(result);
  }
  return result.data;
};

/** The sign-up's refusals: the service codes, and the file to take over. */
export type SignupError = ServiceErrorCode | "file_exists";

export type PatientSignupInput = {
  /** The practitioner's permanent link token, from the route. */
  token: string;
  locale: Locale;
  data: SignupData;
  /** Where the e-mail verification link returns to, as a path of this app. */
  callbackPath: string;
  /**
   * The consent texts the patient ticked, as the page showed them (story 3).
   * Every mandatory key must be there, at its current version.
   */
  consents: readonly ShownConsent[];
};

/**
 * Creates the patient's file and account under the link's practitioner, signs
 * the patient in, and writes one `patient.signed_up` event. Then one
 * `patient_consents` row and one `consent.given` event per mandatory consent.
 *
 * - `invalid_input`: a mandatory consent is missing, or names a text that is
 *   not current. The page checks this first. Nothing is written, not even the
 *   identity store's user.
 * - `not_found`: the token names no practitioner. Nothing is written.
 * - `conflict`: the e-mail already has an account. Nothing is written.
 * - `file_exists`: a file of this practitioner holds the e-mail and has no
 *   account (`patient-takes-over-file`). Nothing is written. The page offers
 *   the claim e-mail, so the patient takes that file over.
 * - `rate_limited`, `upstream_failed`: the identity store refused. Nothing is written.
 */
export const signUpPatient = async ({
  token,
  locale,
  data,
  callbackPath,
  consents,
}: PatientSignupInput): Promise<Result<{ patientId: Id }, SignupError>> => {
  // No account without the mandatory consents (story 3, criterion 2).
  const consentCheck = checkSignupConsents(consents);
  if (!consentCheck.ok) {
    return err(
      "invalid_input",
      "the mandatory consents are missing or not current",
    );
  }
  const practitioner = await getPractitionerBySignupToken(token);
  if (!practitioner.ok) {
    return practitioner;
  }
  if (await getPatientAccountByEmail(data.email)) {
    return alreadyRegistered();
  }
  // A file the practitioner created with this e-mail is taken over, never
  // doubled (story 1). A file of another practitioner never matches.
  const existing = await findPatientByEmail(practitioner.data.id, data.email);
  if (existing) {
    return (await getPatientAccountByProfile(existing.id))
      ? alreadyRegistered()
      : err(
          "file_exists",
          "a file of this practitioner holds this e-mail and has no account",
        );
  }
  const identity = await identityFor(data, callbackPath);
  if (!identity.ok) {
    return identity;
  }

  let patient: PatientProfile;
  const consentAudits: AuditRecord[] = [];
  try {
    patient = await getDatabase().transaction(async (tx) => {
      const created = orRollback(
        await createPatient(
          {
            practitionerId: practitioner.data.id,
            // The list hides this file until the questionnaire is complete.
            createdBy: "patient",
            pseudonym: newPseudonym(),
            fullName: `${data.firstName} ${data.lastName}`,
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            email: data.email,
            birthDate: data.birthDate,
            locale,
          },
          tx,
        ),
      );
      orRollback(
        await createPatientAccount(
          {
            patientProfileId: created.id,
            email: data.email,
            authSubject: identity.data.subject,
          },
          tx,
        ),
      );
      for (const shown of consentCheck.consents) {
        const written = orRollback(
          await insertConsent(
            {
              patientId: created.id,
              ...shown,
              decision: "given",
              actor: {
                kind: "patient",
                id: created.id,
                name: created.pseudonym,
              },
            },
            tx,
          ),
        );
        consentAudits.push(...written.audits);
      }
      return created;
    });
  } catch (cause) {
    if (cause instanceof RollbackSignal) {
      return cause.failure;
    }
    throw cause;
  }

  await recordAuditEvent({
    actor: { kind: "patient", id: patient.id, name: patient.pseudonym },
    action: "patient.signed_up",
    targetType: "patient",
    targetId: patient.id,
    targetLabel: patient.pseudonym,
  });
  // After the commit: an event never names a row that rolled back.
  for (const audit of consentAudits) {
    await recordAuditEvent(audit);
  }
  return ok({ patientId: patient.id });
};
