import { PRACTICE_TIME_ZONE } from "../../shared/format";
import type { Locale } from "../../shared/i18n";
import type { EmailMessage } from "../index";

/**
 * The one-time link to take over a file the practitioner created
 * (`patient-takes-over-file`, path 2). A sign-up found the address on such a
 * file, and the patient asked for the link. It goes in the file's language.
 *
 * The shape follows `inactivity-notice.ts`: plain text carries the whole
 * message, the HTML says nothing more. The name comes from what a person
 * typed, so the HTML escapes it.
 */

/** The five characters HTML gives a meaning to. The name reaches the HTML through it. */
const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

/** The expiry, as the practice's clock reads it: a day and an hour. */
const expiryMoment = (at: Date, locale: Locale) =>
  new Intl.DateTimeFormat(locale === "fr" ? "fr-BE" : "en-GB", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: PRACTICE_TIME_ZONE,
  }).format(at);

type Props = {
  /** How the patient is addressed: their first name, else empty. */
  name: string;
  url: string;
  expiresAt: Date;
  locale: Locale;
};

type Copy = {
  subject: string;
  greeting: (name: string) => string;
  lead: string;
  how: string;
  action: string;
  fallback: string;
  expiry: (moment: string) => string;
  signature: string;
};

const copy: Record<Locale, Copy> = {
  fr: {
    subject: "Reprenez votre dossier REMI",
    greeting: (name) => (name ? `Bonjour ${name},` : "Bonjour,"),
    lead: "La personne qui vous suit a déjà ouvert un dossier REMI à votre adresse e-mail. Ce lien vous permet de le reprendre : vous retrouvez les informations déjà enregistrées.",
    how: "Le lien vous demande d'abord votre accord sur le traitement de vos données, puis un mot de passe.",
    action: "Reprendre mon dossier",
    fallback: "Ou copiez ce lien :",
    expiry: (moment) =>
      `Ce lien est personnel. Il sert une seule fois et expire le ${moment}. Si vous n'avez rien demandé, ignorez ce message : sans le lien, aucun compte n'est créé.`,
    signature: "— REMI",
  },
  en: {
    subject: "Take over your REMI file",
    greeting: (name) => (name ? `Hello ${name},` : "Hello,"),
    lead: "The person who follows you already opened a REMI file at your e-mail address. This link lets you take it over: you find the information already recorded.",
    how: "The link first asks for your consent to the processing of your data, then for a password.",
    action: "Take over my file",
    fallback: "Or copy this link:",
    expiry: (moment) =>
      `This link is personal. It works once and expires on ${moment}. If you did not ask for it, ignore this message: without the link, no account is created.`,
    signature: "— REMI",
  },
};

export const fileClaimEmail = ({
  name,
  url,
  expiresAt,
  locale,
}: Props): Omit<EmailMessage, "to"> => {
  const t = copy[locale];
  const greeting = t.greeting(name.trim());
  const expiry = t.expiry(expiryMoment(expiresAt, locale));

  const text = [
    greeting,
    "",
    t.lead,
    "",
    t.how,
    "",
    url,
    "",
    expiry,
    "",
    t.signature,
  ].join("\n");

  const html = [
    "<div style=\"font-family:system-ui,-apple-system,'Segoe UI',sans-serif;font-size:15px;line-height:1.6;color:#1f2933;\">",
    `<p>${escapeHtml(greeting)}</p>`,
    `<p>${t.lead}</p>`,
    `<p>${t.how}</p>`,
    `<p><a href="${url}" style="display:inline-block;padding:10px 18px;border-radius:8px;background:#1f2933;color:#ffffff;text-decoration:none;">${t.action}</a></p>`,
    `<p style="font-size:13px;color:#616e7c;">${t.fallback}<br /><span style="word-break:break-all;">${url}</span></p>`,
    `<p style="font-size:13px;color:#616e7c;">${expiry}</p>`,
    `<p>${t.signature}</p>`,
    "</div>",
  ].join("");

  return { subject: t.subject, text, html };
};
