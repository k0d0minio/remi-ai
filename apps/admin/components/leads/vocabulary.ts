import type { LeadType, OfferInterest } from "@remi/services/shared";
import type { Intent } from "@remi/ui/server";

/**
 * How the waiting lists read in the console. French, because the console's
 * operators are Morgane and Arnaud. Identifiers stay English per
 * `CONVENTIONS.md`.
 */

export const leadTypeLabels: Record<LeadType, string> = {
  patient_pilot: "patient pilote",
  info_request: "demande d'information",
  practitioner_pilot: "praticien pilote",
};

export const leadTypeIntents: Record<LeadType, Intent> = {
  patient_pilot: "success",
  info_request: "info",
  practitioner_pilot: "warning",
};

export const offerInterestLabels: Record<OfferInterest, string> = {
  genetic: "REMI + analyse génétique",
  consultation: "REMI + consultation nutritionnelle",
  undecided: "formule à décider ensemble",
};

export type LeadState = "pending" | "contacted" | "all";

export const leadStateLabels: Record<LeadState, string> = {
  pending: "à contacter",
  contacted: "contactés",
  all: "tous",
};
