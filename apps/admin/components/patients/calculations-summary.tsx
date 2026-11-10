import type {
  CalculationInput,
  CalculationKind,
  PatientCalculation,
} from "@remi/services/shared";
import {
  calculationInputLabels,
  calculationKindLabels,
  calculationKinds,
  formatNumber,
} from "@remi/services/shared";
import { Badge, Typography } from "@remi/ui/server";

type Props = {
  /** The patient's rows of `patient_calculations`, at most one per kind. */
  calculations: readonly PatientCalculation[];
  /** Per kind, the data the file lacks (`missingCalculationInputs`). */
  missing: Readonly<Record<CalculationKind, readonly CalculationInput[]>>;
};

/** The unit each value reads with. */
const units: Record<CalculationKind, string> = {
  bmi: "",
  protein: " g/jour",
  energy: " kcal/jour",
};

/** One line under « Non calculé »: what the row waits on. */
const reasonLine = (missing: readonly CalculationInput[]) =>
  missing.length > 0
    ? `Non renseigné : ${missing
        .map((input) => calculationInputLabels[input].fr)
        .join(", ")}`
    : "Calcul pas encore disponible";

/**
 * « Calculs » (story 6): one row per calculation, under the questionnaire
 * data. A row shows the validated value, else the estimate with the badge
 * « estimation » (D-30). With no value it reads « Non calculé » and names
 * the missing data. The calculation epics fill the rows. This slot is the
 * only one.
 */
export const CalculationsSummary = ({ calculations, missing }: Props) => (
  <dl className="flex flex-col gap-4">
    {calculationKinds.map((kind) => {
      const row = calculations.find((entry) => entry.kind === kind);
      // A missing datum wins over a stored value: D-30 shows no value then.
      const waiting = missing[kind].length > 0;
      const validated = waiting ? null : (row?.validatedValue ?? null);
      const estimated = waiting ? null : (row?.estimatedValue ?? null);
      const value = validated ?? estimated;
      return (
        <div key={kind} className="flex min-w-0 flex-col gap-1">
          <dt>
            <Typography size="xs" tone="muted">
              {calculationKindLabels[kind].fr}
            </Typography>
          </dt>
          <dd className="flex flex-col items-start gap-1">
            {value === null ? (
              <>
                <Typography size="sm">Non calculé</Typography>
                <Typography size="xs" tone="muted">
                  {reasonLine(missing[kind])}
                </Typography>
              </>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <Typography size="sm" weight="medium">
                  {`${formatNumber(value, "fr-BE")}${units[kind]}`}
                </Typography>
                {validated === null ? (
                  <Badge variant="info" tone="subtle" size="sm">
                    estimation
                  </Badge>
                ) : null}
              </div>
            )}
          </dd>
        </div>
      );
    })}
  </dl>
);
