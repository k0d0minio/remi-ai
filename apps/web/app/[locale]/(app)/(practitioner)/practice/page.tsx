import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  Activity,
  ArrowRight,
  CircleAlert,
  HeartCrack,
  MailCheck,
  PartyPopper,
  Sparkles,
} from "lucide-react";
import NextLink from "next/link";
import type { ComponentType } from "react";
import {
  formatDate,
  localePath,
  type SignalKind,
  type SignalSeverity,
} from "@remi/services/shared";
import {
  Badge,
  Card,
  CardContent,
  EmptyState,
  Link,
  Separator,
  StatRow,
  Typography,
} from "@remi/ui/server";
import { getSession } from "@/lib/auth/session";
import { getContent } from "@/lib/content";
import { listClientOverviews } from "@/lib/queries/clients";
import { listSignals } from "@/lib/queries/signals";
import { resolveLocale, type LocaleParams } from "@/lib/locale-params";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<LocaleParams>;
}): Promise<Metadata> => {
  const locale = await resolveLocale(params);
  return { title: getContent(locale).practice.title };
};

const severityVariant: Record<
  SignalSeverity,
  "warning" | "neutral" | "success"
> = {
  attention: "warning",
  neutral: "neutral",
  positive: "success",
};

const kindIcons: Record<SignalKind, ComponentType<{ className?: string }>> = {
  adherence: Activity,
  difficulty: HeartCrack,
  engagement: MailCheck,
  win: PartyPopper,
};

/**
 * The answer to "and then you go blind". It opens on who needs attention rather
 * than on a count of clients, because the count is not what a practitioner is
 * missing between two consultations.
 */
const Page = async ({ params }: { params: Promise<LocaleParams> }) => {
  const locale = await resolveLocale(params);
  const session = await getSession();
  if (!session) {
    notFound();
  }

  const content = getContent(locale).practice;
  const overviews = await listClientOverviews(session.practitionerId);
  const signals = await listSignals(session.practitionerId);
  const names = new Map(
    overviews.map(({ person }) => [person.id, person.name]),
  );

  const needingAttention = overviews.filter((overview) => overview.attention);
  const active = overviews.filter(
    (overview) => overview.person.status === "active",
  );
  const measured = active.filter((overview) => overview.adherence !== null);
  const averageAdherence =
    measured.length === 0
      ? null
      : Math.round(
          measured.reduce(
            (total, overview) => total + (overview.adherence ?? 0),
            0,
          ) / measured.length,
        );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <Typography as="h1" size="2xl" weight="semibold">
          {content.title}
        </Typography>
        <Typography tone="muted">{content.lead}</Typography>
      </div>

      <StatRow
        className="border-border rounded-xl border p-6"
        stats={[
          { value: needingAttention.length, label: content.stats.attention },
          { value: active.length, label: content.stats.active },
          {
            value: averageAdherence === null ? "—" : `${averageAdherence} %`,
            label: content.stats.adherence,
          },
        ]}
      />

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <Typography as="h2" size="lg" weight="semibold">
            {content.attention.title}
          </Typography>
          <Link
            as={NextLink}
            href={localePath(locale, "/clients")}
            variant="standalone"
            className="text-sm"
          >
            {content.attention.allClients}
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>

        {needingAttention.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            intent="success"
            title={content.attention.empty.title}
            body={content.attention.empty.body}
          />
        ) : (
          <div className="flex flex-col gap-3">
            {needingAttention.map(({ person, adherence, attention }) => (
              <Card key={person.id} elevation="flat" className="border-border">
                <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <Typography as="span" weight="medium">
                        {person.name}
                      </Typography>
                      {adherence === null ? null : (
                        <Badge variant="warning" tone="subtle" size="sm">
                          <CircleAlert aria-hidden="true" />
                          {adherence} %
                        </Badge>
                      )}
                    </div>
                    <Typography size="sm" tone="muted">
                      {attention?.summary}
                    </Typography>
                  </div>
                  <Link
                    as={NextLink}
                    href={localePath(locale, `/clients/${person.id}`)}
                    variant="standalone"
                    className="shrink-0 text-sm"
                  >
                    {content.attention.open}
                    <ArrowRight aria-hidden="true" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <Separator />

      <section className="flex flex-col gap-4">
        <Typography as="h2" size="lg" weight="semibold">
          {content.signals.title}
        </Typography>

        {signals.length === 0 ? (
          <EmptyState
            icon={Activity}
            title={content.signals.empty.title}
            body={content.signals.empty.body}
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {signals.map((signal) => {
              const KindIcon = kindIcons[signal.kind];

              return (
                <li
                  key={signal.id}
                  className="border-border flex items-start gap-3 rounded-lg border p-4"
                >
                  <Badge
                    variant={severityVariant[signal.severity]}
                    tone="subtle"
                    size="sm"
                  >
                    <KindIcon aria-hidden="true" />
                    {content.signals.kinds[signal.kind]}
                  </Badge>
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <Typography as="span" size="sm" weight="medium">
                      {names.get(signal.personId)}
                    </Typography>
                    <Typography size="sm" tone="muted">
                      {signal.summary}
                    </Typography>
                  </div>
                  <Typography
                    as="span"
                    size="xs"
                    tone="muted"
                    className="ml-auto shrink-0 whitespace-nowrap"
                  >
                    {formatDate(signal.observedAt, locale)}
                  </Typography>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
};

export default Page;
