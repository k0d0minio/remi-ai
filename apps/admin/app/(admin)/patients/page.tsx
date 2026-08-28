import type { Metadata } from "next";
import { Plus, Users } from "lucide-react";
import NextLink from "next/link";
import { listPatients, type PatientSort } from "@remi/services/server";
import {
  ageInYears,
  formatDate,
  patientStatuses,
  type PatientStatus,
} from "@remi/services/shared";
import { Button } from "@remi/ui";
import { Badge, EmptyState, Typography } from "@remi/ui/server";
import { RosterFilters } from "@/components/patients/roster-filters";
import {
  patientStatusIntents,
  patientStatusLabels,
} from "@/components/patients/vocabulary";
import { ensureDatabase } from "@/lib/database";

export const metadata: Metadata = {
  title: "Patients",
};

/** Reads the database on every hit — never prerendered. */
export const dynamic = "force-dynamic";

const sorts: readonly PatientSort[] = ["recent", "name", "created"];

const asStatus = (value: string | undefined): PatientStatus | "all" =>
  (patientStatuses as readonly string[]).includes(value ?? "")
    ? (value as PatientStatus)
    : "all";

const asSort = (value: string | undefined): PatientSort =>
  (sorts as readonly string[]).includes(value ?? "")
    ? (value as PatientSort)
    : "recent";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

/**
 * The patient roster — real rows from the database. Rows rather than a table:
 * they survive a phone screen, which is where Morgane opens this between
 * consultations.
 *
 * The filters live in the URL rather than in component state, so a filtered
 * roster is a link — and so the server does the filtering, which keeps the
 * whole page a server component with one small client island for the controls.
 */
const Patients = async ({ searchParams }: { searchParams: SearchParams }) => {
  // The page's own graph, not the layout's: the two render in parallel, so
  // the guard's registration cannot be relied on to have happened first.
  ensureDatabase();
  const params = await searchParams;
  const search = first(params.q) ?? "";
  const status = asStatus(first(params.status));
  const sort = asSort(first(params.sort));

  const patients = await listPatients({ search, status, sort });
  const filtered = search !== "" || status !== "all";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <Typography as="h1" size="2xl" weight="semibold">
            Patients
          </Typography>
          <Typography size="sm" tone="muted">
            Les profils sur lesquels reposent les consultations.
          </Typography>
        </div>

        <Button asChild>
          <NextLink href="/patients/new">
            <Plus aria-hidden="true" />
            Nouveau profil
          </NextLink>
        </Button>
      </div>

      <RosterFilters search={search} status={status} sort={sort} />

      {patients.length === 0 ? (
        <EmptyState
          icon={Users}
          title={filtered ? "Aucun profil ne correspond" : "Aucun profil"}
          body={
            filtered
              ? "Élargissez la recherche ou changez le filtre pour retrouver un profil."
              : "Créez un premier profil pour encoder des recommandations et partager le lien patient."
          }
          actions={
            filtered ? (
              <Button asChild variant="outline">
                <NextLink href="/patients">Réinitialiser les filtres</NextLink>
              </Button>
            ) : (
              <Button asChild>
                <NextLink href="/patients/new">
                  <Plus aria-hidden="true" />
                  Nouveau profil
                </NextLink>
              </Button>
            )
          }
        />
      ) : (
        <>
          <Typography size="xs" tone="muted" role="status">
            {patients.length}{" "}
            {patients.length === 1 ? "profil affiché" : "profils affichés"}
          </Typography>

          <ul className="flex flex-col gap-2">
            {patients.map((patient) => {
              const age = ageInYears(patient.birthDate);

              return (
                <li key={patient.id}>
                  <NextLink
                    href={`/patients/${patient.id}`}
                    className="border-border bg-card hover:bg-accent focus-visible:ring-ring/40 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border px-4 py-3 transition-colors duration-[--duration-fast] focus-visible:outline-none focus-visible:ring-[3px]"
                  >
                    <Typography as="span" size="sm" weight="medium">
                      {patient.pseudonym}
                    </Typography>
                    {patient.fullName ? (
                      <Typography as="span" size="sm" tone="muted">
                        {patient.fullName}
                      </Typography>
                    ) : null}
                    {age !== null ? (
                      <Typography as="span" size="xs" tone="muted">
                        {age} ans
                      </Typography>
                    ) : null}
                    <span className="ml-auto flex items-center gap-3">
                      <Typography as="span" size="xs" tone="muted">
                        modifié le {formatDate(patient.lastEditedAt)}
                      </Typography>
                      <Badge
                        variant={patientStatusIntents[patient.status]}
                        tone="subtle"
                        size="sm"
                      >
                        {patientStatusLabels[patient.status]}
                      </Badge>
                    </span>
                  </NextLink>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
};

export default Patients;
