import type { Metadata } from "next";
import {
  Activity,
  ArrowRight,
  CircleAlert,
  HeartCrack,
  MailCheck,
  PartyPopper,
} from "lucide-react";
import NextLink from "next/link";
import { Button } from "@remi/ui";
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Progress,
  Separator,
  Typography,
} from "@remi/ui/server";
import { clients } from "@/lib/mock/clients";
import { signals } from "@/lib/mock/signals";

export const metadata: Metadata = { title: "Ma pratique" };

const severityVariant = {
  attention: "warning",
  neutral: "neutral",
  positive: "success",
} as const;

const kinds = {
  adherence: { label: "Assiduité", icon: Activity },
  difficulty: { label: "Difficulté", icon: HeartCrack },
  engagement: { label: "Engagement", icon: MailCheck },
  win: { label: "Réussite", icon: PartyPopper },
} as const;

/**
 * The answer to "puis vous ne voyez plus rien". It opens on who needs attention
 * rather than on a count of clients, because the count is not the thing a
 * practitioner is missing between two consultations.
 */
const Page = () => {
  const needingAttention = clients.filter((client) => client.attention);
  const active = clients.filter((client) => client.status === "active");
  const averageAdherence = Math.round(
    active.reduce((total, client) => total + client.adherence, 0) /
      active.length,
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <Typography as="h1" size="2xl" weight="semibold">
          Ma pratique
        </Typography>
        <Typography tone="muted">
          Ce qui s'est passé depuis vos dernières consultations.
        </Typography>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card variant="warning">
          <CardHeader>
            <CardDescription>À regarder avant la consultation</CardDescription>
            <CardTitle className="text-3xl">
              {needingAttention.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Accompagnements actifs</CardDescription>
            <CardTitle className="text-3xl">{active.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Assiduité moyenne</CardDescription>
            <CardTitle className="text-3xl">{averageAdherence} %</CardTitle>
          </CardHeader>
          <CardContent>
            <Progress
              value={averageAdherence}
              label="Assiduité moyenne"
              size="sm"
            />
          </CardContent>
        </Card>
      </div>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <Typography as="h2" size="lg" weight="semibold">
            Ce qui demande votre attention
          </Typography>
          <Button asChild variant="ghost" size="sm">
            <NextLink href="/practitioner/clients">
              Toutes les personnes
              <ArrowRight aria-hidden="true" />
            </NextLink>
          </Button>
        </div>

        <div className="flex flex-col gap-3">
          {needingAttention.map((client) => (
            <Card key={client.id} elevation="flat" className="border-border">
              <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <Typography as="span" weight="medium">
                      {client.name}
                    </Typography>
                    <Badge variant="warning" tone="subtle" size="sm">
                      <CircleAlert aria-hidden="true" />
                      {client.adherence} %
                    </Badge>
                  </div>
                  <Typography size="sm" tone="muted">
                    {client.attention}
                  </Typography>
                </div>
                <Button asChild variant="outline" size="sm">
                  <NextLink href={`/practitioner/clients/${client.id}`}>
                    Ouvrir la fiche
                  </NextLink>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator />

      <section className="flex flex-col gap-4">
        <Typography as="h2" size="lg" weight="semibold">
          Depuis la dernière fois
        </Typography>

        <ul className="flex flex-col gap-3">
          {signals.map((signal) => {
            const kind = kinds[signal.kind];
            const KindIcon = kind.icon;

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
                  {kind.label}
                </Badge>
                <div className="flex min-w-0 flex-col gap-0.5">
                  <Typography as="span" size="sm" weight="medium">
                    {signal.clientName}
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
                  {signal.when}
                </Typography>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
};

export default Page;
