import type { EmailMessage } from "@remi/services/server";
import type { Locale } from "@remi/services/shared";

type Submission = {
  name: string;
  email: string;
  message: string;
  /** The language the visitor was reading, so the reply can be in it. */
  locale: Locale;
  to: readonly string[];
};

/**
 * A subject line is a single header and its content is a stranger's input, so
 * flatten the whitespace out of it and clip it before it goes near one.
 */
const flatten = (value: string, max: number) =>
  value.replace(/\s+/g, " ").trim().slice(0, max);

/**
 * The notification the founders receive. Pure, and separate from the action, so
 * the shape of the mail is readable — and testable — without a network or a
 * form.
 *
 * English on purpose: this is a machine notice rather than a document written for
 * them, and the visitor's own words are quoted verbatim below the header lines.
 *
 * `from` is left to the mailer's configured address and `replyTo` carries the
 * visitor: sending _as_ the visitor would fail domain verification, while
 * hitting reply still has to reach them.
 */
export const buildContactEmail = ({
  name,
  email,
  message,
  locale,
  to,
}: Submission): EmailMessage => ({
  to,
  replyTo: email,
  subject: `Contact form — ${flatten(name, 60)}`,
  text: [
    `Name: ${flatten(name, 200)}`,
    `Email: ${email}`,
    `Language: ${locale}`,
    "",
    message,
  ].join("\n"),
});
