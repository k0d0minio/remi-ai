/**
 * The waiting-list vocabulary — the three lists the public site fills
 * (triage/morgane-transmission). Shared because the site validates with it in
 * the browser and the service validates with it again on the server.
 */

export const leadTypes = [
  /** « Je veux devenir patient pilote ». */
  "patient_pilot",
  /** « J'aimerais en savoir plus » — an address and, at most, a question. */
  "info_request",
  /** « Je rejoins la liste d'attente praticiens ». */
  "practitioner_pilot",
] as const;

export type LeadType = (typeof leadTypes)[number];

export const isLeadType = (value: string): value is LeadType =>
  (leadTypes as readonly string[]).includes(value);

/** Which of the two pilot offers a patient pointed at, or neither yet. */
export const offerInterests = ["genetic", "consultation", "undecided"] as const;

export type OfferInterest = (typeof offerInterests)[number];

export const isOfferInterest = (value: string): value is OfferInterest =>
  (offerInterests as readonly string[]).includes(value);
