import { checkSignupConsents } from "../consent";
import { getDatabase } from "../db/client";
import type { PatientFileClaim } from "../db/models/patient-file-claim";
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
import {
  issueFileClaim,
  markFileClaimUsed,
  resolveFileClaim,
} from "../db/services/patient-file-claims";
import { findPatientByEmail, getPatient } from "../db/services/patients";
import { fileClaimEmail } from "../email/templates/file-claim";
import { sendEmail } from "../email";
import type { ShownConsent } from "../shared/consent";
import type { FileClaimPurpose } from "../shared/file-claim";
import { isLocale, type Locale } from "../shared/i18n";
import { err, ok, type Result } from "../shared/result";
import { minPasswordLength } from "../shared/signup";
import type { Id } from "../types";
import { getAuthProvider, type AuthIdentity } from "./provider";

/**
 * A patient takes over the file their practitioner created
 * (`patient-takes-over-file`, story 1). Two paths reach the same page:
 *
 * 1. `activation`: the link in « Votre espace REMI est prêt ». The admin app
 *    asks `issueActivationLink` for it (`care-activation/activation-email`).
 * 2. `claim`: a sign-up finds the e-mail on a file with no account. The
 *    patient asks for the link, and `requestFileClaim` sends it.
 *
 * On both paths the patient gives the mandatory consents first, then sets a
 * password. The account attaches to the existing `patient_profiles` row. No
 * field of the profile changes: the practitioner's entries stay.
 */

/**
 * Why a takeover cannot go on. Each one reads differently on the page.
 *
 * - `not_found`: no link has this token. The page is a 404.
 * - `spent`: the link served once, or expired. The patient signs in or asks again.
 * - `has_account`: the file or its e-mail holds an account. The patient signs in.
 * - `invalid_input`: a mandatory consent is missing or stale, or the password
 *   does not fit the rules. Nothing is written.
 * - `rate_limited`, `upstream_failed`: the identity store or the mailer refused.
 */
export type TakeoverError =
  | "not_found"
  | "spent"
  | "has_account"
  | "invalid_input"
  | "rate_limited"
  | "upstream_failed";

/** Where a link leads: the file's language and how to greet the patient. */
export type TakeoverTarget = {
  patientId: Id;
  purpose: FileClaimPurpose;
  locale: Locale;
  firstName: string;
};

/** Builds the link's URL from its token and the file's language. The app owns the origin. */
export type TakeoverLinkFor = (token: string, locale: Locale) => string;

const fileLocale = (patient: PatientProfile): Locale =>
  isLocale(patient.locale) ? patient.locale : "fr";

const firstNameOf = (patient: PatientProfile) =>
  patient.firstName?.trim() || "";

/** The link and its file, or the reason the page shows instead. */
const openTarget = async (
  token: string,
  db = getDatabase(),
): Promise<
  Result<{ claim: PatientFileClaim; patient: PatientProfile }, TakeoverError>
> => {
  const claim = await resolveFileClaim(token, {}, db);
  if (!claim.ok) {
    return claim.error === "not_found"
      ? err("not_found", claim.message)
      : err("spent", claim.message);
  }
  const patient = await getPatient(claim.data.patientProfileId, db);
  if (!patient.ok) {
    return err("not_found", "the file of this link is gone");
  }
  const email = patient.data.email ?? "";
  if (
    (await getPatientAccountByProfile(patient.data.id, db)) ||
    (await getPatientAccountByEmail(email, db))
  ) {
    return err("has_account", "this file or its e-mail already has an account");
  }
  return ok({ claim: claim.data, patient: patient.data });
};

/** What the takeover page shows before any input. It writes nothing. */
export const checkFileTakeover = async (
  token: string,
): Promise<Result<TakeoverTarget, TakeoverError>> => {
  const target = await openTarget(token);
  if (!target.ok) {
    return target;
  }
  const { claim, patient } = target.data;
  return ok({
    patientId: patient.id,
    purpose: claim.purpose,
    locale: fileLocale(patient),
    firstName: firstNameOf(patient),
  });
};

const passwordFits = (password: string) =>
  password.length >= minPasswordLength && password.length <= 128;

/**
 * The identity store's user for the file's e-mail. A `conflict` means the user
 * exists: the password then decides, as on the sign-up. It signs in a user
 * with no REMI account (a retry after a failed write). Anything else is
 * « already has an account ».
 */
const identityFor = async (
  email: string,
  password: string,
  name: string,
  callbackPath: string,
): Promise<Result<AuthIdentity, TakeoverError>> => {
  const auth = getAuthProvider();
  const created = await auth.signUp({ email, password, name, callbackPath });
  if (created.ok) {
    return created;
  }
  if (created.error === "rate_limited") {
    return err("rate_limited", created.message);
  }
  if (created.error !== "conflict") {
    return err("upstream_failed", created.message);
  }
  const signedIn = await auth.signIn({ email, password });
  if (!signedIn.ok || (await getPatientAccountBySubject(signedIn.data.subject))) {
    return err("has_account", "this e-mail already has an account");
  }
  return signedIn;
};

class RollbackSignal extends Error {
  constructor(readonly failure: Result<never, TakeoverError>) {
    super("takeover rolled back");
    this.name = "RollbackSignal";
  }
}

export type TakeoverInput = {
  /** The one-time token, from the route. */
  token: string;
  password: string;
  /** The consent texts the patient ticked, as the page showed them (story 3). */
  consents: readonly ShownConsent[];
  /** Where the e-mail verification link returns to, as a path of this app. */
  callbackPath: string;
};

/**
 * Attaches a new account to the link's file and signs the patient in. One
 * transaction writes the account, one consent row per mandatory consent and
 * the link's `used_at`. After the commit: one `patient.file_taken_over` event,
 * with the link's purpose as its detail, and one `consent.given` per consent.
 *
 * The consents come first. With one missing, nothing is written, not even the
 * identity store's user (story 3, criterion 2).
 */
export const takeOverPatientFile = async ({
  token,
  password,
  consents,
  callbackPath,
}: TakeoverInput): Promise<Result<{ patientId: Id }, TakeoverError>> => {
  const consentCheck = checkSignupConsents(consents);
  if (!consentCheck.ok) {
    return err(
      "invalid_input",
      "the mandatory consents are missing or not current",
    );
  }
  if (!passwordFits(password)) {
    return err("invalid_input", "the password does not fit the rules");
  }
  const target = await openTarget(token);
  if (!target.ok) {
    return target;
  }
  const { claim, patient } = target.data;
  // One spelling per address, as `patient_accounts` stores it.
  const email = (patient.email ?? "").trim().toLowerCase();
  const name = patient.fullName?.trim() || patient.pseudonym;

  const identity = await identityFor(email, password, name, callbackPath);
  if (!identity.ok) {
    return identity;
  }

  const consentAudits: AuditRecord[] = [];
  try {
    await getDatabase().transaction(async (tx) => {
      // Again inside the transaction: two tabs on one link make one account.
      const still = await resolveFileClaim(token, {}, tx);
      if (!still.ok) {
        throw new RollbackSignal(err("spent", still.message));
      }
      const account = await createPatientAccount(
        { patientProfileId: patient.id, email, authSubject: identity.data.subject },
        tx,
      );
      if (!account.ok) {
        throw new RollbackSignal(
          account.error === "conflict"
            ? err("has_account", account.message)
            : err("upstream_failed", account.message),
        );
      }
      for (const shown of consentCheck.consents) {
        const written = await insertConsent(
          {
            patientId: patient.id,
            ...shown,
            decision: "given",
            actor: { kind: "patient", id: patient.id, name: patient.pseudonym },
          },
          tx,
        );
        if (!written.ok) {
          throw new RollbackSignal(err("upstream_failed", written.message));
        }
        consentAudits.push(...written.data.audits);
      }
      const used = await markFileClaimUsed(claim.id, tx);
      if (!used.ok) {
        throw new RollbackSignal(err("upstream_failed", used.message));
      }
    });
  } catch (cause) {
    if (cause instanceof RollbackSignal) {
      return cause.failure;
    }
    throw cause;
  }

  await recordAuditEvent({
    actor: { kind: "patient", id: patient.id, name: patient.pseudonym },
    action: "patient.file_taken_over",
    targetType: "patient",
    targetId: patient.id,
    targetLabel: patient.pseudonym,
    detail: claim.purpose,
  });
  // After the commit: an event never names a row that rolled back.
  for (const audit of consentAudits) {
    await recordAuditEvent(audit);
  }
  return ok({ patientId: patient.id });
};

/**
 * The activation link of a practitioner-created file, for « Votre espace
 * REMI est prêt » (`care-activation/activation-email`). It voids the file's
 * earlier open link. It sends nothing and writes no event: the e-mail's send
 * writes its own.
 */
export const issueActivationLink = async (
  patientId: Id,
  linkFor: TakeoverLinkFor,
): Promise<Result<{ url: string; expiresAt: Date }>> => {
  const patient = await getPatient(patientId);
  if (!patient.ok) {
    return patient;
  }
  const issued = await issueFileClaim(patientId, "activation");
  if (!issued.ok) {
    return issued;
  }
  return ok({
    url: linkFor(issued.data.token, fileLocale(patient.data)),
    expiresAt: issued.data.claim.expiresAt,
  });
};

export type FileClaimRequest = {
  /** The practitioner's permanent sign-up token, from the sign-up form. */
  practitionerToken: string;
  email: string;
  linkFor: TakeoverLinkFor;
};

/**
 * Path 2: sends the one-time claim link to the e-mail of a file of the link's
 * practitioner that has no account. Another practitioner's file never matches
 * (question 4). The answer is the same `ok` when no such file exists: a
 * forged request learns nothing more than the sign-up already said.
 *
 * - `not_found`: the token names no practitioner.
 * - `rate_limited`: a claim link went to this file less than five minutes ago.
 * - `upstream_failed`: the mailer refused. The link is issued, and a new
 *   request after five minutes replaces it.
 */
export const requestFileClaim = async ({
  practitionerToken,
  email,
  linkFor,
}: FileClaimRequest): Promise<
  Result<null, "not_found" | "rate_limited" | "upstream_failed">
> => {
  const practitioner = await getPractitionerBySignupToken(practitionerToken);
  if (!practitioner.ok) {
    return err("not_found", practitioner.message);
  }
  const patient = await findPatientByEmail(practitioner.data.id, email);
  if (!patient?.email || (await getPatientAccountByProfile(patient.id))) {
    return ok(null);
  }
  const issued = await issueFileClaim(patient.id, "claim");
  if (!issued.ok) {
    return issued.error === "rate_limited"
      ? err("rate_limited", issued.message)
      : ok(null);
  }
  const locale = fileLocale(patient);
  const message = fileClaimEmail({
    name: firstNameOf(patient),
    url: linkFor(issued.data.token, locale),
    expiresAt: issued.data.claim.expiresAt,
    locale,
  });
  try {
    await sendEmail({ ...message, to: patient.email });
  } catch (cause) {
    console.error("[takeover] the claim e-mail failed", {
      patientId: patient.id,
      cause: cause instanceof Error ? cause.message : String(cause),
    });
    return err("upstream_failed", "the claim e-mail did not go out");
  }
  await recordAuditEvent({
    actor: { kind: "system", id: null, name: "sign-up link" },
    action: "patient.file_claim_sent",
    targetType: "patient",
    targetId: patient.id,
    targetLabel: patient.pseudonym,
  });
  return ok(null);
};
