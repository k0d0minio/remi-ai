import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Activity, ArrowLeft, ArrowRight, Dna } from "lucide-react";
import NextLink from "next/link";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  IconTile,
  Link,
  Separator,
  Typography,
} from "@remi/ui/server";
import { BiomarkerTable } from "@/components/biomarker-table";
import { clients } from "@/lib/mock/clients";
import {
  biomarkers,
  genotypeCaveat,
  genotypeMarkers,
  genotypeSource,
  labPanels,
  labsClientId,
  resultDrivenSteps,
} from "@/lib/mock/labs";

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
  return { title: `Biologie · ${client?.name ?? "Personne accompagnée"}` };
};

/**
 * The screen a functional medicine practice is actually run from. A single
 * dosage is a number; three dated panels are a direction, and the direction is
 * what a plan is adjusted against — so the panels are columns of one table
 * rather than three documents to open in turn.
 *
 * The second half is the part no laboratory portal has: what each result
 * changed. A marker that motivated nothing did not need to be measured, and a
 * step whose reason nobody can name is a step nobody defends at the next
 * consultation.
 */
const Page = async ({ params }: { params: Promise<Params> }) => {
  const { id } = await params;
  const client = clients.find((candidate) => candidate.id === id);
  if (!client) {
    notFound();
  }

  /** Only Camille has panels in the fixtures — the others show the empty case. */
  const hasPanels = client.id === labsClientId;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <Link
          as={NextLink}
          href={`/practitioner/clients/${client.id}`}
          variant="muted"
          className="flex w-fit items-center gap-1.5 text-sm"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          {client.name}
        </Link>

        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <Typography as="h1" size="2xl" weight="semibold">
              Biologie et marqueurs
            </Typography>
            <Badge variant="info" tone="subtle" size="sm">
              à venir
            </Badge>
          </div>
          <Typography tone="muted">
            {client.name} · les dosages, ce qu'ils ont changé dans le plan, et
            le terrain génétique qui en module la lecture.
          </Typography>
        </div>
      </div>

      {hasPanels ? (
        <>
          <section className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <Typography as="h2" size="lg" weight="semibold">
                Prélèvements
              </Typography>
              <Typography size="sm" tone="muted">
                Trois panels sur cinq mois, tous du même laboratoire — un
                changement de laboratoire déplacerait les intervalles.
              </Typography>
            </div>

            <ol className="grid gap-3 sm:grid-cols-3">
              {labPanels.map((panel, index) => (
                <li
                  key={panel.id}
                  className="border-border flex flex-col gap-1 rounded-lg border p-3"
                >
                  <div className="flex items-center gap-2">
                    <Typography as="span" size="sm" weight="medium">
                      {panel.date}
                    </Typography>
                    {index === labPanels.length - 1 ? (
                      <Badge variant="info" tone="subtle" size="sm">
                        le plus récent
                      </Badge>
                    ) : null}
                  </div>
                  <Typography as="span" size="xs" tone="muted">
                    {panel.lab}
                  </Typography>
                </li>
              ))}
            </ol>
          </section>

          <section className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <Typography as="h2" size="lg" weight="semibold">
                Marqueurs biologiques
              </Typography>
              <Typography size="sm" tone="muted">
                Hors intervalle n'est pas la même chose qu'en dégradation :
                ferritine et homocystéine sont encore hors cible et remontent
                dans le bon sens, la glycémie est la seule qui recule.
              </Typography>
            </div>

            <BiomarkerTable panels={labPanels} biomarkers={biomarkers} />
          </section>

          <Separator />

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <Typography as="h2" size="lg" weight="semibold">
                  Des résultats aux étapes
                </Typography>
                <Typography size="sm" tone="muted">
                  Le fil entre un dosage et ce que {client.name} a reçu à faire.
                </Typography>
              </div>

              <ul className="flex flex-col gap-3">
                {resultDrivenSteps.map((link) => (
                  <li key={link.id}>
                    <Card
                      elevation="flat"
                      className="border-border h-full gap-3"
                    >
                      <CardHeader className="gap-2">
                        <CardDescription className="flex flex-wrap items-center gap-2">
                          <Badge variant="neutral" tone="subtle" size="sm">
                            {link.marker}
                          </Badge>
                          <span className="tabular-nums">{link.measured}</span>
                        </CardDescription>
                        <CardTitle className="text-base">
                          <span className="text-muted-foreground font-normal">
                            Ce résultat a motivé l'étape :{" "}
                          </span>
                          « {link.step} »
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Typography size="sm" tone="muted">
                          {link.rationale}
                        </Typography>
                      </CardContent>
                    </Card>
                  </li>
                ))}
              </ul>

              <Link
                as={NextLink}
                href={`/practitioner/clients/${client.id}/plan`}
                variant="primary"
                className="flex w-fit items-center gap-1 text-sm"
              >
                Voir le plan en cours
                <ArrowRight aria-hidden="true" className="size-3.5" />
              </Link>
            </section>

            <section className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <Typography as="h2" size="lg" weight="semibold">
                  Marqueurs génotypiques
                </Typography>
                <Typography size="sm" tone="muted">
                  {genotypeSource}
                </Typography>
              </div>

              <Card elevation="flat" className="border-border gap-4">
                <CardHeader className="gap-3">
                  <IconTile intent="info" size="sm">
                    <Dna />
                  </IconTile>
                  <CardTitle className="text-base">
                    Ce que le génotype module
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  <ul className="flex flex-col gap-3">
                    {genotypeMarkers.map((marker) => (
                      <li key={marker.gene} className="flex flex-col gap-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Typography as="span" size="sm" weight="medium">
                            {marker.gene}
                          </Typography>
                          <Badge variant="info" tone="subtle" size="sm">
                            {marker.variant}
                          </Badge>
                        </div>
                        <Typography size="sm" tone="muted">
                          {marker.note}
                        </Typography>
                      </li>
                    ))}
                  </ul>

                  <Alert variant="info">
                    <AlertTitle>Un génotype ne se lit jamais seul</AlertTitle>
                    <AlertDescription>{genotypeCaveat}</AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </section>
          </div>
        </>
      ) : (
        <EmptyState
          icon={Activity}
          title="Aucun bilan importé"
          body={`Aucun panel biologique n'a été rattaché à ${client.name}. Les dosages arrivent du laboratoire, pas de REMI : tant qu'aucun n'a été déposé, il n'y a rien à lire ici.`}
        />
      )}
    </div>
  );
};

export default Page;
