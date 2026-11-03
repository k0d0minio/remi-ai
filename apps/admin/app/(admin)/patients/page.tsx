import type { Metadata } from "next";
import { Plus, Users } from "lucide-react";
import NextLink from "next/link";
import {
  listChallengeSignals,
  listUnreadMessageCounts,
  patientListNames,
  patientListOf,
  type ChallengeSignal,
} from "@remi/services/server";
import {
  appHref,
  defaultPatientListSort,
  fileStatusLabels,
  formatDate,
  isPatientListSort,
  patientStatuses,
  type FileStatus,
  type PatientStatus,
} from "@remi/services/shared";
import { Button } from "@remi/ui";
import { Badge, EmptyState, Typography, type Intent } from "@remi/ui/server";
import { SignupLink } from "@/components/operators/signup-link";
import { RosterFilters } from "@/components/patients/roster-filters";
import { messagesAwaitingLabel } from "@/components/patients/vocabulary";
import { requireOperator } from "@/lib/auth/session";
import { ensureDatabase } from "@/lib/database";

export const metadata: Metadata = {
  title: "Patients",
};

/** Reads the database on every hit — never prerendered. */
export const dynamic = "force-dynamic";

const asStatus = (value: string | undefined): PatientStatus | "all" =>
  (patientStatuses as readonly string[]).includes(value ?? "")
    ? (value as PatientStatus)
    : "all";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

/**
 * The challenge signal a row carries — her § 7: « voir lorsqu'un challenge est
 * validé ; voir lorsqu'un consultant indique qu'il est prêt pour le challenge
 * suivant ». « Prêt(e) » is the one that asks her to act, so it takes the
 * louder intent.
 */
const challengeSignalBadges: Record<
  ChallengeSignal,
  { label: string; intent: Intent; tone: "subtle" | "solid" }
> = {
  ready_for_next: {
    label: "Prêt(e) pour le prochain",
    intent: "info",
    tone: "solid",
  },
  acquired: { label: "Challenge acquis", intent: "success", tone: "subtle" },
};

/**
 * The tone of each file status on the row. The words come from the one map,
 * `fileStatusLabels` (D-31). The two statuses that wait on the practitioner
 * read as `info`.
 */
const fileStatusIntents: Record<FileStatus, Intent> = {
  to_complete: "warning",
  ready: "info",
  to_validate: "info",
  active: "success",
};

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
  const operator = await requireOperator();
  // The practitioner's remembered order (story 5), not a URL parameter.
  const sort = isPatientListSort(operator.patientListSort)
    ? operator.patientListSort
    : defaultPatientListSort;

  const [patients, challengeSignals, unreadMessages] = await Promise.all([
    patientListOf(operator.id, { search, status, sort }),
    listChallengeSignals(),
    listUnreadMessageCounts(),
  ]);
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
            Nouveau patient
          </NextLink>
        </Button>
      </div>

      <section
        aria-labelledby="signup-link-title"
        className="border-border flex flex-col gap-2 rounded-lg border p-4"
      >
        <Typography id="signup-link-title" as="h2" size="sm" weight="semibold">
          Mon lien d&apos;inscription
        </Typography>
        <SignupLink
          url={appHref("web", `/inscription/${operator.signupLinkToken}`, "fr")}
        />
      </section>

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
                  Nouveau patient
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
              const { nom, prenom } = patientListNames(patient);
              const signal = challengeSignals.get(patient.id);
              const challengeBadge = signal
                ? challengeSignalBadges[signal]
                : null;
              const unread = unreadMessages.get(patient.id) ?? 0;

              return (
                <li key={patient.id}>
                  <NextLink
                    href={`/patients/${patient.id}`}
                    className="border-border bg-card hover:bg-accent focus-visible:ring-ring/40 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border px-4 py-3 transition-colors duration-[--duration-fast] focus-visible:outline-none focus-visible:ring-[3px]"
                  >
                    <Typography as="span" size="sm" weight="medium">
                      {nom}
                    </Typography>
                    {prenom ? (
                      <Typography as="span" size="sm">
                        {prenom}
                      </Typography>
                    ) : null}
                    {patient.pseudonym !== nom ? (
                      <Typography as="span" size="xs" tone="muted">
                        {patient.pseudonym}
                      </Typography>
                    ) : null}
                    <span className="ml-auto flex items-center gap-3">
                      {challengeBadge ? (
                        <Badge
                          variant={challengeBadge.intent}
                          tone={challengeBadge.tone}
                          size="sm"
                        >
                          {challengeBadge.label}
                        </Badge>
                      ) : null}
                      {/* A patient writing is the signal she acts on, so it
                          reads as loud as « prêt(e) ». */}
                      {unread > 0 ? (
                        <Badge variant="info" tone="solid" size="sm">
                          {messagesAwaitingLabel(unread)}
                        </Badge>
                      ) : null}
                      <Typography as="span" size="xs" tone="muted">
                        {patient.consultationDate
                          ? `RDV le ${formatDate(patient.consultationDate)}`
                          : "Pas de rendez-vous"}
                      </Typography>
                      <Badge
                        variant={fileStatusIntents[patient.fileStatus]}
                        tone="subtle"
                        size="sm"
                      >
                        {fileStatusLabels[patient.fileStatus].fr}
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
