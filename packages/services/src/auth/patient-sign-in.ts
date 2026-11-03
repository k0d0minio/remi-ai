import { z } from "zod";
import type { DatabaseClient } from "../db/client";
import type { PatientAccount } from "../db/models/patient-account";
import { recordAuditEvent, type AuditActor } from "../db/services/audit";
import {
  getPatientAccountByEmail,
  getPatientAccountBySubject,
} from "../db/services/patient-accounts";
import { getPatient } from "../db/services/patients";
import { err, ok, type Result } from "../shared/result";
import { minPasswordLength, type PatientLanding } from "../shared/signup";
import { getAuthProvider, type AuthIdentity } from "./provider";

/**
 * A patient comes back to the account they created at sign-up (story 2, D-26).
 * One account serves the preparation and, after activation, the care. So the
 * sign-in only decides where the patient lands: the questionnaire before
 * activation, the home after it.
 *
 * Every refusal a visitor can provoke reads the same, whatever the cause: an
 * unknown e-mail and a wrong password are one `not_permitted`. The page must
 * not tell which e-mails hold an account.
 */

export const patientLandingFor = (
  account: Pick<PatientAccount, "activatedAt">,
): PatientLanding => {
  if (account.activatedAt) {
    return "home";
  }
  return "questionnaire";
};

/** How the patient proved who they are. The audit row's detail keeps it. */
export type SignInMethod = "password" | "magic_link" | "password_reset";

export type PatientSignedIn = {
  account: PatientAccount;
  landing: PatientLanding;
};

/** The codes a sign-in page renders. Anything else is `upstream_failed`. */
const visitorError = (error: string) =>
  error === "rate_limited" ? "rate_limited" : "upstream_failed";

/**
 * The actor of a patient's own action: the file's id and its pseudonym, as on
 * every other patient row of the trail. A file that cannot be read still gets
 * its id, so the row is never lost.
 */
const patientActor = async (
  account: PatientAccount,
  db?: DatabaseClient,
): Promise<AuditActor> => {
  const patient = await getPatient(account.patientProfileId, db);
  return {
    kind: "patient",
    id: account.patientProfileId,
    name: patient.ok ? patient.data.pseudonym : "",
  };
};

const recordPatientEvent = async (
  account: PatientAccount,
  action:
    | "patient.signed_in"
    | "patient.password_reset_requested"
    | "patient.password_reset",
  detail: string,
  db?: DatabaseClient,
) => {
  const actor = await patientActor(account, db);
  await recordAuditEvent({
    actor,
    action,
    targetType: "patient",
    targetId: account.patientProfileId,
    targetLabel: actor.name,
    detail,
  });
};

/**
 * The step after the identity store accepted the patient, by any method. The
 * identity must have a REMI account: a user with no patient file is refused
 * with `not_found`, and the caller signs it out. Writes one
 * `patient.signed_in` event, with the method as its detail.
 */
export const completePatientSignIn = async (
  identity: AuthIdentity,
  method: SignInMethod,
  db?: DatabaseClient,
): Promise<Result<PatientSignedIn>> => {
  const account = await getPatientAccountBySubject(identity.subject, db);
  if (!account) {
    return err("not_found", "this identity has no patient account");
  }
  await recordPatientEvent(account, "patient.signed_in", method, db);
  return ok({ account, landing: patientLandingFor(account) });
};

const emailSchema = z.string().trim().toLowerCase().pipe(z.email());

const credentialsSchema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(128),
});

/**
 * Signs a patient in with an e-mail and a password.
 *
 * - `not_permitted`: the e-mail, the password, or both are wrong. One code, so
 *   one message.
 * - `not_found`: the identity store knows the user, but no patient file holds
 *   it. The session is closed again.
 * - `rate_limited`, `upstream_failed`: the identity store refused.
 */
export const signInPatient = async (
  input: { email: unknown; password: unknown },
  db?: DatabaseClient,
): Promise<Result<PatientSignedIn>> => {
  const parsed = credentialsSchema.safeParse(input);
  if (!parsed.success) {
    return err("not_permitted", "wrong e-mail or password");
  }
  const auth = getAuthProvider();
  const signedIn = await auth.signIn(parsed.data);
  if (!signedIn.ok) {
    if (
      signedIn.error === "not_permitted" ||
      signedIn.error === "invalid_input"
    ) {
      return err("not_permitted", "wrong e-mail or password");
    }
    return err(visitorError(signedIn.error), signedIn.message);
  }
  const completed = await completePatientSignIn(signedIn.data, "password", db);
  if (!completed.ok) {
    await auth.signOut();
  }
  return completed;
};

/**
 * Asks the identity store to send a reset link. The answer is the same for an
 * e-mail with or without an account: only `rate_limited` and
 * `upstream_failed` come back. A request for an account writes one
 * `patient.password_reset_requested` event.
 */
export const requestPatientPasswordReset = async (
  input: { email: unknown; redirectPath: string },
  db?: DatabaseClient,
): Promise<Result<null>> => {
  const email = emailSchema.safeParse(input.email);
  if (!email.success) {
    return ok(null);
  }
  // The link goes out for every well-formed e-mail. The identity store sends
  // nothing for an unknown one, and the page cannot tell the two apart.
  const requested = await getAuthProvider().requestPasswordReset({
    email: email.data,
    redirectPath: input.redirectPath,
  });
  if (!requested.ok) {
    if (
      requested.error === "rate_limited" ||
      requested.error === "upstream_failed"
    ) {
      return err(requested.error, requested.message);
    }
    return ok(null);
  }
  const account = await getPatientAccountByEmail(email.data, db);
  if (account) {
    await recordPatientEvent(
      account,
      "patient.password_reset_requested",
      "",
      db,
    );
  }
  return ok(null);
};

/**
 * Sends a sign-in link to a patient's e-mail (Jamie, 2026-11-01). The answer
 * is the same for an e-mail with or without an account: only `rate_limited`
 * and `upstream_failed` come back.
 *
 * The link goes out only for an e-mail that holds a patient account. A link
 * for any other e-mail would create a user in the identity store with no
 * patient file and no password. That user would then block the sign-up with
 * the same e-mail.
 */
export const requestPatientMagicLink = async (
  input: { email: unknown; callbackPath: string },
  db?: DatabaseClient,
): Promise<Result<null>> => {
  const email = emailSchema.safeParse(input.email);
  if (!email.success) {
    return ok(null);
  }
  const account = await getPatientAccountByEmail(email.data, db);
  if (!account) {
    return ok(null);
  }
  const requested = await getAuthProvider().requestMagicLink({
    email: email.data,
    callbackPath: input.callbackPath,
  });
  if (
    !requested.ok &&
    (requested.error === "rate_limited" ||
      requested.error === "upstream_failed")
  ) {
    return err(requested.error, requested.message);
  }
  return ok(null);
};

/** A sign-in that reports nothing to the visitor: the account, or `null`. */
const signInPatientQuietly = async (
  email: unknown,
  password: string,
  db?: DatabaseClient,
): Promise<{ identity: AuthIdentity; account: PatientAccount } | null> => {
  const parsed = credentialsSchema.safeParse({ email, password });
  if (!parsed.success) {
    return null;
  }
  const auth = getAuthProvider();
  const signedIn = await auth.signIn(parsed.data);
  if (!signedIn.ok) {
    return null;
  }
  const account = await getPatientAccountBySubject(signedIn.data.subject, db);
  if (!account) {
    await auth.signOut();
    return null;
  }
  return { identity: signedIn.data, account };
};

/** The refusals of the new-password form. */
export type PasswordResetError =
  /** The new password is shorter than the minimum. */
  | "too_short"
  /** The new password is longer than 128 characters. */
  | "too_long"
  /** The link expired, was used already, or never existed. */
  | "invalid_link"
  | "rate_limited"
  | "upstream_failed";

export type PasswordResetDone =
  /** The new password is set and the patient is signed in. */
  | { signedIn: true; landing: PatientLanding }
  /** The new password is set. The e-mail typed did not sign the patient in. */
  | { signedIn: false };

/**
 * Sets a new password from the e-mail's link, then signs the patient in with
 * the e-mail they typed and that new password. The identity store makes the
 * link work once and expire.
 *
 * The sign-in names the patient, so the `patient.password_reset` event can
 * name them too. The link carries no e-mail. When the typed e-mail does not
 * sign in, the password is still changed: the event then names no patient,
 * and the patient signs in by hand.
 */
export const resetPatientPassword = async (
  input: { token: string; email: unknown; newPassword: string },
  db?: DatabaseClient,
): Promise<Result<PasswordResetDone, PasswordResetError>> => {
  if (input.newPassword.length < minPasswordLength) {
    return err("too_short", "the new password is too short");
  }
  if (input.newPassword.length > 128) {
    return err("too_long", "the new password is too long");
  }
  if (!input.token) {
    return err("invalid_link", "the link carries no token");
  }
  const auth = getAuthProvider();
  const reset = await auth.resetPassword({
    token: input.token,
    newPassword: input.newPassword,
  });
  if (!reset.ok) {
    if (reset.error === "rate_limited" || reset.error === "upstream_failed") {
      return err(reset.error, reset.message);
    }
    return err("invalid_link", reset.message);
  }

  const signedIn = await signInPatientQuietly(
    input.email,
    input.newPassword,
    db,
  );
  if (!signedIn) {
    await recordAuditEvent({
      actor: null,
      action: "patient.password_reset",
      targetType: "patient",
      detail: "patient not identified",
    });
    return ok<PasswordResetDone>({ signedIn: false });
  }
  await recordPatientEvent(signedIn.account, "patient.password_reset", "", db);
  const completed = await completePatientSignIn(
    signedIn.identity,
    "password_reset",
    db,
  );
  if (!completed.ok) {
    return ok<PasswordResetDone>({ signedIn: false });
  }
  return ok<PasswordResetDone>({
    signedIn: true,
    landing: completed.data.landing,
  });
};
