"use client";

import { useState } from "react";
import {
  energyGoalLabels,
  energyGoals,
  energyTarget,
  energyTargetBounds,
  formatNumber,
  specialSituationLabels,
  specialSituations,
  type EnergyTargetDefaults,
  type EnergyTargetEntry,
} from "@remi/services/shared";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@remi/ui";
import { Field, Input, Typography } from "@remi/ui/server";

type Props = {
  /** The values of the row that the detail opens with. Never a guess. */
  defaults: EnergyTargetDefaults;
  /** kcal/day, not rounded: the estimated need that the row shows. */
  estimateKcalPerDay: number;
};

/** The value of a list with no choice yet. The action reads it as null. */
const UNSET = "unset";

const entryLabels: Record<EnergyTargetEntry, string> = {
  value: "Objectif en kcal/jour",
  difference: "Différence par rapport à l'estimation",
};

/** An empty field or text that is no number is null. « − 300 » is −300. */
const fieldNumber = (text: string) => {
  const value = text.replace(/\s/g, "").replace("−", "-").replace(",", ".");
  const parsed = Number(value);
  return value !== "" && Number.isFinite(parsed) ? parsed : null;
};

const kcal = (value: number) => `${formatNumber(value, "fr-BE", 0)} kcal/jour`;

/** « + 300 kcal/jour », « − 300 kcal/jour », « 0 kcal/jour ». */
const signedKcal = (value: number) =>
  value === 0 ? kcal(0) : `${value > 0 ? "+" : "−"} ${kcal(Math.abs(value))}`;

/**
 * The fields of the calorie target (story 9): the goal, the special
 * situation, and the target as a value in kcal/jour or as a difference from
 * the estimate. The amount opens empty until a target is validated: REMI
 * offers no target, and the goal changes no number.
 *
 * `energyTarget` computes here and in the service, so the target on screen is
 * the value that « Valider » writes. The fields are the children of
 * `CalculationDetail`, which holds the form.
 */
export const EnergyTargetFields = ({ defaults, estimateKcalPerDay }: Props) => {
  const [goal, setGoal] = useState<string>(defaults.goal ?? UNSET);
  const [situation, setSituation] = useState<string>(
    defaults.specialSituation ?? UNSET,
  );
  const [entry, setEntry] = useState<EnergyTargetEntry>(defaults.entry);
  const [amount, setAmount] = useState(
    defaults.amount === null ? "" : String(defaults.amount),
  );

  const typed = fieldNumber(amount);
  // The goal changes no number: the preview does not wait for it.
  const target = energyTarget({
    estimateKcalPerDay,
    goal: energyGoals[0],
    specialSituation: null,
    entry,
    amount: typed,
  });
  const range = energyTargetBounds[entry];
  const amountInvalid = amount.trim() !== "" && target.state === "invalid";

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="energy-goal" label="Objectif">
          <Select name="goal" value={goal} onValueChange={setGoal}>
            <SelectTrigger id="energy-goal">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={UNSET}>À choisir</SelectItem>
              {energyGoals.map((key) => (
                <SelectItem key={key} value={key}>
                  {energyGoalLabels[key].fr}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field id="energy-situation" label="Situation particulière" optional>
          <Select
            name="specialSituation"
            value={situation}
            onValueChange={setSituation}
          >
            <SelectTrigger id="energy-situation">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={UNSET}>Non renseignée</SelectItem>
              {specialSituations.map((key) => (
                <SelectItem key={key} value={key}>
                  {specialSituationLabels[key].fr}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field id="energy-entry" label="Saisie de l'objectif calorique">
          <Select
            name="entry"
            value={entry}
            onValueChange={(value) => {
              setEntry(value === "difference" ? "difference" : "value");
              // 2 000 as a value is not 2 000 as a difference.
              setAmount("");
            }}
          >
            <SelectTrigger id="energy-entry">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="value">{entryLabels.value}</SelectItem>
              <SelectItem value="difference">
                {entryLabels.difference}
              </SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field
          id="energy-amount"
          label={
            entry === "value"
              ? "Objectif calorique (kcal/jour)"
              : "Différence (kcal/jour)"
          }
          hint={
            entry === "value"
              ? `De ${formatNumber(range.min, "fr-BE")} à ${formatNumber(range.max, "fr-BE")} kcal/jour`
              : "Par exemple −300 ou +200. 0 : l'objectif est égal à l'estimation."
          }
          error={
            amountInvalid
              ? entry === "value"
                ? `Indiquez un nombre entier de ${formatNumber(range.min, "fr-BE")} à ${formatNumber(range.max, "fr-BE")} kcal/jour.`
                : `Indiquez un nombre entier. L'objectif obtenu doit aller de ${formatNumber(energyTargetBounds.value.min, "fr-BE")} à ${formatNumber(energyTargetBounds.value.max, "fr-BE")} kcal/jour.`
              : undefined
          }
        >
          <Input
            id="energy-amount"
            name="amount"
            inputMode={entry === "value" ? "numeric" : "text"}
            autoComplete="off"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
          />
        </Field>
      </div>
      <Typography size="sm" role="status">
        {target.state === "computed"
          ? `Estimation : ${kcal(target.estimatedNeed)}. Objectif calorique : ${kcal(target.value)} (${signedKcal(target.difference)} par rapport à l'estimation).`
          : `Estimation : ${kcal(estimateKcalPerDay)}. Aucun objectif calorique tant que vous n'en saisissez pas.`}
      </Typography>
      <Typography size="xs" tone="muted">
        REMI n&apos;applique aucune restriction calorique : l&apos;objectif
        calorique est celui que vous saisissez. L&apos;objectif et la situation
        particulière sont conservés avec lui et ne modifient aucun calcul.
        L&apos;estimation ne change pas.
      </Typography>
      <Typography size="xs" tone="muted">
        Pour corriger le niveau d&apos;activité ou une autre donnée, modifiez le
        questionnaire : l&apos;estimation est recalculée, et l&apos;objectif
        calorique validé reste tel quel.
      </Typography>
    </>
  );
};
