import type { Locale } from "../../shared/i18n";
import type { EmailMessage } from "../index";

/**
 * The patient's own link to their profile and recommendations.
 *
 * Written in the patient's locale rather than the console's: this is the one
 * outbound message in the console that goes to someone who is not an operator.
 * The copy stays deliberately plain — the link is a capability, so the email
 * says what it opens and nothing that would make a forwarded copy look
 * harmless.
 */

type Props = {
  /** How the patient is addressed — their real name where Morgane recorded one. */
  name: string;
  practitionerName: string;
  url: string;
  locale: Locale;
};

type Copy = {
  subject: string;
  greeting: (name: string) => string;
  lead: (practitioner: string) => string;
  action: string;
  fallback: string;
  privacy: string;
  signature: string;
};

const copy: Record<Locale, Copy> = {
  fr: {
    subject: "Votre espace REMI",
    greeting: (name) => (name ? `Bonjour ${name},` : "Bonjour,"),
    lead: (practitioner) =>
      `${practitioner} a préparé votre espace REMI : votre objectif et vos recommandations, réunis sur une page.`,
    action: "Ouvrir mon espace",
    fallback: "Ou copiez ce lien :",
    privacy:
      "Ce lien vous est personnel — gardez-le pour vous. Vous pouvez le rouvrir à tout moment ; la page est mise à jour au fil des consultations.",
    signature: "— REMI",
  },
  en: {
    subject: "Your REMI space",
    greeting: (name) => (name ? `Hello ${name},` : "Hello,"),
    lead: (practitioner) =>
      `${practitioner} has prepared your REMI space: your objective and your recommendations, on one page.`,
    action: "Open my space",
    fallback: "Or copy this link:",
    privacy:
      "This link is personal to you — please keep it to yourself. You can reopen it any time; the page is kept up to date as the consultations go.",
    signature: "— REMI",
  },
};

export const patientLinkEmail = ({
  name,
  practitionerName,
  url,
  locale,
}: Props): Omit<EmailMessage, "to"> => {
  const t = copy[locale];
  const greeting = t.greeting(name.trim());
  const lead = t.lead(practitionerName.trim() || "REMI");

  const text = [
    greeting,
    "",
    lead,
    "",
    url,
    "",
    t.privacy,
    "",
    t.signature,
  ].join("\n");

  const html = [
    "<div style=\"font-family:system-ui,-apple-system,'Segoe UI',sans-serif;font-size:15px;line-height:1.6;color:#1f2933;\">",
    `<p>${greeting}</p>`,
    `<p>${lead}</p>`,
    `<p><a href="${url}" style="display:inline-block;padding:10px 18px;border-radius:8px;background:#1f2933;color:#ffffff;text-decoration:none;">${t.action}</a></p>`,
    `<p style="font-size:13px;color:#616e7c;">${t.fallback}<br /><span style="word-break:break-all;">${url}</span></p>`,
    `<p style="font-size:13px;color:#616e7c;">${t.privacy}</p>`,
    `<p>${t.signature}</p>`,
    "</div>",
  ].join("");

  return { subject: t.subject, text, html };
};
