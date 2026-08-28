import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  Activity,
  ArrowLeft,
  Brain,
  Camera,
  Clock,
  Dna,
  NotebookPen,
  Stethoscope,
  UtensilsCrossed,
} from "lucide-react";
import NextLink from "next/link";
import type { ComponentType } from "react";
import { Button, Tabs, TabsContent, TabsList, TabsTrigger } from "@remi/ui";
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
import { JournalTimeline } from "@/components/journal-timeline";
import { clients, dimensions } from "@/lib/mock/clients";
import { journalEntries } from "@/lib/mock/journal";
import { signals } from "@/lib/mock/signals";
import { steps } from "@/lib/mock/steps";
import type { Dimension } from "@/lib/mock/types";

type Params = { id: string };

export const generateStaticParams = (): Params[] =>
  clients.map((client) => ({ id: client.id }));

export const generateMetadata = async ({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> => {
  const { id } = await params;
  const client = clients.find((candidate) => candidate.id === id);
  return { title: client?.name ?? "Personne accompagnée" };
};

const dimensionIcons: Record<
  Dimension["key"],
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

/**
 * "Personnalisation à 360°" made concrete. The five dimensions are shown with
 * their source line, because a practitioner's first question about a generated
 * plan is where a given constraint came from — and the answer is never "the AI
 * decided".
 *
 * The Journal tab is the same logged meals the patient sees on `/patient/journal`,
 * read from this side. It is one fixture rendered twice rather than a
 * practitioner-flavoured copy: the two surfaces disagreeing about what was
 * eaten is the failure mode this feature cannot afford.
 */
const Page = async ({ params }: { params: Promise<Params> }) => {
  const { id } = await params;
  const client = clients.find((candidate) => candidate.id === id);
  if (!client) {
    notFound();
  }

  const clientSignals = signals.filter(
    (signal) => signal.clientName === client.name,
  );
  const currentStep = steps.find((step) => step.status === "current");
  /** Only Camille has a journal in the fixtures — the others show the empty case. */
  const clientJournal = client.id === "camille" ? journalEntries : [];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <Link
          as={NextLink}
          href="/practitioner/clients"
          variant="muted"
          className="flex w-fit items-center gap-1.5 text-sm"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Personnes accompagnées
        </Link>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <Typography as="h1" size="2xl" weight="semibold">
              {client.name}
            </Typography>
            <Typography size="sm" tone="muted">
              Accompagnée depuis le {client.since} · prochaine consultation le{" "}
              {client.nextConsultation}
            </Typography>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button asChild variant="outline">
              <NextLink href={`/practitioner/clients/${client.id}/labs`}>
                <Activity aria-hidden="true" />
                Biologie et marqueurs
                <Badge variant="info" tone="subtle" size="sm">
                  à venir
                </Badge>
              </NextLink>
            </Button>
            <Button asChild>
              <NextLink href={`/practitioner/clients/${client.id}/plan`}>
                <NotebookPen aria-hidden="true" />
                Préparer le plan
              </NextLink>
            </Button>
          </div>
        </div>
      </div>

      {client.attention ? (
        <Alert variant="warning">
          <AlertTitle>Point de blocage</AlertTitle>
          <AlertDescription>{client.attention}</AlertDescription>
        </Alert>
      ) : null}

      <Tabs defaultValue="suivi">
        <TabsList>
          <TabsTrigger value="suivi">Suivi</TabsTrigger>
          <TabsTrigger value="journal">
            Journal
            <Badge variant="info" tone="subtle" size="sm">
              à venir
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="suivi" className="flex flex-col gap-8">
          <section className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <Typography as="h2" size="lg" weight="semibold">
                Personnalisation à 360°
              </Typography>
              <Typography size="sm" tone="muted">
                Les cinq axes sur lesquels le plan est adapté. Le deuxième vient
                de votre cadre, pas d'elle.
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
                      <IconTile
                        intent={dimensionIntents[dimension.key]}
                        size="sm"
                      >
                        <Icon />
                      </IconTile>
                      <CardTitle className="text-base">
                        {dimension.label}
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
              <Typography as="h2" size="lg" weight="semibold">
                Où elle en est
              </Typography>

              {currentStep ? (
                <Card variant="success">
                  <CardHeader>
                    <Badge variant="success" tone="subtle" size="sm">
                      Étape {currentStep.order} sur {steps.length}
                    </Badge>
                    <CardTitle className="text-base">
                      {currentStep.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3">
                    <Typography size="sm" tone="muted">
                      {currentStep.why}
                    </Typography>
                    <div className="flex items-center gap-3">
                      <Progress
                        intent="success"
                        value={
                          (currentStep.completedDays / currentStep.targetDays) *
                          100
                        }
                        label="Jours appliqués"
                      />
                      <Typography
                        as="span"
                        size="sm"
                        className="whitespace-nowrap"
                      >
                        {currentStep.completedDays} / {currentStep.targetDays}{" "}
                        jours
                      </Typography>
                    </div>
                  </CardContent>
                </Card>
              ) : null}
            </section>

            <section className="flex flex-col gap-4">
              <Typography as="h2" size="lg" weight="semibold">
                Signaux depuis la dernière consultation
              </Typography>

              <ul className="flex flex-col gap-2">
                {clientSignals.map((signal) => (
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
                      {signal.when}
                    </Typography>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </TabsContent>

        <TabsContent value="journal" className="flex flex-col gap-6">
          <div className="flex flex-col gap-1">
            <Typography as="h2" size="lg" weight="semibold">
              Repas photographiés
            </Typography>
            <Typography size="sm" tone="muted">
              Ce qui a été mangé entre deux consultations, avec ce que la
              reconnaissance a lu et le degré de certitude qu'elle s'accorde.
              Une correspondance n'est pas une validation clinique : c'est un
              rapprochement avec vos recommandations, à trancher par vous.
            </Typography>
          </div>

          {clientJournal.length > 0 ? (
            <JournalTimeline
              entries={clientJournal}
              viewer="practitioner"
              dayHeading="h3"
            />
          ) : (
            <EmptyState
              icon={Camera}
              title="Aucun repas photographié"
              body={`${client.name} n'a encore rien ajouté à son journal. Rien à en conclure : le journal est facultatif, et son absence n'est pas un signal.`}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Page;
