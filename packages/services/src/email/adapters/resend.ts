import { requireEnv } from "../../server/env";
import type { EmailMessage, Mailer, SendResult } from "../index";

/**
 * The Resend adapter for the `Mailer` seam.
 *
 * Spoken to over its REST endpoint rather than through the `resend` SDK: this is
 * one POST with one JSON body, and the SDK would add a dependency to the package
 * to earn nothing. If attachments, batch sends or webhooks arrive later that
 * trade changes and the SDK becomes the right call.
 *
 * The seam's contract is that a failure is a rejected promise, never a swallowed
 * one — a send that returns 200 is still not a delivered message, so anything
 * short of "Resend accepted it and named an id" throws.
 */

const ENDPOINT = "https://api.resend.com/emails";

/** The wire shape Resend expects: snake_case, and `to` always an array. */
type ResendPayload = {
  from: string;
  to: readonly string[];
  subject: string;
  text: string;
  html?: string;
  reply_to?: string;
};

const EMAIL = /[^\s<>@]+@[^\s<>@]+/;

/** RFC 5322 specials: a display name containing one has to be quoted. */
const NEEDS_QUOTING = /[()<>[\]:;@\\,."]/;

const stripWrappingQuotes = (value: string) => {
  const first = value.charAt(0);
  if (
    (first === '"' || first === "'") &&
    value.length > 1 &&
    value.endsWith(first)
  ) {
    return value.slice(1, -1).trim();
  }
  return value;
};

/**
 * Rebuild a from-address from whatever the environment holds, rather than trust
 * it to already be a well-formed header.
 *
 * A sender is configured by hand, once, in a dashboard field, and every way of
 * getting it slightly wrong — a dropped `>`, the quotes a shell needs and a web
 * form does not, a stray newline — earns the same 422 describing the *rule*
 * rather than the value. So the address is taken apart and put back together:
 * find the one thing that has to be right, the mailbox, and treat everything
 * before it as a display name.
 *
 * A value with no mailbox in it at all is passed through untouched — there is
 * nothing to rebuild from, and the provider's rejection is the honest answer.
 */
export const normaliseAddress = (value: string) => {
  const unwrapped = stripWrappingQuotes(value.trim());
  const email = unwrapped.match(EMAIL)?.[0];
  if (email === undefined) {
    return unwrapped;
  }

  const name = stripWrappingQuotes(
    unwrapped.slice(0, unwrapped.indexOf(email)).replace(/[<>]/g, "").trim(),
  );
  if (name === "") {
    return email;
  }

  return NEEDS_QUOTING.test(name)
    ? `"${name.replace(/(["\\])/g, "\\$1")}" <${email}>`
    : `${name} <${email}>`;
};

/**
 * Pure: a seam message plus the configured from-address in, one wire body out.
 * Separate from the send so the mapping can be tested without a network.
 */
export const toResendPayload = (
  message: EmailMessage,
  defaultFrom: string,
): ResendPayload => ({
  from: normaliseAddress(message.from ?? defaultFrom),
  to: typeof message.to === "string" ? [message.to] : [...message.to],
  subject: message.subject,
  text: message.text,
  ...(message.html === undefined ? {} : { html: message.html }),
  ...(message.replyTo === undefined ? {} : { reply_to: message.replyTo }),
});

/**
 * Resend answers errors as JSON, but a proxy or a gateway in front of it may
 * answer HTML. Read the body as text either way and clip it, so the thrown error
 * repeats what actually came back instead of failing to parse it.
 */
export const summariseBody = (body: string) => {
  const flattened = body.replace(/\s+/g, " ").trim();
  if (flattened === "") {
    return "(empty body)";
  }
  return flattened.length > 300 ? `${flattened.slice(0, 300)}…` : flattened;
};

/** Pure: the message id out of a success body, or `null` if it isn't there. */
export const readMessageId = (body: string): string | null => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(body);
  } catch {
    return null;
  }
  if (typeof parsed !== "object" || parsed === null || !("id" in parsed)) {
    return null;
  }
  const { id } = parsed as { id: unknown };
  return typeof id === "string" && id !== "" ? id : null;
};

/**
 * Credentials are read per send, not at construction: registering an adapter
 * should never be the thing that fails a boot, and the failure this way lands
 * where a caller can turn it into something a visitor reads.
 */
export const createResendMailer = (): Mailer => ({
  provider: "resend",
  send: async (message): Promise<SendResult> => {
    const apiKey = requireEnv("RESEND_API_KEY", "the Resend mailer");
    const from = message.from ?? requireEnv("EMAIL_FROM", "the Resend mailer");

    const payload = toResendPayload(message, from);

    const response = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const body = await response.text();

    if (!response.ok) {
      // The sender is quoted back because Resend's complaints about it describe
      // the rule rather than the value, and the value is the thing that is
      // wrong. It is a public address, not a credential — the key never appears.
      throw new Error(
        `resend refused the send (HTTP ${response.status}) from ${JSON.stringify(payload.from)}: ${summariseBody(body)}`,
      );
    }

    const id = readMessageId(body);
    if (id === null) {
      throw new Error(
        `resend accepted the send but named no id — treat it as undelivered: ${summariseBody(body)}`,
      );
    }

    return { id, provider: "resend" };
  },
});
