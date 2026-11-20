import type { Metadata } from "next";
import { CircleAlert, Plus, UserPen, Users } from "lucide-react";
import NextLink from "next/link";
import {
  countMissingMandatoryFields,
  countOpenPatientChanges,
  listChallengeSignals,
  listOperators,
  listUnreadMessageCounts,
  patientListNames,
  patientListOf,
  type ChallengeSignal,
  type Operator,
} from "@remi/services/server";
import {
  appHref,
  canManageOperators,
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
import { MISSING_INFORMATION_ANCHOR } from "@/components/patients/file/missing-information";
import { PATIENT_CHANGES_ANCHOR } from "@/components/patients/file/patient-changes";
import { RosterFilters } from "@/components/patients/roster-filters";
import {
  messagesAwaitingLabel,
  missingInformationLabel,
  patientChangedLabel,
} from "@/components/patients/vocabulary";
import { requireActor, requireOperator } from "@/lib/auth/session";
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
 * A mark of the row that is a link of its own. It sits above the cover of the
 * row's main link. On a phone its touch target is 44 px high.
 */
const markLinkClass =
  "focus-visible:ring-ring relative z-10 inline-flex items-center rounded-md focus-visible:outline-none focus-visible:ring-[3px] max-sm:min-h-11";

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
  const actor = await requireActor();
  // An admin may list every file (story 3). A practitioner lists its own only,
  // whatever the URL says: the service applies the same rule.
  const isAdmin = canManageOperators(operator.role);
  const all = isAdmin && first(params.scope) === "all";
  // The practitioner's remembered order (story 5), not a URL parameter.
  const sort = isPatientListSort(operator.patientListSort)
    ? operator.patientListSort
    : defaultPatientListSort;

  const [
    patients,
    challengeSignals,
    unreadMessages,
    openChanges,
    missingMandatory,
    operators,
  ] = await Promise.all([
      patientListOf(actor, {
        search,
        status,
        sort,
        scope: all ? "all" : "mine",
      }),
      listChallengeSignals(actor),
      listUnreadMessageCounts(actor),
      // Stories 5 and 21: one pass for each mark, never one read for each row.
      countOpenPatientChanges(actor),
      countMissingMandatoryFields(actor),
      all ? listOperators() : Promise.resolve<readonly Operator[]>([]),
    ]);
  const practitionerNames = new Map(
    operators.map((account) => [account.id, account.name]),
  );
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

      {isAdmin ? (
        <nav aria-label="Dossiers listés" className="flex flex-wrap gap-2">
          <Button asChild size="sm" variant={all ? "outline" : "secondary"}>
            <NextLink href="/patients" aria-current={all ? undefined : "page"}>
              Mes patients
            </NextLink>
          </Button>
          <Button asChild size="sm" variant={all ? "secondary" : "outline"}>
            <NextLink
              href="/patients?scope=all"
              aria-current={all ? "page" : undefined}
            >
              Tous les praticiens
            </NextLink>
          </Button>
          {all ? (
            <Typography
              as="span"
              size="xs"
              tone="muted"
              className="self-center"
            >
              Le dossier d&apos;un patient suivi par un autre compte
              s&apos;ouvre en lecture seule, après un motif enregistré au
              journal.
            </Typography>
          ) : null}
        </nav>
      ) : null}

      <RosterFilters search={search} status={status} sort={sort} all={all} />

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
              const changed = openChanges.get(patient.id) ?? 0;
              const missing = missingMandatory.get(patient.id) ?? 0;

              // The row opens the file: the link of the name covers the row
              // (`after:inset-0`). The two marks are links of their own, above
              // that cover, because a link cannot hold another link.
              return (
                <li
                  key={patient.id}
                  className="border-border bg-card hover:bg-accent has-[a:focus-visible]:ring-ring relative flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border px-4 py-3 transition-colors duration-[--duration-fast] has-[a:focus-visible]:ring-[3px]"
                >
                    <NextLink
                      href={`/patients/${patient.id}`}
                      className="flex flex-wrap items-baseline gap-x-3 gap-y-1 after:absolute after:inset-0 after:rounded-lg focus-visible:outline-none"
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
                    </NextLink>
                    {all ? (
                      <Typography as="span" size="xs" tone="muted">
                        {patient.practitionerId === operator.id
                          ? "· mon patient"
                          : `· suivi par ${practitionerNames.get(patient.practitionerId) ?? "un compte supprimé"}`}
                      </Typography>
                    ) : null}
                    <span className="ml-auto flex flex-wrap items-center justify-end gap-x-3 gap-y-1">
                      {/* A patient change after the validation (story 21). It
                          opens the file at the list of the changes. */}
                      {changed > 0 ? (
                        <NextLink
                          href={`/patients/${patient.id}#${PATIENT_CHANGES_ANCHOR}`}
                          className={markLinkClass}
                        >
                          <Badge variant="warning" tone="solid" size="sm">
                            <UserPen aria-hidden="true" className="size-3.5" />
                            {patientChangedLabel(changed)}
                          </Badge>
                        </NextLink>
                      ) : null}
                      {/* The missing mandatory answers (story 5). It opens
                          the file at « Informations manquantes ». */}
                      {missing > 0 ? (
                        <NextLink
                          href={`/patients/${patient.id}#${MISSING_INFORMATION_ANCHOR}`}
                          className={markLinkClass}
                        >
                          <Badge variant="warning" tone="subtle" size="sm">
                            <CircleAlert
                              aria-hidden="true"
                              className="size-3.5"
                            />
                            {missingInformationLabel(missing)}
                          </Badge>
                        </NextLink>
                      ) : null}
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
