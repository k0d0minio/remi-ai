import type { OfferId } from "@/lib/content/landing";

/**
 * The offer cards pre-select a formula in the sign-up flow: the card
 * dispatches, the flow listens. A window event rather than shared state,
 * because the cards are server-rendered and the flow is the one island.
 */
export const SELECT_OFFER_EVENT = "remi:select-offer";

export const selectOffer = (id: OfferId) =>
  window.dispatchEvent(new CustomEvent<OfferId>(SELECT_OFFER_EVENT, { detail: id }));
