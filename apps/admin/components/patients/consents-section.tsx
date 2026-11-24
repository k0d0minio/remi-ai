import {
  careConsentGiven,
  consentSummaries,
  formatDate,
  isTermsConsentKey,
  legacyConsentVersion,
  type ConsentKey,
  type ConsentState,
  type ConsentSummary,
  type LatestConsent,
} from "@remi/services/shared";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Typography,
} from "@remi/ui/server";

/**
 * The state of the patient's consents on the practitioner's file (REM-43,
 * Morgane's question 5). Read-only: a consent and its withdrawal are the
 * patient's own acts, in the app. The page reads the rows with the actor's
 * scope (`consentsOf`, D-27) and gives them here.
 *
 * The CGV are accepted terms, not a consent (REM-207): their line says
 * « Acceptées », with the date and the version of the text. A patient with no
 * CGV row has no CGV line (`consentSummaries`).
 */

type Latest = Partial<Record<ConsentKey, LatestConsent>>;

const consentLabels: Record<ConsentKey, string> = {
  care: "Traitement des données pour l'accompagnement",
  genetic: "Traitement des données génétiques",
  cgv: "Conditions générales de vente",
};

/** The badge of accepted terms: the only decision they have. */
const TERMS_ACCEPTED = "Acceptées";

const stateLabels: Record<ConsentState, string> = {
  given: "Consentement donné",
  refused: "Consentement refusé",
  withdrawn: "Consentement retiré",
  none: "Non renseigné",
};

const stateIntents = {
  given: "success",
  refused: "neutral",
  withdrawn: "warning",
  none: "neutral",
} as const satisfies Record<ConsentState, string>;

const CARE_STOPPED =
  "REMI ne génère plus de suggestion ni de recette pour ce patient. L'espace du patient est en pause jusqu'à un nouveau consentement.";

/** « le 20 nov. 2026 · version 3 du texte ». Empty with no decision. */
const detailOf = (summary: ConsentSummary) => {
  if (!summary.decidedAt || !summary.textVersion) {
    return "";
  }
  const version =
    summary.textVersion === legacyConsentVersion
      ? "recueilli avant l'inscription, texte non enregistré"
      : `version ${summary.textVersion} du texte`;
  return `le ${formatDate(summary.decidedAt)} · ${version}`;
};

/** The one line of the folded row: the care consent, which the service needs. */
export const consentsSummaryLine = (latest: Latest) => {
  const care = consentSummaries(latest).find(
    (summary) => summary.key === "care",
  );
  return care ? stateLabels[care.state] : stateLabels.none;
};

type NoticeProps = {
  /** When the patient took the care consent back. */
  withdrawnAt: Date;
};

/**
 * The block that stays open above the section, folded or not: the patient
 * took the care consent back. The page shows it only for that state.
 */
export const ConsentWithdrawnNotice = ({ withdrawnAt }: NoticeProps) => (
  <Alert variant="warning">
    <AlertTitle>Consentement retiré</AlertTitle>
    <AlertDescription>
      Le patient a retiré son consentement au traitement de ses données le{" "}
      {formatDate(withdrawnAt)}. {CARE_STOPPED}
    </AlertDescription>
  </Alert>
);

type Props = {
  latest: Latest;
};

export const ConsentsSection = ({ latest }: Props) => {
  const summaries = consentSummaries(latest);
  return (
    <div className="flex flex-col gap-4">
      <ul className="divide-border flex flex-col divide-y">
        {summaries.map((summary) => {
          const detail = detailOf(summary);
          return (
            <li
              key={summary.key}
              className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0"
            >
              <Typography as="span" size="sm" weight="medium">
                {consentLabels[summary.key]}
              </Typography>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={stateIntents[summary.state]} tone="subtle">
                  {isTermsConsentKey(summary.key)
                    ? TERMS_ACCEPTED
                    : stateLabels[summary.state]}
                </Badge>
                {detail ? (
                  <Typography as="span" size="sm" tone="muted">
                    {detail}
                  </Typography>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
      {careConsentGiven(latest) ? null : (
        <Typography size="sm" tone="muted">
          {latest.care?.decision === "withdrawn"
            ? CARE_STOPPED
            : "Sans consentement au traitement des données, REMI ne génère ni suggestion ni recette pour ce patient."}
        </Typography>
      )}
      <Typography size="sm" tone="muted">
        Le patient donne et retire ses consentements dans son espace. Chaque
        décision est dans le journal.
      </Typography>
    </div>
  );
};
