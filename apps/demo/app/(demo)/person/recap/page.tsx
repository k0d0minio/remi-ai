import type { Metadata } from "next";
import { Lightbulb, Mountain, ShieldCheck, Sprout } from "lucide-react";
import type { ComponentType } from "react";
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  IconTile,
  Separator,
  Typography,
} from "@remi/ui/server";
import { AdherenceSparkline } from "@/components/adherence-sparkline";
import { practitionerName } from "@/lib/mock/clients";
import { weeklyRecap } from "@/lib/mock/recap";
import type { RecapSectionKind } from "@/lib/mock/types";

export const metadata: Metadata = { title: "Mon bilan" };

const sectionIcons: Record<
  RecapSectionKind,
  {
    icon: ComponentType<{ className?: string }>;
    intent: "success" | "warning" | "info";
  }
> = {
  "went-well": { icon: Sprout, intent: "success" },
  "was-hard": { icon: Mountain, intent: "warning" },
  suggestion: { icon: Lightbulb, intent: "info" },
};

/**
 * The weekly recap, and the one design decision that matters on it: it is
 * addressed to the person but written *for* the practitioner's review, and the
 * card says so above the fold rather than in a footnote.
 *
 * A summary an AI sends unread is a second opinion the practitioner never
 * agreed to give. So this screen carries a status — en attente de relecture —
 * and exactly one suggestion, because a recap with six is a to-do list, which
 * is the thing the person already could not act on.
 */
const Page = () => (
  <div className="mx-auto flex max-w-2xl flex-col gap-6">
    <div className="flex flex-col gap-2">
      <Typography as="h1" size="2xl" weight="semibold">
        Mon bilan
      </Typography>
      <Typography tone="muted">
        Ce que votre semaine raconte, résumé le dimanche soir.
      </Typography>
    </div>

    <Card variant="info">
      <CardHeader className="gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="info" tone="subtle" size="sm">
            <ShieldCheck aria-hidden="true" />
            Préparé pour {practitionerName}
          </Badge>
          {weeklyRecap.reviewStatus === "awaiting-review" ? (
            <Badge variant="warning" tone="subtle" size="sm">
              En attente de sa relecture
            </Badge>
          ) : null}
        </div>
        <CardDescription>{weeklyRecap.weekLabel}</CardDescription>
        <CardTitle>Votre semaine, en trois temps</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        <Typography>{weeklyRecap.opening}</Typography>

        <Separator tone="subtle" />

        {weeklyRecap.sections.map((section) => {
          const { icon: Icon, intent } = sectionIcons[section.kind];

          return (
            <div key={section.kind} className="flex gap-4">
              <IconTile intent={intent} size="sm">
                <Icon />
              </IconTile>
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <Typography as="h2" weight="medium">
                  {section.title}
                </Typography>
                <Typography size="sm" tone="muted">
                  {section.body}
                </Typography>
                <ul className="flex flex-col gap-1">
                  {section.points.map((point) => (
                    <li key={point} className="flex gap-2">
                      <span
                        aria-hidden="true"
                        className="bg-border mt-2 size-1 shrink-0 rounded-full"
                      />
                      <Typography as="span" size="sm" tone="muted">
                        {point}
                      </Typography>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}

        <Separator tone="subtle" />

        <AdherenceSparkline
          points={weeklyRecap.adherence}
          average={weeklyRecap.adherenceAverage}
          delta={weeklyRecap.adherenceDelta}
        />
      </CardContent>
    </Card>

    <Card elevation="flat" className="border-border">
      <CardContent>
        <Typography size="sm" tone="muted">
          {weeklyRecap.closing}
        </Typography>
      </CardContent>
    </Card>

    <Typography size="xs" tone="muted">
      Bilan préparé le {weeklyRecap.preparedOn}.
    </Typography>
  </div>
);

export default Page;
