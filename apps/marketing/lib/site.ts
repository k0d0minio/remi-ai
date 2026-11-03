/**
 * The facts the landing page repeats: the pilot's start, the contact details,
 * the consent version and the publisher. One place to change a date, a price
 * or a number, from Morgane's `config/site.ts` of 2 November 2026.
 */
export const SITE = {
  /** Start of the patient pilot. */
  pilotStartLabel: "15 décembre 2026",
  pilotDurationWeeks: 8,

  /** The public contact address: footer, legal pages, error copy. */
  contactEmail: "info@remiai.be",

  /** The public phone, and its clickable form. */
  contactPhone: "+32 486 12 46 83",
  contactPhoneHref: "tel:+32486124683",

  /**
   * The version of the consent text. Raise it when the text or the privacy
   * policy changes: the version is stored with every lead.
   */
  consentTextVersion: "2026-11-draft-1",

  /** The publisher, from the CGU/CGV of the previous site. Three fields stay to complete. */
  company: {
    legalName: "REMI AI SRL",
    legalForm: "Société à responsabilité limitée",
    address: "Avenue du Tonnelier, 24 — 1428 Lillois-Witterzée (Belgique)",
    registrationNumber: "[À COMPLÉTER — numéro BCE / TVA]",
    publisher: "[À COMPLÉTER — responsable de la publication]",
    host: "[À COMPLÉTER — hébergeur du site (nom, adresse)]",
  },
} as const;

/** A price in euros: 347 → « 347 € ». */
export const formatPrice = (euros: number) => `${euros} €`;
