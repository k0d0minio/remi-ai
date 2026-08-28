import type { Metadata } from "next";
import { Plus } from "lucide-react";
import NextLink from "next/link";
import {
  listPatientRecommendations,
  listPatients,
} from "@remi/services/server";
import { formatDate, type PatientStatus } from "@remi/services/shared";
import { Button } from "@remi/ui";
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Typography,
} from "@remi/ui/server";
import {
  patientStatusIntents,
  patientStatusLabels,
} from "@/components/patients/vocabulary";
import { ensureDatabase } from "@/lib/database";

export const metadata: Metadata = {
  title: "Accueil",
};

/** Reads the database on every hit — never prerendered. */
export const dynamic = "force-dynamic";

/** How many rows each list shows before it stops being a glance. */
const PREVIEW = 5;

/**
 * The console's landing page, on real rows.
 *
 * It answers two questions and no others: how the cohort stands, and which
 * profiles are waiting on Morgane. The dashboard that used to live here showed
 * uptime tiles and an attention feed, all of it fixture data — a page that
 * invents its own numbers is worse than no page, because it gets believed.
 */
const Accueil = async () => {
  ensureDatabase();
  const patients = await listPatients({ sort: "recent" });

  // One query per patient, at a roster of ten to fifteen. Worth revisiting the
  // day it is not — the seam would need a count-by-parent to do better.
  const withCounts = await Promise.all(
    patients.map(async (patient) => ({
      patient,
      recommendations: (await listPatientRecommendations(patient.id)).length,
    })),
  );

  const active = patients.filter((patient) => patient.status === "active");
  const paused = patients.filter((patient) => patient.status === "paused");
  const empty = withCounts.filter((entry) => entry.recommendations === 0);
  const neverOpened = patients.filter(
    (patient) =>
      patient.status === "active" && patient.linkLastOpenedAt === null,
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <Typography as="h1" size="2xl" weight="semibold">
            Accueil
          </Typography>
          <Typography size="sm" tone="muted">
            Où en est le suivi, et ce qui attend une action.
          </Typography>
        </div>

        <Button asChild>
          <NextLink href="/patients/new">
            <Plus aria-hidden="true" />
            Nouveau profil
          </NextLink>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Tile label="Profils" value={patients.length} />
        <Tile label="Suivis en cours" value={active.length} />
        <Tile label="En pause" value={paused.length} />
        <Tile label="Sans recommandation" value={empty.length} />
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>À encoder</CardTitle>
            <CardDescription>
              Profils sans aucune recommandation — le lien patient leur montre
              une page vide.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {empty.length === 0 ? (
              <Typography size="sm" tone="muted">
                Tous les profils ont au moins une recommandation.
              </Typography>
            ) : (
              <PatientLinks
                rows={empty.slice(0, PREVIEW).map((entry) => ({
                  id: entry.patient.id,
                  pseudonym: entry.patient.pseudonym,
                  status: entry.patient.status,
                  meta: `créé le ${formatDate(entry.patient.createdAt)}`,
                }))}
                remaining={Math.max(empty.length - PREVIEW, 0)}
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lien jamais ouvert</CardTitle>
            <CardDescription>
              Suivis en cours dont le lien patient n&apos;a pas encore été
              consulté.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {neverOpened.length === 0 ? (
              <Typography size="sm" tone="muted">
                Chaque suivi en cours a ouvert son lien au moins une fois.
              </Typography>
            ) : (
              <PatientLinks
                rows={neverOpened.slice(0, PREVIEW).map((patient) => ({
                  id: patient.id,
                  pseudonym: patient.pseudonym,
                  status: patient.status,
                  meta: `créé le ${formatDate(patient.createdAt)}`,
                }))}
                remaining={Math.max(neverOpened.length - PREVIEW, 0)}
              />
            )}
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Modifiés récemment</CardTitle>
            <CardDescription>
              Les profils sur lesquels vous avez travaillé en dernier.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {patients.length === 0 ? (
              <Typography size="sm" tone="muted">
                Aucun profil pour le moment.
              </Typography>
            ) : (
              <PatientLinks
                rows={patients.slice(0, PREVIEW).map((patient) => ({
                  id: patient.id,
                  pseudonym: patient.pseudonym,
                  status: patient.status,
                  meta: `modifié le ${formatDate(patient.lastEditedAt)}`,
                }))}
                remaining={Math.max(patients.length - PREVIEW, 0)}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const Tile = ({ label, value }: { label: string; value: number }) => (
  <Card elevation="flat" className="gap-0 py-5">
    <CardContent className="flex flex-col gap-1">
      <Typography variant="eyebrow" tone="muted" as="span">
        {label}
      </Typography>
      <Typography
        as="span"
        size="2xl"
        weight="semibold"
        className="tabular-nums"
      >
        {value}
      </Typography>
    </CardContent>
  </Card>
);

type Row = {
  id: string;
  pseudonym: string;
  status: PatientStatus;
  meta: string;
};

const PatientLinks = ({
  rows,
  remaining,
}: {
  rows: readonly Row[];
  remaining: number;
}) => (
  <div className="flex flex-col gap-2">
    <ul className="flex flex-col gap-1">
      {rows.map((row) => (
        <li key={row.id}>
          <NextLink
            href={`/patients/${row.id}`}
            className="hover:bg-accent focus-visible:ring-ring/40 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-md px-2 py-1.5 transition-colors duration-[--duration-fast] focus-visible:outline-none focus-visible:ring-[3px]"
          >
            <Typography as="span" size="sm" weight="medium">
              {row.pseudonym}
            </Typography>
            <span className="ml-auto flex items-center gap-2">
              <Typography as="span" size="xs" tone="muted">
                {row.meta}
              </Typography>
              <Badge
                variant={patientStatusIntents[row.status]}
                tone="subtle"
                size="sm"
              >
                {patientStatusLabels[row.status]}
              </Badge>
            </span>
          </NextLink>
        </li>
      ))}
    </ul>

    {remaining > 0 ? (
      <Typography size="xs" tone="muted">
        et {remaining} de plus —{" "}
        <NextLink href="/patients" className="underline">
          voir tous les profils
        </NextLink>
      </Typography>
    ) : null}
  </div>
);

export default Accueil;
