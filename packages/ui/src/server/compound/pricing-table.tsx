import { Check } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "../../lib/utils";
import { Badge } from "../badge";
import { Card, CardContent, CardFooter, CardHeader } from "../card";
import { Separator } from "../separator";
import { Typography } from "../typography";

export type PricingTier = {
  id: string;
  name: string;
  description: ReactNode;
  /** Formatted by the caller, including its currency symbol. */
  priceMonthly: string;
  priceAnnual: string;
  /** What the price is per — "per month", "per month, billed annually". */
  cadence: { monthly: string; annual: string };
  features: string[];
  /** The tier's button, rendered by the caller: `Button` is a client component. */
  action: ReactNode;
  /** Shown on the highlighted tier only. */
  badge?: string;
};

type Props = {
  tiers: PricingTier[];
  billing: "monthly" | "annual";
  /** The tier to lift out of the row. At most one. */
  highlightTierId?: string;
  className?: string;
};

export const PricingTable = ({
  tiers,
  billing,
  highlightTierId,
  className,
}: Props) => (
  <div className={cn("grid gap-6 lg:grid-cols-3 lg:items-start", className)}>
    {tiers.map((tier) => {
      const highlighted = tier.id === highlightTierId;
      return (
        <Card
          key={tier.id}
          elevation={highlighted ? "floating" : "flat"}
          className={cn(
            "h-full gap-6",
            highlighted && "border-primary-border lg:-my-4 lg:py-10",
          )}
        >
          <CardHeader className="gap-3">
            <div className="flex items-center justify-between gap-2">
              <Typography as="h3" size="lg" weight="semibold">
                {tier.name}
              </Typography>
              {highlighted && tier.badge ? (
                <Badge variant="success" tone="subtle" size="sm">
                  {tier.badge}
                </Badge>
              ) : null}
            </div>

            <Typography size="sm" tone="muted">
              {tier.description}
            </Typography>

            <div className="mt-2 flex items-baseline gap-1.5">
              <Typography
                as="span"
                variant="display"
                size="4xl"
                className="tabular-nums"
              >
                {billing === "monthly" ? tier.priceMonthly : tier.priceAnnual}
              </Typography>
              <Typography as="span" size="sm" tone="muted">
                {billing === "monthly"
                  ? tier.cadence.monthly
                  : tier.cadence.annual}
              </Typography>
            </div>
          </CardHeader>

          <CardContent className="flex flex-col gap-4">
            <Separator tone="subtle" />
            <ul className="flex flex-col gap-2.5">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5">
                  <Check
                    aria-hidden="true"
                    className="text-success-text mt-0.5 size-4 shrink-0"
                  />
                  <Typography as="span" size="sm">
                    {feature}
                  </Typography>
                </li>
              ))}
            </ul>
          </CardContent>

          <CardFooter className="mt-auto">{tier.action}</CardFooter>
        </Card>
      );
    })}
  </div>
);
