import { PRACTICE_TIME_ZONE } from "../../shared/format";
import type { Locale } from "../../shared/i18n";
import type { EmailMessage } from "../index";

/**
 * The notice of deletion for an inactive account (`inactive-account-deletion`,
 * privacy policy § 7). The patient gets it in their file's language. The
 * practitioner gets a copy in French that names the pseudonym only.
 *
 * The shape follows `patient-link.ts`: plain text first, the same inline HTML.
 * The names come from what a patient typed, so the HTML escapes them.
 */

/** The five characters HTML gives a meaning to. Names reach the HTML through it. */
const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

/** The day of the deletion, as the practice's calendar reads it. */
const deletionDay = (at: Date, locale: Locale) =>
  new Intl.DateTimeFormat(locale === "fr" ? "fr-BE" : "en-GB", {
    dateStyle: "long",
    timeZone: PRACTICE_TIME_ZONE,
  }).format(at);

const wrap = (paragraphs: readonly string[]) =>
  [
    "<div style=\"font-family:system-ui,-apple-system,'Segoe UI',sans-serif;font-size:15px;line-height:1.6;color:#1f2933;\">",
    ...paragraphs,
    "</div>",
  ].join("");

type NoticeProps = {
  /** How the patient is addressed: their first name, else empty. */
  name: string;
  deletionDate: Date;
  /** The sign-in page in the patient's language. */
  signInUrl: string;
  locale: Locale;
};

type NoticeCopy = {
  subject: (day: string) => string;
  greeting: (name: string) => string;
  lead: (day: string) => string;
  keep: string;
  action: string;
  fallback: string;
  signature: string;
};

const notice: Record<Locale, NoticeCopy> = {
  fr: {
    subject: (day) => `Ton compte REMI sera supprimé le ${day}`,
    greeting: (name) => (name ? `Bonjour ${name},` : "Bonjour,"),
    lead: (day) =>
      `Tu ne t'es pas connecté(e) à REMI depuis onze mois. Comme le prévoit notre politique de confidentialité, ton compte et tes données seront supprimés définitivement le ${day}.`,
    keep: "Pour garder ton compte, il suffit de te connecter avant cette date. La suppression est alors annulée.",
    action: "Me connecter",
    fallback: "Ou copie ce lien :",
    signature: "— REMI",
  },
  en: {
    subject: (day) => `Your REMI account will be deleted on ${day}`,
    greeting: (name) => (name ? `Hello ${name},` : "Hello,"),
    lead: (day) =>
      `You have not signed in to REMI for eleven months. As our privacy policy says, your account and your data will be deleted for good on ${day}.`,
    keep: "To keep your account, sign in before that date. The deletion is then cancelled.",
    action: "Sign in",
    fallback: "Or copy this link:",
    signature: "— REMI",
  },
};

export const inactivityNoticeEmail = ({
  name,
  deletionDate,
  signInUrl,
  locale,
}: NoticeProps): Omit<EmailMessage, "to"> => {
  const t = notice[locale];
  const day = deletionDay(deletionDate, locale);
  const greeting = t.greeting(name.trim());

  const text = [
    greeting,
    "",
    t.lead(day),
    "",
    t.keep,
    "",
    signInUrl,
    "",
    t.signature,
  ].join("\n");

  const html = wrap([
    `<p>${escapeHtml(greeting)}</p>`,
    `<p>${t.lead(day)}</p>`,
    `<p>${t.keep}</p>`,
    `<p><a href="${signInUrl}" style="display:inline-block;padding:10px 18px;border-radius:8px;background:#1f2933;color:#ffffff;text-decoration:none;">${t.action}</a></p>`,
    `<p style="font-size:13px;color:#616e7c;">${t.fallback}<br /><span style="word-break:break-all;">${signInUrl}</span></p>`,
    `<p>${t.signature}</p>`,
  ]);

  return { subject: t.subject(day), text, html };
};

type CopyProps = {
  pseudonym: string;
  deletionDate: Date;
};

/** The practitioner's copy: in French, the console's language, pseudonym only. */
export const inactivityNoticeCopyEmail = ({
  pseudonym,
  deletionDate,
}: CopyProps): Omit<EmailMessage, "to"> => {
  const day = deletionDay(deletionDate, "fr");
  const subject = `Copie : le compte de ${pseudonym} sera supprimé le ${day}`;
  const lines = [
    "Bonjour,",
    `${pseudonym} ne s'est pas connecté(e) à REMI depuis onze mois. REMI lui a envoyé l'avis de suppression. Le compte et le dossier seront supprimés le ${day}, sauf si la personne se connecte avant.`,
    "Pour garder le dossier, un propriétaire de la console peut poser une conservation dans la « Zone sensible » du dossier.",
    "— REMI",
  ];

  return {
    subject,
    text: lines.join("\n\n"),
    html: wrap(lines.map((line) => `<p>${escapeHtml(line)}</p>`)),
  };
};
