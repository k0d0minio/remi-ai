/**
 * « Votre espace REMI est prêt »: when the e-mail goes out — stories 19 and 22.
 *
 * The e-mail goes out once, at the successful activation. The file has no
 * column for it (Jamie accepted the shortcut, 2026-11-20). The audit trail is
 * the record: `activation_email.sent` for an e-mail that went out, and
 * `activation_email.failed` for a send that did not. `activationEmailState`
 * reads the events of one file, and `activationEmailDecision` says whether a
 * send may run.
 *
 * Isomorphic: no I/O and no clock.
 */

/**
 * The sign-in page of the patient app, without the locale prefix. The one
 * home of this path: `apps/web` routes with it, and the admin app builds the
 * link of the e-mail with it.
 */
export const patientSignInPath = "/connexion";

export const ACTIVATION_EMAIL_SENT = "activation_email.sent";
export const ACTIVATION_EMAIL_FAILED = "activation_email.failed";

/**
 * Why a send did not go out. It is the detail of the `failed` event.
 *
 * - `no_email`: the file has no e-mail address.
 * - `no_mailer`: the deployment has no mailer.
 * - `link_failed`: the take-over link could not be made.
 * - `send_failed`: the mailer refused the message.
 */
export const activationEmailFailures = [
  "no_email",
  "no_mailer",
  "link_failed",
  "send_failed",
] as const;

export type ActivationEmailFailure = (typeof activationEmailFailures)[number];

const isFailure = (value: string): value is ActivationEmailFailure =>
  activationEmailFailures.includes(value as ActivationEmailFailure);

/** The part of an audit event that the decision reads. */
export type ActivationEmailEvent = {
  action: string;
  detail: string;
  createdAt: Date;
};

/**
 * - `none`: no send was tried for this file.
 * - `sent`: one e-mail went out. `at` is the date of the first one.
 * - `failed`: no e-mail went out. `reason` and `at` are those of the last try.
 */
export type ActivationEmailState =
  | { kind: "none" }
  | { kind: "sent"; at: Date }
  | { kind: "failed"; at: Date; reason: ActivationEmailFailure };

/**
 * The state of the e-mail of one file, from its audit events. Events of
 * another action are ignored. One `sent` event wins over every `failed`
 * event, in whatever order they come: an e-mail that went out stays out.
 */
export const activationEmailState = (
  events: readonly ActivationEmailEvent[],
): ActivationEmailState => {
  const byDate = [...events].sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
  );
  const sent = byDate.find((event) => event.action === ACTIVATION_EMAIL_SENT);
  if (sent) {
    return { kind: "sent", at: sent.createdAt };
  }
  const failed = byDate
    .filter((event) => event.action === ACTIVATION_EMAIL_FAILED)
    .at(-1);
  if (failed) {
    return {
      kind: "failed",
      at: failed.createdAt,
      // A detail that is not a known reason reads as a refused send.
      reason: isFailure(failed.detail) ? failed.detail : "send_failed",
    };
  }
  return { kind: "none" };
};

/**
 * - `activation`: the send that follows a successful activation.
 * - `resend`: the practitioner pressed « Renvoyer l'e-mail ».
 */
export type ActivationEmailTrigger = "activation" | "resend";

export type ActivationEmailDecision =
  | { send: true }
  | { send: false; why: "not_active" | "already_sent" | "already_tried" };

/**
 * Whether a send may run.
 *
 * - A file that is not active gets no e-mail.
 * - A file with a sent e-mail gets no second one, whatever the trigger.
 * - The send of the activation runs only when no send was tried: a second
 *   activation call sends nothing.
 * - A resend runs when no e-mail went out: after a failed send, or when the
 *   send of the activation never ran.
 */
export const activationEmailDecision = ({
  active,
  state,
  trigger,
}: {
  active: boolean;
  state: ActivationEmailState;
  trigger: ActivationEmailTrigger;
}): ActivationEmailDecision => {
  if (!active) {
    return { send: false, why: "not_active" };
  }
  if (state.kind === "sent") {
    return { send: false, why: "already_sent" };
  }
  if (trigger === "activation" && state.kind === "failed") {
    return { send: false, why: "already_tried" };
  }
  return { send: true };
};
