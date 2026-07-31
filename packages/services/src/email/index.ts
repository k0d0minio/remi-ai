/**
 * @remi/services/email — outbound email.
 *
 * Server-only. Same seam pattern as /db: the app registers one `Mailer` at
 * process start and callers never name a vendor. The default adapter logs
 * instead of sending, so a local run or a preview deploy without credentials is
 * loud rather than silently dropping mail.
 *
 * Email fails silently by design in every provider — a send that returns 200 is
 * not a delivered message. Whatever adapter lands here must surface failures as
 * a rejected promise, never a swallowed one.
 */

export type EmailMessage = {
  to: string | readonly string[];
  subject: string;
  /** Plain-text body. Always provide one, even when `html` is set. */
  text: string;
  html?: string;
  from?: string;
  replyTo?: string;
};

export type SendResult = { id: string; provider: string };

export type Mailer = {
  readonly provider: string;
  send: (message: EmailMessage) => Promise<SendResult>;
};

/** The default: writes to stdout and returns a fake id. Never sends anything. */
export const consoleMailer: Mailer = {
  provider: "console",
  send: async (message) => {
    const to = Array.isArray(message.to) ? message.to.join(", ") : message.to;
    console.warn(
      `[email:console] no mailer registered — would send "${message.subject}" to ${to}`,
    );
    return { id: `console-${Date.now()}`, provider: "console" };
  },
};

let mailer: Mailer = consoleMailer;

export const registerMailer = (adapter: Mailer) => {
  mailer = adapter;
};

export const getMailer = () => mailer;

export const sendEmail = (message: EmailMessage) => mailer.send(message);
