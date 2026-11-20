import type {
  BmiIndicator,
  CalculationInput,
  CalculationKind,
  PatientCalculation,
} from "@remi/services/shared";
import {
  bmiClass,
  bmiInputRanges,
  bmiNeedsReview,
  calculationInputLabels,
  calculationKindLabels,
  calculationKinds,
  formatNumber,
  proteinAdaptationLabels,
  proteinEstimateParameters,
} from "@remi/services/shared";
import { Badge, Typography } from "@remi/ui/server";

type Props = {
  /** The patient's rows of `patient_calculations`, at most one per kind. */
  calculations: readonly PatientCalculation[];
  /** Per kind, the data the file lacks (`missingCalculationInputs`). */
  missing: Readonly<Record<CalculationKind, readonly CalculationInput[]>>;
  /** The BMI's state from the file's height and weight (`bmiIndicator`). */
  bmi: BmiIndicator;
};

/** The unit each value reads with. */
const units: Record<CalculationKind, string> = {
  bmi: "",
  protein: " g/jour",
  energy: " kcal/jour",
};

const NOT_AVAILABLE = "Calcul pas encore disponible";

/** One line under « Non calculé »: what the row waits on. */
const missingLine = (missing: readonly CalculationInput[]) =>
  `Non renseigné : ${missing
    .map((input) => calculationInputLabels[input].fr)
    .join(", ")}`;

/** « Hors limites : taille (100 à 250 cm) ». */
const outOfRangeLine = (inputs: readonly (keyof typeof bmiInputRanges)[]) =>
  `Hors limites : ${inputs
    .map((input) => {
      const range = bmiInputRanges[input];
      const unit = input === "heightCm" ? "cm" : "kg";
      return `${calculationInputLabels[input].fr} (${range.min} à ${range.max} ${unit})`;
    })
    .join(", ")}`;

const NotCalculated = ({ reason }: { reason: string }) => (
  <>
    <Typography size="sm">Non calculé</Typography>
    <Typography size="xs" tone="muted">
      {reason}
    </Typography>
  </>
);

const EstimateBadge = () => (
  <Badge variant="info" tone="subtle" size="sm">
    estimation
  </Badge>
);

/**
 * The BMI row (story 7): « IMC 23,9 · Corpulence normale », an indicator and
 * never a diagnosis. Under 18,5 or at 25 and above it carries the alert. The
 * alert changes nothing. No field anywhere takes a BMI: REMI computes it at
 * each save of the height or the weight.
 */
const BmiValue = ({
  indicator,
  row,
}: {
  indicator: BmiIndicator;
  row: PatientCalculation | undefined;
}) => {
  if (indicator.state === "missing") {
    return <NotCalculated reason={missingLine(indicator.inputs)} />;
  }
  if (indicator.state === "out_of_range") {
    return <NotCalculated reason={outOfRangeLine(indicator.inputs)} />;
  }
  const value = row?.estimatedValue ?? null;
  if (value === null) {
    return <NotCalculated reason={NOT_AVAILABLE} />;
  }
  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Typography size="sm" weight="medium">
          {`IMC ${formatNumber(value, "fr-BE", 1)} · ${bmiClass(value).label.fr}`}
        </Typography>
        <EstimateBadge />
        {bmiNeedsReview(value) ? (
          <Badge variant="warning" tone="subtle" size="sm">
            À évaluer par le praticien
          </Badge>
        ) : null}
      </div>
      <Typography size="xs" tone="muted">
        Indicateur, pas un diagnostic
      </Typography>
    </>
  );
};

/**
 * The protein row (story 8): the estimate in g/jour with the badge
 * « estimation » (D-30), the reference weight and the coefficient used, then
 * the adaptations that REMI proposes and the practitioner confirms. A
 * pathology, a malnutrition or a special situation adds « Validation
 * obligatoire ». A validated value shows alone: its row belongs to REM-50.
 */
const ProteinValue = ({
  missing,
  row,
}: {
  missing: readonly CalculationInput[];
  row: PatientCalculation | undefined;
}) => {
  if (missing.length > 0) {
    return <NotCalculated reason={missingLine(missing)} />;
  }
  const validated = row?.validatedValue ?? null;
  if (validated !== null) {
    return (
      <Typography size="sm" weight="medium">
        {`${formatNumber(validated, "fr-BE")}${units.protein}`}
      </Typography>
    );
  }
  const value = row?.estimatedValue ?? null;
  if (value === null) {
    return <NotCalculated reason={NOT_AVAILABLE} />;
  }
  const {
    referenceWeightKg,
    coefficient,
    additionGramsPerDay,
    adaptations,
    validationRequired,
  } = proteinEstimateParameters(row?.estimateParameters ?? null);
  const addition =
    additionGramsPerDay > 0
      ? ` + ${formatNumber(additionGramsPerDay, "fr-BE")} g/jour`
      : "";
  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Typography size="sm" weight="medium">
          {`${formatNumber(value, "fr-BE")}${units.protein}`}
        </Typography>
        <EstimateBadge />
        {validationRequired ? (
          <Badge variant="warning" tone="subtle" size="sm">
            Validation obligatoire
          </Badge>
        ) : null}
      </div>
      {referenceWeightKg !== null && coefficient !== null ? (
        <Typography size="xs" tone="muted">
          {`Poids de référence ${formatNumber(referenceWeightKg, "fr-BE")} kg × ${formatNumber(coefficient, "fr-BE")} g/kg/jour${addition}`}
        </Typography>
      ) : null}
      {adaptations.length > 0 ? (
        <div className="flex flex-col gap-1">
          <Typography size="xs" weight="medium">
            Adaptations proposées, à confirmer
          </Typography>
          {adaptations.map((adaptation) => (
            <Typography key={adaptation} size="xs" tone="muted">
              {proteinAdaptationLabels[adaptation].fr}
            </Typography>
          ))}
        </div>
      ) : null}
    </>
  );
};

/** A row the other epics fill: the validated value, else the estimate. */
const CalculationValue = ({
  kind,
  missing,
  row,
}: {
  kind: CalculationKind;
  missing: readonly CalculationInput[];
  row: PatientCalculation | undefined;
}) => {
  if (missing.length > 0) {
    return <NotCalculated reason={missingLine(missing)} />;
  }
  const validated = row?.validatedValue ?? null;
  const value = validated ?? row?.estimatedValue ?? null;
  if (value === null) {
    return <NotCalculated reason={NOT_AVAILABLE} />;
  }
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Typography size="sm" weight="medium">
        {`${formatNumber(value, "fr-BE")}${units[kind]}`}
      </Typography>
      {validated === null ? <EstimateBadge /> : null}
    </div>
  );
};

/**
 * « Calculs » (story 6): one row per calculation, under the questionnaire
 * data. A row shows the validated value, else the estimate with the badge
 * « estimation » (D-30). With no value it reads « Non calculé » and names
 * the missing data. The calculation epics fill the rows. This slot is the
 * only one.
 */
export const CalculationsSummary = ({ calculations, missing, bmi }: Props) => (
  <dl className="flex flex-col gap-4">
    {calculationKinds.map((kind) => {
      const row = calculations.find((entry) => entry.kind === kind);
      return (
        <div key={kind} className="flex min-w-0 flex-col gap-1">
          <dt>
            <Typography size="xs" tone="muted">
              {calculationKindLabels[kind].fr}
            </Typography>
          </dt>
          <dd className="flex flex-col items-start gap-1">
            {kind === "bmi" ? (
              <BmiValue indicator={bmi} row={row} />
            ) : null}
            {kind === "protein" ? (
              <ProteinValue missing={missing[kind]} row={row} />
            ) : null}
            {kind === "energy" ? (
              <CalculationValue kind={kind} missing={missing[kind]} row={row} />
            ) : null}
          </dd>
        </div>
      );
    })}
  </dl>
);
