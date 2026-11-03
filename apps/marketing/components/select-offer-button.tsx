"use client";

import type { ComponentProps } from "react";
import { Button } from "@remi/ui";
import type { OfferId } from "@/lib/content/landing";
import { selectOffer } from "./select-offer";

type Props = Omit<ComponentProps<typeof Button>, "asChild"> & {
  offer: OfferId;
};

/**
 * « Je suis intéressé(e) » on an offer card: pre-selects the formula and
 * follows the anchor to the sign-up. A client component only for the click.
 */
export const SelectOfferButton = ({ offer, children, ...props }: Props) => (
  <Button asChild {...props}>
    <a href="#inscription" onClick={() => selectOffer(offer)}>
      {children}
    </a>
  </Button>
);
