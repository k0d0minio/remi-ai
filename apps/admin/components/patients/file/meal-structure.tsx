"use client";

import { useState, useTransition } from "react";
import {
  emptyMealConfiguration,
  mealFastingOptions,
  mealOrientations,
  mealRemovedByFasting,
  mealSlotState,
  mealSlots,
  type MealConfiguration,
  type MealConfigurationChange,
  type MealSlot,
} from "@remi/services/shared";
import { Button, Switch } from "@remi/ui";
import {
  Alert,
  AlertDescription,
  RadioCard,
  Typography,
} from "@remi/ui/server";
import { NOT_ENTERED } from "@/components/patients/file/value";
import {
  mealFastingDescriptions,
  mealFastingLabels,
  mealOrientationDescriptions,
  mealOrientationLabels,
  mealSlotLabels,
  mealSlotStateLabels,
} from "@/components/patients/meal-configuration-labels";
import { updateMealConfigurationAction } from "@/lib/patients/meal-configuration";

type Props = {
  patientId: string;
  /** Null: the practitioner has entered no value. */
  configuration: MealConfiguration | null;
};

type MealProps = {
  meal: MealSlot;
  configuration: MealConfiguration;
  pending: boolean;
  onChange: (change: MealConfigurationChange) => void;
};

/**
 * One meal: its switch, what the meal is in words, and the orientation of an
 * active meal. A meal that the fasting option removes shows as removed, with
 * its switch off and locked: the two settings give one reading
 * (`mealSlotState`).
 */
const MealRow = ({ meal, configuration, pending, onChange }: MealProps) => {
  const state = mealSlotState(configuration, meal);
  const { orientation } = configuration.meals[meal];
  const label = mealSlotLabels[meal];
  const switchId = `meal-${meal}`;
  return (
    <li className="flex flex-col gap-3 py-3">
      <div className="flex min-h-11 flex-wrap items-center gap-x-3 gap-y-1">
        <Switch
          id={switchId}
          checked={state === "on"}
          disabled={pending || state === "removed_by_fasting"}
          onCheckedChange={(enabled) =>
            onChange({ type: "meal_enabled", meal, enabled })
          }
        />
        <label htmlFor={switchId} className="flex min-h-11 items-center">
          <Typography as="span" size="sm" weight="medium">
            {label}
          </Typography>
        </label>
        <Typography
          as="span"
          size="sm"
          tone={state === "on" ? "default" : "muted"}
        >
          {mealSlotStateLabels[state]}
        </Typography>
      </div>
      {state === "on" ? (
        <fieldset className="flex min-w-0 flex-col gap-2" disabled={pending}>
          <legend className="mb-2 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <Typography as="span" size="sm" tone="muted">
              {`Orientation · ${label}`}
            </Typography>
            {orientation === null ? (
              <Typography as="span" size="xs" tone="muted">
                {NOT_ENTERED}
              </Typography>
            ) : null}
          </legend>
          <div className="grid gap-2 @xl:grid-cols-2">
            {mealOrientations.map((option) => (
              <RadioCard
                key={option}
                size="compact"
                name={`orientation-${meal}`}
                value={option}
                label={mealOrientationLabels[option]}
                description={mealOrientationDescriptions[option]}
                checked={orientation === option}
                onChange={() =>
                  onChange({
                    type: "meal_orientation",
                    meal,
                    orientation: option,
                  })
                }
              />
            ))}
          </div>
        </fieldset>
      ) : null}
    </li>
  );
};

/**
 * « Repas » (REM-68 and REM-70, stories 11 and 12): one switch for each meal,
 * the orientation of each active meal, and « Jeûne intermittent ».
 *
 * One click is one change, saved at once. No value is selected before the
 * practitioner chooses it: a file with no configuration reads « Non
 * renseigné », and Morgane's table applies only on its button. No field asks
 * for a time or a duration.
 */
export const MealStructureSection = ({ patientId, configuration }: Props) => {
  const [current, setCurrent] = useState(configuration);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const save = (change: MealConfigurationChange) => {
    setSaved(false);
    startTransition(async () => {
      const result = await updateMealConfigurationAction(patientId, change);
      setError(result.error);
      if (result.configuration) {
        setCurrent(result.configuration);
        setSaved(true);
      }
    });
  };

  const shown = current ?? emptyMealConfiguration;
  const removed = mealRemovedByFasting(shown.fasting);

  return (
    <div className="@container flex flex-col gap-5">
      {current === null ? (
        <div className="flex flex-col items-start gap-2">
          <Typography size="sm" tone="muted">
            {`${NOT_ENTERED}. Aucun repas ni aucune option n'est choisi pour ce dossier.`}
          </Typography>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={pending}
            onClick={() => save({ type: "defaults" })}
          >
            Appliquer la configuration par défaut
          </Button>
          <Typography size="sm" tone="muted">
            Petit-déjeuner protéiné et lipidique, déjeuner complet et
            équilibré, collation désactivée, dîner léger à dominante végétale,
            aucun jeûne intermittent. Vous pouvez ensuite tout modifier.
          </Typography>
        </div>
      ) : null}

      <ul className="divide-border flex flex-col divide-y">
        {mealSlots.map((meal) => (
          <MealRow
            key={meal}
            meal={meal}
            configuration={shown}
            pending={pending}
            onChange={save}
          />
        ))}
      </ul>

      <fieldset className="flex min-w-0 flex-col gap-2" disabled={pending}>
        <legend className="mb-2 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <Typography as="span" size="sm" weight="medium">
            Jeûne intermittent
          </Typography>
          {shown.fasting === null ? (
            <Typography as="span" size="xs" tone="muted">
              {NOT_ENTERED}
            </Typography>
          ) : null}
        </legend>
        <div className="grid gap-2 @xl:grid-cols-3">
          {mealFastingOptions.map((option) => (
            <RadioCard
              key={option}
              size="compact"
              name="meal-fasting"
              value={option}
              label={mealFastingLabels[option]}
              description={mealFastingDescriptions[option]}
              checked={shown.fasting === option}
              onChange={() => save({ type: "fasting", fasting: option })}
            />
          ))}
        </div>
        {removed ? (
          <Typography size="sm" tone="muted">
            {`${mealSlotLabels[removed]} : supprimé par le jeûne intermittent. Son réglage est conservé et revient si vous retirez le jeûne.`}
          </Typography>
        ) : null}
      </fieldset>

      <Typography size="sm" tone="muted">
        Une orientation est une préférence souple, sans pourcentage strict par
        repas. Chaque choix est enregistré aussitôt.
      </Typography>

      {error ? (
        <Alert variant="error">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      {saved && !error ? (
        <Typography size="sm" tone="muted" role="status">
          Enregistré.
        </Typography>
      ) : null}
    </div>
  );
};
