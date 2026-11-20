import type {
  BmiIndicator,
  CalculationInput,
  CalculationKind,
  ComputedEstimates,
  PatientCalculation,
} from "@remi/services/shared";
import {
  activityLevelDetails,
  bmiClass,
  bmiInputRanges,
  bmiNeedsReview,
  calculationInputLabels,
  calculationKindLabels,
  calculationKinds,
  energyEstimateParameters,
  energyGoalLabels,
  energyTargetDefaults,
  energyTargetParameters,
  formatDate,
  formatNumber,
  proteinAdaptationLabels,
  proteinEstimateParameters,
  proteinTargetDefaults,
  restingMetabolismSexConstants,
  sexForCalculationLabels,
  specialSituationLabels,
} from "@remi/services/shared";
import { Badge, Typography } from "@remi/ui/server";
import { CalculationDetail } from "@/components/patients/calculation-detail";
import { EnergyTargetFields } from "@/components/patients/energy-target-fields";
import { ValidatedMark } from "@/components/patients/file/value";
import { ProteinTargetFields } from "@/components/patients/protein-target-fields";
import { validateEnergyTargetAction } from "@/lib/patients/energy-target";
import { validateProteinTargetAction } from "@/lib/patients/protein-target";

type Props = {
  patientId: string;
  /** An admin's open of another practitioner's file: no control that writes. */
  readOnly: boolean;
  /** The patient's rows of `patient_calculations`, at most one per kind. */
  calculations: readonly PatientCalculation[];
  /** Per kind, the data the file lacks (`missingCalculationInputs`). */
  missing: Readonly<Record<CalculationKind, readonly CalculationInput[]>>;
  /** The BMI's state from the file's height and weight (`bmiIndicator`). */
  bmi: BmiIndicator;
  /**
   * The estimates of the file as it is now, computed and not stored
   * (`computePatientEstimates`). A row with no stored estimate shows this one.
   */
  computed: ComputedEstimates;
};

/**
 * The estimate that a row shows: the stored one, else the one computed from
 * the file as it is now. A file that was saved before the estimate existed
 * has its data and no stored estimate (REM-52). Null: there is no number.
 */
const shownEstimate = (
  row: PatientCalculation | undefined,
  computed: ComputedEstimates[keyof ComputedEstimates],
) => {
  const stored = row?.estimatedValue ?? null;
  return stored !== null
    ? { value: stored, parameters: row?.estimateParameters ?? null }
    : computed;
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
 * Beside a value that the practitioner validated: the mark « validé ». When a
 * later change of the file asks for a new validation, the row says so, and the
 * mark does not show. With `dated` the mark gives the date of the validation.
 */
const ValidationState = ({
  row,
  dated = false,
}: {
  row: PatientCalculation | undefined;
  dated?: boolean;
}) =>
  row?.needsRevalidation ? (
    <Badge variant="warning" tone="subtle" size="sm">
      Estimation à revalider
    </Badge>
  ) : (
    <ValidatedMark
      label={
        dated && row?.validatedAt
          ? `validé le ${formatDate(row.validatedAt)}`
          : undefined
      }
    />
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

/** « Poids de référence 75 kg × 1,2 g/kg/jour + 9 g/jour », or null. */
const proteinFormula = ({
  referenceWeightKg,
  coefficient,
  additionGramsPerDay,
}: {
  referenceWeightKg: number | null;
  coefficient: number | null;
  additionGramsPerDay: number;
}) => {
  if (referenceWeightKg === null || coefficient === null) {
    return null;
  }
  const addition =
    additionGramsPerDay > 0
      ? ` + ${formatNumber(additionGramsPerDay, "fr-BE")} g/jour`
      : "";
  return `Poids de référence ${formatNumber(referenceWeightKg, "fr-BE")} kg × ${formatNumber(coefficient, "fr-BE")} g/kg/jour${addition}`;
};

const gramsPerDay = (value: number) =>
  `${formatNumber(value, "fr-BE")}${units.protein}`;

/**
 * The protein row (story 8). Before a validation: the estimate in g/jour with
 * the badge « estimation » (D-30), the reference weight and the coefficient
 * used, then the adaptations that REMI proposes and the practitioner
 * confirms. A pathology, a malnutrition or a special situation adds
 * « Validation obligatoire ».
 *
 * After a validation (REM-50): the validated value with the mark « validé le
 * … » and its own parameters, then the estimate beside it, still named as an
 * estimate. The validated value does not follow the estimate.
 *
 * « Modifier » opens the detail: the reference weight, the coefficient and
 * the final value. A read-only open gets no « Modifier ». With no estimate and
 * no validated value the detail says what the file lacks and offers no number.
 */
const ProteinValue = ({
  patientId,
  readOnly,
  missing,
  row,
  computed,
}: {
  patientId: string;
  readOnly: boolean;
  missing: readonly CalculationInput[];
  row: PatientCalculation | undefined;
  computed: ComputedEstimates["protein"];
}) => {
  const validated = row?.validatedValue ?? null;
  const shown = shownEstimate(row, computed);
  const estimate = shown?.value ?? null;
  const estimateParameters = proteinEstimateParameters(
    shown?.parameters ?? null,
  );
  const defaults = proteinTargetDefaults({
    estimatedValue: estimate,
    estimateParameters: shown?.parameters ?? null,
    validatedValue: validated,
    validationParameters: row?.validationParameters ?? null,
  });
  const unavailable =
    defaults !== null
      ? null
      : missing.length > 0
        ? `Aucune valeur n'est proposée. ${missingLine(missing)}. Complétez le dossier, puis revenez ici.`
        : "Aucune valeur n'est proposée : l'estimation n'est pas encore disponible.";
  const detail = readOnly ? null : (
    <CalculationDetail
      patientId={patientId}
      editLabel="Modifier les besoins protéiques"
      action={validateProteinTargetAction}
      unavailable={unavailable}
    >
      {defaults ? <ProteinTargetFields defaults={defaults} /> : null}
    </CalculationDetail>
  );

  if (validated !== null) {
    const validation = proteinEstimateParameters(
      row?.validationParameters ?? null,
    );
    const formula = proteinFormula(validation);
    const typed = row?.validationParameters?.direct === true;
    return (
      <>
        <div className="flex flex-wrap items-center gap-2">
          <Typography size="sm" weight="medium">
            {gramsPerDay(validated)}
          </Typography>
          <ValidationState row={row} dated />
        </div>
        {formula ? (
          <Typography size="xs" tone="muted">
            {typed ? `Valeur saisie par vous. ${formula}` : formula}
          </Typography>
        ) : null}
        {estimate !== null ? (
          <div className="flex flex-wrap items-center gap-2">
            <Typography size="xs" tone="muted">
              {`Estimation de REMI : ${gramsPerDay(estimate)}`}
            </Typography>
            <EstimateBadge />
          </div>
        ) : (
          <Typography size="xs" tone="muted">
            {missing.length > 0
              ? `Estimation non calculée. ${missingLine(missing)}`
              : "Estimation non calculée"}
          </Typography>
        )}
        {detail}
      </>
    );
  }
  if (missing.length > 0) {
    return (
      <>
        <NotCalculated reason={missingLine(missing)} />
        {detail}
      </>
    );
  }
  if (estimate === null) {
    return (
      <>
        <NotCalculated reason={NOT_AVAILABLE} />
        {detail}
      </>
    );
  }
  const { adaptations, validationRequired } = estimateParameters;
  const formula = proteinFormula(estimateParameters);
  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <Typography size="sm" weight="medium">
          {gramsPerDay(estimate)}
        </Typography>
        <EstimateBadge />
        {validationRequired ? (
          <Badge variant="warning" tone="subtle" size="sm">
            Validation obligatoire
          </Badge>
        ) : null}
      </div>
      {formula ? (
        <Typography size="xs" tone="muted">
          {formula}
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
      {detail}
    </>
  );
};

/** « 1 345 kcal/jour »: the kcal is rounded here, and nowhere before. */
const kcalPerDay = (value: number) =>
  `${formatNumber(value, "fr-BE", 0)}${units.energy}`;

/** « + 300 kcal/jour », « − 300 kcal/jour », « 0 kcal/jour ». */
const signedKcalPerDay = (value: number) =>
  value === 0
    ? kcalPerDay(0)
    : `${value > 0 ? "+" : "−"} ${kcalPerDay(Math.abs(value))}`;

/**
 * « Voir le détail du calcul » (story 9): the two formulas with the values
 * used. Closed by default. It writes nothing, so a read-only open shows it
 * too. A value that the row does not hold gives no line.
 */
const EnergyFormula = ({
  value,
  parameters,
}: {
  value: number;
  parameters: Readonly<Record<string, unknown>> | null;
}) => {
  const {
    restingMetabolism,
    sexForCalculation,
    ageYears,
    heightCm,
    weightKg,
    activityLevel,
    nap,
  } = energyEstimateParameters(parameters);
  const constant =
    sexForCalculation === null
      ? null
      : restingMetabolismSexConstants[sexForCalculation];
  const resting =
    restingMetabolism !== null &&
    sexForCalculation !== null &&
    constant !== null &&
    ageYears !== null &&
    heightCm !== null &&
    weightKg !== null
      ? `Métabolisme de repos (Mifflin-St Jeor, ${sexForCalculationLabels[sexForCalculation].fr.toLowerCase()}) : 10 × ${formatNumber(weightKg, "fr-BE")} kg + 6,25 × ${formatNumber(heightCm, "fr-BE")} cm − 5 × ${formatNumber(ageYears, "fr-BE")} ans ${constant < 0 ? "−" : "+"} ${formatNumber(Math.abs(constant), "fr-BE")} = ${kcalPerDay(restingMetabolism)}`
      : null;
  const need =
    restingMetabolism !== null && activityLevel !== null && nap !== null
      ? `Besoins énergétiques estimés : ${kcalPerDay(restingMetabolism)} × ${formatNumber(nap, "fr-BE", 1)} (niveau d'activité physique : ${activityLevelDetails[activityLevel].label.fr}) = ${kcalPerDay(value)}`
      : null;
  if (resting === null && need === null) {
    return null;
  }
  return (
    <details className="w-full">
      <summary className="flex min-h-11 cursor-pointer items-center text-sm underline underline-offset-4">
        Voir le détail du calcul
      </summary>
      <div className="flex flex-col gap-1 pt-1">
        {resting ? (
          <Typography size="xs" tone="muted">
            {resting}
          </Typography>
        ) : null}
        {need ? (
          <Typography size="xs" tone="muted">
            {need}
          </Typography>
        ) : null}
        <Typography size="xs" tone="muted">
          Le poids est le poids actuel du dossier. Le poids de référence des
          besoins protéiques ne change pas ce calcul.
        </Typography>
      </div>
    </details>
  );
};

/**
 * The energy row (story 9, REM-52): three values, kept apart and named. The
 * resting metabolism and the estimated daily need each carry the badge
 * « estimation » (D-30), before and after a validation. The validated calorie
 * target is the practitioner's value, with the mark « validé le … », the goal
 * and the special situation. A new estimate never replaces it: the row then
 * says that the estimate changed, and the target waits for a new « Valider ».
 *
 * With a datum missing or out of range the row gives no estimate and names
 * the datum. A validated target still shows.
 *
 * « Modifier » opens the detail: the goal, the special situation, the target
 * or the difference, and « Voir le détail du calcul ». A read-only open gets
 * no « Modifier ». With no estimate the detail says so and offers no field.
 */
const EnergyValue = ({
  patientId,
  readOnly,
  missing,
  indicator,
  row,
  computed,
}: {
  patientId: string;
  readOnly: boolean;
  missing: readonly CalculationInput[];
  indicator: BmiIndicator;
  row: PatientCalculation | undefined;
  computed: ComputedEstimates["energy"];
}) => {
  // A missing datum gives no number, whatever a row still holds (D-30).
  const shown =
    missing.length > 0 || indicator.state === "out_of_range"
      ? null
      : shownEstimate(row, computed);
  const reason =
    missing.length > 0
      ? missingLine(missing)
      : indicator.state === "out_of_range"
        ? outOfRangeLine(indicator.inputs)
        : NOT_AVAILABLE;
  const { restingMetabolism } = energyEstimateParameters(
    shown?.parameters ?? null,
  );
  const validated = row?.validatedValue ?? null;
  const target = energyTargetParameters(row?.validationParameters ?? null);
  const targetFacts = [
    target.goal === null ? null : `Objectif : ${energyGoalLabels[target.goal].fr}`,
    target.specialSituation === null
      ? null
      : `Situation particulière : ${specialSituationLabels[target.specialSituation].fr}`,
    target.difference === null
      ? null
      : `${signedKcalPerDay(target.difference)} par rapport à l'estimation de la validation`,
  ].filter((part) => part !== null);
  const estimateMoved =
    validated !== null &&
    shown !== null &&
    target.estimatedNeed !== null &&
    Math.round(shown.value) !== target.estimatedNeed;
  const formula = shown ? (
    <EnergyFormula value={shown.value} parameters={shown.parameters} />
  ) : null;

  return (
    <>
      {restingMetabolism !== null ? (
        <div className="flex flex-wrap items-center gap-2">
          <Typography size="sm" weight="medium">
            {`Métabolisme de repos : ${kcalPerDay(restingMetabolism)}`}
          </Typography>
          <EstimateBadge />
        </div>
      ) : (
        <Typography size="sm">Métabolisme de repos : non calculé</Typography>
      )}
      {shown ? (
        <div className="flex flex-wrap items-center gap-2">
          <Typography size="sm" weight="medium">
            {`Besoins énergétiques estimés : ${kcalPerDay(shown.value)}`}
          </Typography>
          <EstimateBadge />
        </div>
      ) : (
        <>
          <Typography size="sm">
            Besoins énergétiques estimés : non calculé
          </Typography>
          <Typography size="xs" tone="muted">
            {reason}
          </Typography>
        </>
      )}
      {validated !== null ? (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <Typography size="sm" weight="medium">
              {`Objectif calorique validé : ${kcalPerDay(validated)}`}
            </Typography>
            <ValidationState row={row} dated />
          </div>
          {targetFacts.length > 0 ? (
            <Typography size="xs" tone="muted">
              {targetFacts.join(" · ")}
            </Typography>
          ) : null}
          {estimateMoved && shown && target.estimatedNeed !== null ? (
            <Typography size="xs" role="status">
              {`L'estimation a changé depuis la validation : ${kcalPerDay(target.estimatedNeed)}, puis ${kcalPerDay(shown.value)}. L'objectif calorique validé reste ${kcalPerDay(validated)} tant que vous ne validez pas de nouveau.`}
            </Typography>
          ) : null}
        </>
      ) : (
        <Typography size="sm" tone="muted">
          Objectif calorique validé : aucun
        </Typography>
      )}
      {readOnly ? (
        formula
      ) : (
        <CalculationDetail
          patientId={patientId}
          editLabel="Modifier l'objectif calorique"
          action={validateEnergyTargetAction}
          unavailable={
            shown
              ? null
              : `Aucun objectif calorique ne peut être validé sans estimation. ${reason}. Complétez le dossier, puis revenez ici.`
          }
        >
          {shown ? (
            <>
              <EnergyTargetFields
                defaults={energyTargetDefaults(row ?? null)}
                estimateKcalPerDay={shown.value}
              />
              {formula}
            </>
          ) : null}
        </CalculationDetail>
      )}
    </>
  );
};

/**
 * « Calculs » (story 6): one row per calculation, under the questionnaire
 * data. A row shows the validated value with the mark « validé », and the
 * estimate with the badge « estimation » (D-30). With no value it reads
 * « Non calculé » and names the missing data. A file with its data and no
 * stored estimate shows the estimate computed from the file (REM-52). Each kind has its own value component. This slot is the
 * only one.
 */
export const CalculationsSummary = ({
  patientId,
  readOnly,
  calculations,
  missing,
  bmi,
  computed,
}: Props) => (
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
              <ProteinValue
                patientId={patientId}
                readOnly={readOnly}
                missing={missing[kind]}
                row={row}
                computed={computed.protein}
              />
            ) : null}
            {kind === "energy" ? (
              <EnergyValue
                patientId={patientId}
                readOnly={readOnly}
                missing={missing[kind]}
                indicator={bmi}
                row={row}
                computed={computed.energy}
              />
            ) : null}
          </dd>
        </div>
      );
    })}
  </dl>
);
