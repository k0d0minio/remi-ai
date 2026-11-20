import { z } from "zod";
import {
  issueActivationLink,
  type TakeoverLinkFor,
} from "../../../auth/patient-takeover";
import { isMailerRegistered, sendEmail } from "../../../email";
import {
  activationEmail,
  type ActivationEmailAccess,
} from "../../../email/templates/activation";
import {
  ACTIVATION_EMAIL_FAILED,
  ACTIVATION_EMAIL_SENT,
  activationEmailDecision,
  activationEmailState,
  type ActivationEmailFailure,
  type ActivationEmailState,
  type ActivationEmailTrigger,
} from "../../../shared/activation-email";
import { initialFileStatus } from "../../../shared/file-status";
import { isLocale, type Locale } from "../../../shared/i18n";
import { err, ok, type Result } from "../../../shared/result";
import type { Id } from "../../../types";
import { getDatabase } from "../../client";
import type { AuditEvent } from "../../models/audit-event";
import type { PatientProfile } from "../../models/patient-profile";
import { byPatient, noSuchPatient } from "../access";
import { recordAuditEvent, type OperatorActor } from "../audit";
import { getPatientAccountByProfile } from "../patient-accounts";

/**
 * The send of « Votre espace REMI est prêt » — stories 19, 22 and 1.
 *
 * The e-mail goes out once, after a successful activation. The file has no
 * column for it: the audit trail is the record (Jamie, 2026-11-20). Each try
 * writes one event on the file, `activation_email.sent` or
 * `activation_email.failed`, and `shared/activation-email` reads them to
 * decide.
 *
 * A send that fails changes nothing on the file: the care stays active. The
 * console shows the failure and « Renvoyer l'e-mail ».
 *
 * The take-over link is a credential. `patient_file_claims` holds its hash
 * only. This module never writes the link to a log or to an audit detail.
 *
 * It lives beside `activateCare` and reaches `auth/patient-takeover` for the
 * link, so only `server/index.ts` exports it, not `db/index.ts`.
 */

const uuidSchema = z.uuid();

const eventsOf = async (patientId: Id) => {
  const events = getDatabase().collection<AuditEvent>("audit_events");
  const [sent, failed] = await Promise.all([
    events.findMany(
      { action: ACTIVATION_EMAIL_SENT, targetId: patientId },
      { limit: 500 },
    ),
    events.findMany(
      { action: ACTIVATION_EMAIL_FAILED, targetId: patientId },
      { limit: 500 },
    ),
  ]);
  return [...sent.items, ...failed.items];
};

/**
 * What the console shows about the e-mail of a file, or null for a call that
 * the scope refuses. `hasRecipient` lets the card say that no e-mail can go
 * before the practitioner presses the button.
 */
export type ActivationEmailStatus = {
  state: ActivationEmailState;
  /** The file or its account has an address that an e-mail can go to. */
  hasRecipient: boolean;
};

const unscopedGetActivationEmailStatus = async (
  patientId: Id,
): Promise<ActivationEmailStatus | null> => {
  if (!uuidSchema.safeParse(patientId).success) {
    return null;
  }
  const file = await getDatabase()
    .collection<PatientProfile>("patient_profiles")
    .findById(patientId);
  if (!file) {
    return null;
  }
  const account = await getPatientAccountByProfile(patientId);
  return {
    state: activationEmailState(await eventsOf(patientId)),
    hasRecipient: Boolean(account?.email.trim() || file.email?.trim()),
  };
};

export type ActivationEmailInput = {
  trigger: ActivationEmailTrigger;
  /** Builds the take-over link from its token. The app owns the origin. */
  linkFor: TakeoverLinkFor;
  /** The sign-in page of the patient app, in the file's language. */
  signInUrl: (locale: Locale) => string;
};

/** An e-mail that went out, or the reason that none did. Both are recorded. */
export type ActivationEmailOutcome =
  | { sent: true }
  | { sent: false; reason: ActivationEmailFailure };

/** Why no send runs. Nothing is sent and nothing is written. */
const refusals = {
  not_active: err("conflict", "the care of this file is not active"),
  already_sent: err("conflict", "the activation e-mail already went out"),
  already_tried: err(
    "conflict",
    "a send of the activation e-mail was already tried",
  ),
} as const;

type Target = { url: string; access: ActivationEmailAccess };

/**
 * The link of the e-mail. A patient with an account signs in. A file with no
 * account gets the one-time take-over link. `conflict` from the link means
 * that an account appeared in the meantime: that patient signs in.
 */
const targetOf = async (
  patientId: Id,
  hasAccount: boolean,
  locale: Locale,
  { linkFor, signInUrl }: ActivationEmailInput,
): Promise<Target | null> => {
  const signIn: Target = { url: signInUrl(locale), access: { kind: "sign_in" } };
  if (hasAccount) {
    return signIn;
  }
  const link = await issueActivationLink(patientId, linkFor);
  if (link.ok) {
    return {
      url: link.data.url,
      access: { kind: "takeover", expiresAt: link.data.expiresAt },
    };
  }
  return link.error === "conflict" ? signIn : null;
};

/**
 * Send « Votre espace REMI est prêt », or record why it did not go out.
 *
 * 1. `activationEmailDecision` reads the events of the file. A file that is
 *    not active, or a file with a sent e-mail, is a `conflict`: nothing is
 *    sent and nothing is written. The send of the activation is also a
 *    `conflict` when a try exists already.
 * 2. The address is the address of the account, else the address of the
 *    file. With no address: `no_email`.
 * 3. With no mailer registered: `no_mailer`. No link is made.
 * 4. The link: the sign-in page, or the take-over link. A link that cannot
 *    be made: `link_failed`.
 * 5. A message that the mailer refuses: `send_failed`.
 *
 * Each outcome of steps 2 to 5 is `ok` and writes one audit event with the
 * practitioner and the file (D-32). The detail of a sent e-mail is the kind
 * of link, `sign_in` or `takeover`. The detail of a failed send is its
 * reason. No detail holds an address or a link.
 *
 * Two resends at the same instant can both go out: there is no lock.
 */
const unscopedSendActivationEmail = async (
  patientId: Id,
  actor: OperatorActor,
  input: ActivationEmailInput,
): Promise<Result<ActivationEmailOutcome>> => {
  if (!uuidSchema.safeParse(patientId).success) {
    return noSuchPatient();
  }
  const file = await getDatabase()
    .collection<PatientProfile>("patient_profiles")
    .findById(patientId);
  if (!file) {
    return noSuchPatient();
  }
  const decision = activationEmailDecision({
    active: (file.fileStatus ?? initialFileStatus) === "active",
    state: activationEmailState(await eventsOf(patientId)),
    trigger: input.trigger,
  });
  if (!decision.send) {
    return refusals[decision.why];
  }

  const failed = async (
    reason: ActivationEmailFailure,
  ): Promise<Result<ActivationEmailOutcome>> => {
    await recordAuditEvent({
      actor,
      action: ACTIVATION_EMAIL_FAILED,
      targetType: "patient",
      targetId: patientId,
      targetLabel: file.pseudonym,
      detail: reason,
    });
    return ok({ sent: false, reason });
  };

  const account = await getPatientAccountByProfile(patientId);
  const to = account?.email.trim() || file.email?.trim() || "";
  if (!to) {
    return failed("no_email");
  }
  if (!isMailerRegistered()) {
    return failed("no_mailer");
  }
  const locale: Locale = isLocale(file.locale) ? file.locale : "fr";
  const target = await targetOf(patientId, account !== null, locale, input);
  if (!target) {
    return failed("link_failed");
  }
  try {
    await sendEmail({
      to,
      ...activationEmail({
        name: file.firstName?.trim() || "",
        url: target.url,
        appUrl: input.signInUrl(locale),
        access: target.access,
        locale,
      }),
    });
  } catch (cause) {
    // The cause only: the message holds the link, and the link is a credential.
    console.error("[care-activation] the activation e-mail failed", {
      patientId,
      cause: cause instanceof Error ? cause.message : String(cause),
    });
    return failed("send_failed");
  }
  await recordAuditEvent({
    actor,
    action: ACTIVATION_EMAIL_SENT,
    targetType: "patient",
    targetId: patientId,
    targetLabel: file.pseudonym,
    detail: target.access.kind,
  });
  return ok({ sent: true });
};

/**
 * The scoped surface (D-27). The actor comes first. A refused call answers as
 * a missing file. `sendActivationEmail` is a write: an admin's read-only open
 * is refused.
 */
export const getActivationEmailStatus = byPatient(
  "read",
  unscopedGetActivationEmailStatus,
  () => null,
);
export const sendActivationEmail = byPatient(
  "write",
  unscopedSendActivationEmail,
  noSuchPatient,
);
