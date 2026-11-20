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
    subject: "Ton espace REMI",
    greeting: (name) => (name ? `Bonjour ${name},` : "Bonjour,"),
    lead: (practitioner) =>
      `${practitioner} a préparé ton espace REMI : ton objectif et tes recommandations, réunis sur une page.`,
    action: "Ouvrir mon espace",
    fallback: "Ou copie ce lien :",
    privacy:
      "Ce lien t'est personnel — garde-le pour toi. Tu peux le rouvrir à tout moment ; la page est mise à jour au fil des consultations.",
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
