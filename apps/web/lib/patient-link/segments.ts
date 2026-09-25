/**
 * The segments of the patient link, in the order they appear in the
 * navigation. Home, Repas, Messages and Profil are always present — each is
 * somewhere the patient writes — and the rest appear only when this patient's
 * record holds something for them (brainstorm § J, decision #3).
 *
 * The paths are French because the reader is francophone and the URL is part
 * of what Morgane sends over WhatsApp — `/p/<token>/placard-frigo` reads as
 * hers even in the English locale.
 */
export const patientLinkSegments = [
  "home",
  "recommandations",
  "complements",
  "placard-frigo",
  "recettes",
  "documents",
  "repas",
  "progression",
  "messages",
  "profil",
] as const;

export type PatientLinkSegment = (typeof patientLinkSegments)[number];

/** The path suffix under `/p/[token]`. Home is the token root itself. */
export const segmentPath = (segment: PatientLinkSegment): string =>
  segment === "home" ? "" : `/${segment}`;
