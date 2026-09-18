import NextLink from "next/link";
import { mealIntents } from "@remi/services/shared";
import { Card, CardContent, Link, Typography } from "@remi/ui/server";
import type { Content } from "@/lib/content/types";

type Props = {
  content: Content["patientLink"];
  /** Where the writing happens — the Repas segment, locale-prefixed. */
  href: string;
};

/**
 * The way in to the meal loop — « Je vais manger » / « J'ai mangé », her § 6's
 * fifth item and the reason the home exists at all.
 *
 * `patient-home-today` shipped this card with its two labels inert and a line
 * saying so, because the journal had no patient-side entry to send them to.
 * It does now, on Repas, so they are links: the home stays the invitation and
 * the segment stays where a meal is actually written, which is also where the
 * history it joins already lives. Two forms for one act would be two places to
 * keep in step.
 *
 * It renders for every patient, empty record included: it is the invitation,
 * not a view of data.
 */
export const MealEntryPoint = ({ content, href }: Props) => (
  <Card variant="info">
    <CardContent className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <Typography as="h2" size="lg" weight="semibold">
          {content.mealEntry.title}
        </Typography>
        <Typography size="sm" tone="muted">
          {content.mealEntry.lead}
        </Typography>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        {mealIntents.map((intent) => (
          <Link
            key={intent}
            as={NextLink}
            href={href}
            className="border-border bg-card hover:bg-accent flex min-h-11 flex-1 items-center justify-center rounded-md border px-4 py-2 text-sm font-medium transition-colors duration-[--duration-fast]"
          >
            {content.mealEntry.actions[intent]}
          </Link>
        ))}
      </div>
    </CardContent>
  </Card>
);
