import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Brain,
  Clock,
  Dna,
  ListChecks,
  MessageSquareDot,
  NotebookPen,
  Stethoscope,
  UtensilsCrossed,
} from "lucide-react";
import NextLink from "next/link";
import type { ComponentType } from "react";
import {
  formatDate,
  localePath,
  type Locale,
  type PersonalisationDimension,
  type Person,
  type Practitioner,
  type TherapeuticFrame,
} from "@remi/services/shared";
import { Button } from "@remi/ui";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  IconTile,
  Link,
  Progress,
  Separator,
  Typography,
} from "@remi/ui/server";
import { getSession } from "@/lib/auth/session";
import { getContent } from "@/lib/content";
import { fill } from "@/lib/content/fill";
import type { Content } from "@/lib/content/types";
import { getClient, getClientOverview } from "@/lib/queries/clients";
import { getFrame } from "@/lib/queries/frames";
import { getActivePlan, listSteps } from "@/lib/queries/plans";
import { getPractitioner } from "@/lib/queries/practitioners";
import { listSignalsForPerson } from "@/lib/queries/signals";
import { resolveLocale, type LocaleParams } from "@/lib/locale-params";

type Params = LocaleParams & { id: string };

export const generateMetadata = async ({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> => {
  const locale = await resolveLocale(params);
  const { id } = await params;
  const session = await getSession();
  const client = session ? await getClient(session.practitionerId, id) : null;

  return {
    title: client?.ok ? client.data.name : getContent(locale).clients.title,
  };
};

const dimensionIcons: Record<
  PersonalisationDimension,
  ComponentType<{ className?: string }>
> = {
  genotype: Dna,
  preceptes: Stethoscope,
  psychology: Brain,
  habits: UtensilsCrossed,
  rhythm: Clock,
};

const dimensionIntents = {
  genotype: "info",
  preceptes: "primary",
  psychology: "info",
  habits: "success",
  rhythm: "neutral",
} as const;

type DimensionCard = {
  key: PersonalisationDimension;
  source: string;
  points: string[];
};

/**
 * The five axes, built from what the app actually holds rather than from a list
 * written for the screen. Four come off the person's profile; the fifth is the
 * practitioner's own frame, which is why its source line names them and not her.
 */
const dimensionsOf = (
  person: Person,
  practitioner: Practitioner | null,
  frame: TherapeuticFrame | null,
  content: Content["clientDetail"]["dimensions"],
  clients: Content["clients"],
): DimensionCard[] => {
  const { points, sources, none } = content;
  const { profile } = person;
  const orNone = (values: readonly string[]) =>
    values.length === 0 ? none : values.join(", ");

  return [
    {
      key: "genotype",
      source: sources.genotype,
      points: profile.genotype
        ? profile.genotype.flatMap((marker) => [
            `${marker.gene} ${marker.variant}`,
            marker.note,
          ])
        : [none],
    },
    {
      key: "preceptes",
      source: fill(sources.frame, { practitioner: practitioner?.name ?? "" }),
      points: (frame?.principles ?? [])
        .filter((principle) => principle.active)
        .map((principle) => principle.title),
    },
    {
      key: "psychology",
      source: sources.questionnaire,
      points: [
        `${points.readiness} ${clients.readiness[profile.psychology.changeReadiness]}`,
        `${points.motivators} ${orNone(profile.psychology.motivators)}`,
        `${points.barriers} ${orNone(profile.psychology.barriers)}`,
      ],
    },
    {
      key: "habits",
      source: fill(sources.declared, { name: person.name }),
      points: [
        `${points.dislikes} ${orNone(profile.habits.dislikes)}`,
        `${points.allergies} ${orNone(profile.habits.allergies)}`,
        `${points.cooksFor} ${profile.habits.cooksFor}`,
      ],
    },
    {
      key: "rhythm",
      source: fill(sources.declared, { name: person.name }),
      points: [
        `${points.cooking} ${profile.rhythm.weekdayCookingMinutes} ${content.minutes}`,
        `${points.mealsOut} ${profile.rhythm.mealsOutPerWeek}`,
        `${points.shoppingDay} ${profile.rhythm.shoppingDay ?? none}`,
      ],
    },
  ];
};

const dateOrDash = (value: Date | null, locale: Locale) =>
  value ? formatDate(value, locale) : "—";

/**
 * "Personalisation across five dimensions" made concrete. Each axis is shown
 * with the source it came from, because a practitioner's first question about a
 * generated plan is where a given constraint came from — and the answer is
 * never "the AI decided".
 */
const Page = async ({ params }: { params: Promise<Params> }) => {
  const locale = await resolveLocale(params);
  const { id } = await params;
  const session = await getSession();
  if (!session) {
    notFound();
  }

  const client = await getClientOverview(session.practitionerId, id);
  if (!client.ok) {
    notFound();
  }

  const content = getContent(locale);
  const detail = content.clientDetail;
  const { person, adherence, currentStep, attention } = client.data;
  const practitioner = await getPractitioner(session.practitionerId);
  const frame = await getFrame(session.practitionerId);
  const plan = await getActivePlan(person.id);
  const steps = plan ? await listSteps(plan.id) : [];
  const signals = await listSignalsForPerson(person.id);
  const dimensions = dimensionsOf(
    person,
    practitioner,
    frame,
    detail.dimensions,
    content.clients,
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <Link
          as={NextLink}
          href={localePath(locale, "/clients")}
          variant="muted"
          className="flex w-fit items-center gap-1.5 text-sm"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          {detail.back}
        </Link>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <Typography as="h1" size="2xl" weight="semibold">
              {person.name}
            </Typography>
            <Typography size="sm" tone="muted">
              {fill(detail.lead, {
                since: formatDate(person.startedAt, locale),
                next: dateOrDash(person.nextConsultationAt, locale),
              })}
            </Typography>
          </div>
          <Button asChild>
            <NextLink href={localePath(locale, `/clients/${person.id}/plan`)}>
              <NotebookPen aria-hidden="true" />
              {detail.preparePlan}
            </NextLink>
          </Button>
        </div>
      </div>

      {attention ? (
        <Alert variant="warning">
          <AlertTitle>{detail.attention}</AlertTitle>
          <AlertDescription>{attention.summary}</AlertDescription>
        </Alert>
      ) : null}

      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <Typography as="h2" size="lg" weight="semibold">
            {detail.dimensions.title}
          </Typography>
          <Typography size="sm" tone="muted">
            {detail.dimensions.lead}
          </Typography>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {dimensions.map((dimension) => {
            const Icon = dimensionIcons[dimension.key];

            return (
              <Card
                key={dimension.key}
                elevation="flat"
                className="border-border h-full gap-4"
              >
                <CardHeader className="gap-3">
                  <IconTile intent={dimensionIntents[dimension.key]} size="sm">
                    <Icon />
                  </IconTile>
                  <CardTitle className="text-base">
                    {detail.dimensions.labels[dimension.key]}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <ul className="flex flex-col gap-1.5">
                    {dimension.points.map((point) => (
                      <li key={point}>
                        <Typography size="sm" tone="muted">
                          {point}
                        </Typography>
                      </li>
                    ))}
                  </ul>
                  <Typography size="xs" tone="muted" className="opacity-70">
                    {dimension.source}
                  </Typography>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <Separator />

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <Typography as="h2" size="lg" weight="semibold">
              {detail.progress.title}
            </Typography>
            {adherence === null ? null : (
              <Badge variant="neutral" tone="subtle" size="sm">
                {adherence} %
              </Badge>
            )}
          </div>

          {currentStep ? (
            <Card variant="success">
              <CardHeader>
                <Badge variant="success" tone="subtle" size="sm">
                  {fill(detail.progress.stepOf, {
                    order: currentStep.order,
                    total: steps.length,
                  })}
                </Badge>
                <CardTitle className="text-base">{currentStep.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <Typography size="sm" tone="muted">
                  {currentStep.why}
                </Typography>
                <div className="flex items-center gap-3">
                  <Progress
                    intent="success"
                    value={
                      (currentStep.completedDays / currentStep.targetDays) * 100
                    }
                    label={detail.progress.label}
                  />
                  <Typography as="span" size="sm" className="whitespace-nowrap">
                    {currentStep.completedDays} / {currentStep.targetDays}{" "}
                    {detail.progress.days}
                  </Typography>
                </div>
              </CardContent>
            </Card>
          ) : (
            <EmptyState
              icon={ListChecks}
              title={detail.progress.empty.title}
              body={detail.progress.empty.body}
            />
          )}
        </section>

        <section className="flex flex-col gap-4">
          <Typography as="h2" size="lg" weight="semibold">
            {detail.signals.title}
          </Typography>

          {signals.length === 0 ? (
            <EmptyState
              icon={MessageSquareDot}
              title={detail.signals.empty.title}
              body={detail.signals.empty.body}
            />
          ) : (
            <ul className="flex flex-col gap-2">
              {signals.map((signal) => (
                <li
                  key={signal.id}
                  className="border-border flex items-start justify-between gap-3 rounded-lg border p-3"
                >
                  <Typography size="sm" tone="muted">
                    {signal.summary}
                  </Typography>
                  <Typography
                    as="span"
                    size="xs"
                    tone="muted"
                    className="shrink-0 whitespace-nowrap"
                  >
                    {formatDate(signal.observedAt, locale)}
                  </Typography>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
};

export default Page;
