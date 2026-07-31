"use client";

import NextLink from "next/link";
import { useState } from "react";
import {
  Button,
  Switch,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@remi/ui";
import {
  Container,
  PricingTable,
  Section,
  Typography,
  type PricingTier,
} from "@remi/ui/server";
import { pricing } from "@/lib/content/landing";

/**
 * The billing toggle is the only state on the page, and it has to sit above the
 * table for the prices to react — so this section is a client component and the
 * table it renders is not.
 *
 * PLACEHOLDER PRICING. Nothing has been decided; see lib/content/landing.ts.
 */
export const PricingSection = () => {
  const [annual, setAnnual] = useState(true);

  const tiers: PricingTier[] = pricing.map((tier) => ({
    ...tier,
    action: (
      <Button
        asChild
        className="w-full"
        variant={tier.id === "plus" ? "primary" : "outline"}
      >
        <NextLink href="/contact">
          {tier.id === "free" ? "Start free" : `Choose ${tier.name}`}
        </NextLink>
      </Button>
    ),
  }));

  return (
    <Section id="pricing" tone="muted" spacing="lg">
      <Container className="flex flex-col gap-12">
        <div className="flex flex-col items-center gap-4 text-center">
          <Typography variant="eyebrow" tone="muted">
            Placeholder pricing
          </Typography>
          <Typography as="h2" variant="display" size="4xl" balance>
            Priced so the free tier is genuinely usable
          </Typography>

          <div className="mt-2 flex items-center gap-3">
            <Typography as="label" htmlFor="billing" size="sm">
              Monthly
            </Typography>
            <Switch
              id="billing"
              checked={annual}
              onCheckedChange={setAnnual}
              aria-label="Bill annually"
            />
            <Typography as="label" htmlFor="billing" size="sm">
              Annually
            </Typography>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="text-success-text text-sm font-medium underline decoration-dotted underline-offset-4">
                  Save 20%
                </TooltipTrigger>
                <TooltipContent>
                  Annual billing is charged once for twelve months. Indicative
                  only — pricing has not been finalised.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <PricingTable
          tiers={tiers}
          billing={annual ? "annual" : "monthly"}
          highlightTierId="plus"
        />
      </Container>
    </Section>
  );
};
