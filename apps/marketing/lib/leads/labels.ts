import type { LeadType, OfferInterest } from "@remi/services/shared";

/** How a list and a formula read in the notification email. */
export const leadTypeLabels: Record<LeadType, string> = {
  patient_pilot: "patient pilote",
  info_request: "demande d’information",
  practitioner_pilot: "praticien pilote",
};

export const offerInterestLabels: Record<OfferInterest, string> = {
  genetic: "REMI + analyse génétique",
  consultation: "REMI + consultation nutritionnelle",
  undecided: "à décider ensemble",
};
