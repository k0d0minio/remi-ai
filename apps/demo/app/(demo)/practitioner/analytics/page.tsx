import type { Metadata } from "next";
import { ArrowRight, TrendingDown, TrendingUp } from "lucide-react";
import NextLink from "next/link";
import { Button } from "@remi/ui";
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Separator,
  Typography,
} from "@remi/ui/server";
import { AtRiskList } from "@/components/at-risk-list";
import { CohortAdherenceChart } from "@/components/cohort-adherence-chart";
import { EngagementDistribution } from "@/components/engagement-distribution";
import {
  atRisk,
  cohortAverage,
  cohortDelta,
  cohortSize,
  cohortWeeks,
  cohortWindow,
  consultationImpact,
  engagementBands,
} from "@/lib/mock/analytics";
import { practitionerName } from "@/lib/mock/clients";

export const metadata: Metadata = { title: "Analyse de cohorte" };

/**
 * The practice read as a whole rather than one file at a time. It answers a
 * different question from `/practitioner` — that screen is "qui a besoin de moi
 * cette semaine", this one is "est-ce que ce que je fais marche, et sur qui" —
 * so it leads with what the consultations produced and ends with the three
 * people that reading singles out.
 *
 * Every figure names what it is measured against. A cohort screen is the easiest
 * place in a product to state something that sounds true and cannot be checked.
 */
const Page = () => (
  <div className="flex flex-col gap-8">
    <div className="flex flex-col gap-2">
      <Typography as="h1" size="2xl" weight="semibold">
        Analyse de cohorte
      </Typography>
      <Typography tone="muted">
        {cohortSize} accompagnements suivis par {practitionerName}, sur les huit
        dernières semaines · {cohortWindow}
      </Typography>
    </div>

    <section className="flex flex-col gap-3">
      <Typography as="h2" size="lg" weight="semibold">
        Ce que produisent les consultations
      </Typography>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {consultationImpact.map((stat) => (
          <Card key={stat.id} className="gap-4">
            <CardHeader>
              <CardDescription>{stat.label}</CardDescription>
              <CardTitle className="text-3xl">{stat.value}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {stat.delta ? (
                <Badge variant={stat.delta.intent} tone="subtle" size="sm">
                  {stat.delta.intent === "success" ? (
                    <TrendingUp aria-hidden="true" />
                  ) : (
                    <TrendingDown aria-hidden="true" />
                  )}
                  {stat.delta.text}
                </Badge>
              ) : null}
              <Typography size="xs" tone="muted">
                {stat.detail}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>

    <div className="grid gap-6 lg:grid-cols-[3fr_2fr]">
      <Card elevation="flat" className="border-border">
        <CardHeader>
          <CardTitle className="text-base">
            Régularité de la cohorte, semaine par semaine
          </CardTitle>
          <CardDescription>
            Le creux de fin juin est celui des départs en vacances : quatre
            personnes sur douze étaient absentes deux semaines.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CohortAdherenceChart
            weeks={cohortWeeks}
            average={cohortAverage}
            delta={cohortDelta}
          />
        </CardContent>
      </Card>

      <Card elevation="flat" className="border-border">
        <CardHeader>
          <CardTitle className="text-base">Niveaux d'engagement</CardTitle>
          <CardDescription>
            Où sont les {cohortSize} personnes aujourd'hui, sur les quatorze
            derniers jours.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EngagementDistribution bands={engagementBands} total={cohortSize} />
        </CardContent>
      </Card>
    </div>

    <Separator />

    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <Typography as="h2" size="lg" weight="semibold">
            Trois personnes à reprendre
          </Typography>
          <Typography size="sm" tone="muted">
            Assiduité basse ou en baisse nette. Naïma est encore à 64 % : elle
            est ici parce que la pente descend et qu'elle a dit pourquoi.
          </Typography>
        </div>
        <Button asChild variant="ghost" size="sm">
          <NextLink href="/practitioner/clients">
            Toutes les personnes
            <ArrowRight aria-hidden="true" />
          </NextLink>
        </Button>
      </div>

      <AtRiskList clients={atRisk} />
    </section>

    <Typography size="xs" tone="muted">
      Cohorte fictive : douze accompagnements, huit semaines, aucune donnée
      réelle.
    </Typography>
  </div>
);

export default Page;
