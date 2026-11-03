import type { Entity } from "../../types";
import type { LeadType, OfferInterest } from "../../shared/leads";

/**
 * One person on a waiting list of the public site (triage/morgane-transmission).
 *
 * `email` is stored lower-cased, so one address is one row per list. The
 * optional fields are the ones the form of that list asks for: a patient pilot
 * gives a first name, a practitioner gives a profession, an information
 * request gives at most a question. `consentTextVersion` names the consent
 * text the person ticked. `contactedAt` is Morgane's own mark in the console.
 */
export type Lead = Entity & {
  type: LeadType;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  offerInterest: OfferInterest | null;
  profession: string | null;
  message: string | null;
  consentTextVersion: string;
  contactedAt: Date | null;
};
