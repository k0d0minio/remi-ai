import type { EmailMessage, LeadInput } from "@remi/services/server";
import { leadTypeLabels, offerInterestLabels } from "@/lib/leads/labels";

/**
 * The one address that hears about a new lead (Jamie, 2026-11-03). Morgane
 * answers from it. `info@remiai.be` stays the address the site shows.
 */
export const LEAD_NOTIFICATION_TO = "morgane@remiai.be";

const line = (label: string, value: string | undefined | null) =>
  value ? `${label} : ${value}` : null;

/**
 * A plain-text notification: who, from which list, how to reach them. The
 * reply-to is the visitor's address, so « Répondre » in her mail client is
 * the answer.
 */
export const buildLeadEmail = (lead: LeadInput): EmailMessage => {
  const name = [lead.firstName, lead.lastName].filter(Boolean).join(" ");
  const list = leadTypeLabels[lead.type];
  const subject = `Nouvelle inscription — ${list}${name ? ` — ${name}` : ""}`;
  const body = [
    `Une personne vient de s’inscrire sur le site (${list}).`,
    "",
    line("Prénom", lead.firstName),
    line("Nom", lead.lastName),
    line("E-mail", lead.email),
    line("Téléphone", lead.phone),
    line(
      "Formule",
      lead.offerInterest ? offerInterestLabels[lead.offerInterest] : null,
    ),
    line("Profession", lead.profession),
    lead.message ? `\nMessage :\n${lead.message}` : null,
    "",
    `Consentement : version ${lead.consentTextVersion}.`,
    "L’inscription est aussi dans la console, sous « Liste d’attente ».",
  ]
    .filter((row) => row !== null)
    .join("\n");

  return { to: LEAD_NOTIFICATION_TO, replyTo: lead.email, subject, text: body };
};
