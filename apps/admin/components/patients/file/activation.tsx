import type { ReactNode } from "react";
import { getActivationRecap, getCareActivationDate } from "@remi/services/server";
import {
  calculationKindLabels,
  canActivate,
  formatDate,
  formatNumber,
  type ActivationBlocker,
  type ActivationRecap,
  type CalculationKind,
  type PatientProfile,
} from "@remi/services/shared";
import { Typography } from "@remi/ui/server";
import { ActivateCareButton } from "@/components/patients/file/activate-care-button";
import { countLabel } from "@/components/patients/file/count-label";
import { fieldAnchor } from "@/components/patients/file/missing-information";
import { requireActor } from "@/lib/auth/session";

type Props = {
  patient: Pick<PatientProfile, "id">;
  /** An admin's open of another practitioner's file: the recap, no button. */
  readOnly: boolean;
};

/** The same units as the rows of « Calculs ». The BMI has none. */
const calculationUnits: Record<CalculationKind, string> = {
  bmi: "",
  protein: " g/jour",
  energy: " kcal/jour",
};

type RecapEviction = ActivationRecap["evictions"][number];

/** « du 1 déc. 2026 au 31 janv. 2027 », « durable », or what is missing. */
const periodOf = (eviction: RecapEviction) => {
  if (eviction.periodStart && eviction.periodEnd) {
    return `du ${formatDate(eviction.periodStart)} au ${formatDate(eviction.periodEnd)}`;
  }
  if (eviction.periodStart) {
    return `à partir du ${formatDate(eviction.periodStart)}`;
  }
  if (eviction.periodEnd) {
    return `jusqu'au ${formatDate(eviction.periodEnd)}`;
  }
  return eviction.durable ? "durable" : "sans période ni statut durable";
};

/** Each blocker in plain words, with the fix that it needs. */
const blockerLine = (blocker: ActivationBlocker): ReactNode => {
  switch (blocker.kind) {
    case "no_validated_version":
      return "Aucune version n'est validée. Validez d'abord les recommandations avec le bouton « Valider les recommandations ».";
    case "safety_answer_missing":
      return blocker.field === "allergies" ? (
        <>
          La réponse sur les allergies manque.{" "}
          <a href={`#${fieldAnchor("allergies")}`} className="underline">
            Indiquez les allergies
          </a>
          , ou « Aucune allergie connue ».
        </>
      ) : (
        <>
          La réponse sur les intolérances manque.{" "}
          <a href={`#${fieldAnchor("intolerances")}`} className="underline">
            Indiquez les intolérances
          </a>
          , ou « Aucune intolérance connue ».
        </>
      );
    case "eviction_without_period":
      return `L'éviction « ${blocker.label} » n'a ni période ni statut durable. Donnez-lui une période, ou le statut durable.`;
  }
};

const blockerKey = (blocker: ActivationBlocker) => {
  switch (blocker.kind) {
    case "no_validated_version":
      return blocker.kind;
    case "safety_answer_missing":
      return `${blocker.kind}-${blocker.field}`;
    case "eviction_without_period":
      return `${blocker.kind}-${blocker.label}`;
  }
};

const Part = ({ title, children }: { title: string; children: ReactNode }) => (
  <div className="flex flex-col gap-1">
    <Typography as="h4" size="xs" tone="muted">
      {title}
    </Typography>
    {children}
  </div>
);

const Line = ({ children }: { children: ReactNode }) => (
  <Typography as="li" size="sm">
    {children}
  </Typography>
);

const Quiet = ({ children }: { children: ReactNode }) => (
  <Typography size="sm" tone="muted">
    {children}
  </Typography>
);

const ValidatedValues = ({
  values,
}: {
  values: NonNullable<ActivationRecap["values"]>;
}) => (
  <ul className="flex flex-col gap-1">
    <Line>
      {`Objectifs : ${values.goals.length > 0 ? values.goals.join(", ") : "aucun objectif"}`}
    </Line>
    <Line>
      {`Recommandations : ${countLabel(values.recommendations, {
        none: "aucune recommandation",
        one: "recommandation",
        many: "recommandations",
      })}`}
    </Line>
    <Line>
      {`Compléments : ${values.supplements.length > 0 ? values.supplements.join(", ") : "aucun complément"}`}
    </Line>
    <Line>
      {`Consigne : ${values.instruction ? "rédigée" : "aucune consigne"}`}
    </Line>
    <Line>
      {`Calculs : ${
        values.calculations.length > 0
          ? values.calculations
              .map(
                (calculation) =>
                  `${calculationKindLabels[calculation.kind].fr} ${formatNumber(calculation.value, "fr-BE")}${calculationUnits[calculation.kind]}`,
              )
              .join(", ")
          : "aucun calcul validé"
      }`}
    </Line>
  </ul>
);

/**
 * The recap before the activation (story 19), in the action card at
 * « Recommandations à valider »: the validated values, each eviction with its
 * period, the elements that are not recognised, then the blockers in plain
 * words and the button « Activer l'accompagnement ».
 *
 * The recap shows only the validated version, never the working copy (D-30).
 * It reads its own data, so the page has one line. The service scopes the
 * read to the actor. An admin's read-only open gets the recap and no button.
 */
export const ActivationRecapBlock = async ({ patient, readOnly }: Props) => {
  const read = await getActivationRecap(await requireActor(), patient.id);
  if (!read.ok) {
    return (
      <Typography size="sm" role="status" className="text-warning-text">
        Le récapitulatif de l&apos;activation ne peut pas être lu.
      </Typography>
    );
  }
  const recap = read.data;
  const { values, evictions, unrecognised, blockers } = recap;
  const versionLine = values
    ? `La version ${values.versionNumber}, validée le ${formatDate(values.validatedAt)},`
    : "";
  return (
    <div
      role="group"
      aria-labelledby="activation-recap"
      className="border-border flex flex-col gap-4 rounded-md border p-4"
    >
      <Typography as="h3" id="activation-recap" size="sm" weight="semibold">
        Récapitulatif avant activation
      </Typography>

      <Part
        title={
          values
            ? `Valeurs validées · version ${values.versionNumber} du ${formatDate(values.validatedAt)}`
            : "Valeurs validées"
        }
      >
        {values ? (
          <ValidatedValues values={values} />
        ) : (
          <Quiet>Aucune version validée pour l&apos;instant.</Quiet>
        )}
      </Part>

      <Part title={`Évictions totales · ${evictions.length}`}>
        {evictions.length > 0 ? (
          <ul className="flex flex-col gap-1">
            {evictions.map((eviction, index) => (
              <Line key={`${eviction.label}-${index}`}>
                <span className={eviction.resolved ? "" : "text-warning-text"}>
                  {`${eviction.label} — ${periodOf(eviction)}`}
                </span>
              </Line>
            ))}
          </ul>
        ) : (
          <Quiet>Aucune éviction totale.</Quiet>
        )}
      </Part>

      <Part title={`Éléments non reconnus · ${unrecognised.length}`}>
        {unrecognised.length > 0 ? (
          <ul className="flex flex-col gap-1">
            {unrecognised.map((element) => (
              <Line key={element}>{`${element} — non appliqué`}</Line>
            ))}
          </ul>
        ) : (
          <Quiet>Aucun élément non reconnu.</Quiet>
        )}
      </Part>

      {blockers.length > 0 ? (
        <Part title={`Ce qui bloque l'activation · ${blockers.length}`}>
          <ul className="flex list-disc flex-col gap-1 pl-5">
            {blockers.map((blocker) => (
              <Line key={blockerKey(blocker)}>{blockerLine(blocker)}</Line>
            ))}
          </ul>
        </Part>
      ) : (
        <Quiet>Rien ne bloque l&apos;activation.</Quiet>
      )}

      {readOnly ? null : (
        <ActivateCareButton
          patientId={patient.id}
          versionLine={versionLine}
          unrecognisedCount={unrecognised.length}
          blocked={!canActivate(recap)}
        />
      )}
    </div>
  );
};

/**
 * « Accompagnement activé le … », in the action card of an active file. The
 * date is the date of the audit event of the activation. A file with no such
 * event shows no line: a date needs a fact in the data.
 */
export const CareActivated = async ({
  patient,
}: {
  patient: Pick<PatientProfile, "id">;
}) => {
  const activatedAt = await getCareActivationDate(
    await requireActor(),
    patient.id,
  );
  if (!activatedAt) {
    return null;
  }
  return (
    <Typography size="sm" weight="medium">
      {`Accompagnement activé le ${formatDate(activatedAt)}.`}
    </Typography>
  );
};
