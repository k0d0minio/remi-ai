"use client";

import { RotateCcw, Save } from "lucide-react";
import { useState, useTransition } from "react";
import {
  MEAL_SHARE_MAX,
  MEAL_SHARE_MIN,
  mealConfigurationSlots,
  mealOrientations,
  mealShareNutrients,
  referenceDayOrientations,
  type MealConfigurationSlot,
  type MealOrientation,
  type MealShareNutrient,
  type MealShareTable,
} from "@remi/services/shared";
import { Button } from "@remi/ui";
import {
  Alert,
  AlertDescription,
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Typography,
} from "@remi/ui/server";
import {
  mealOrientationLabels,
  mealSlotLabels,
} from "@/components/patients/meal-configuration-labels";
import {
  resetMealSharesAction,
  saveMealSharesAction,
  type MealSharesSaveState,
} from "@/lib/meal-shares/actions";

type Props = {
  table: MealShareTable;
  source: "default" | "setting";
  setByName: string | null;
  /** The date and time, written on the server. */
  setAtLabel: string | null;
};

/** What the fields hold: text, so that an empty field stays empty. */
type Draft = Record<
  MealConfigurationSlot,
  Record<MealOrientation, Record<MealShareNutrient, string>>
>;

const nutrientLabels: Record<MealShareNutrient, string> = {
  energy: "Énergie",
  protein: "Protéines",
};

const draftOf = (table: MealShareTable): Draft =>
  Object.fromEntries(
    mealConfigurationSlots.map((meal) => [
      meal,
      Object.fromEntries(
        mealOrientations.map((orientation) => [
          orientation,
          {
            energy: String(table[meal][orientation].energy),
            protein: String(table[meal][orientation].protein),
          },
        ]),
      ),
    ]),
  ) as Draft;

/** The number of a field, or null when the field holds no whole number. */
const numberOf = (text: string): number | null =>
  /^\d{1,3}$/.test(text.trim()) ? Number(text.trim()) : null;

const inRange = (value: number | null): value is number =>
  value !== null && value >= MEAL_SHARE_MIN && value <= MEAL_SHARE_MAX;

/** The table of the fields. A field with no number gives `NaN`: the service refuses it. */
const tableOf = (draft: Draft): MealShareTable =>
  Object.fromEntries(
    mealConfigurationSlots.map((meal) => [
      meal,
      Object.fromEntries(
        mealOrientations.map((orientation) => [
          orientation,
          {
            energy: numberOf(draft[meal][orientation].energy) ?? Number.NaN,
            protein: numberOf(draft[meal][orientation].protein) ?? Number.NaN,
          },
        ]),
      ),
    ]),
  ) as MealShareTable;

/** The sum of one column on the reference day, or null when a field is not a number. */
const referenceTotal = (
  draft: Draft,
  nutrient: MealShareNutrient,
): number | null => {
  let total = 0;
  for (const meal of mealConfigurationSlots) {
    const value = numberOf(draft[meal][referenceDayOrientations[meal]][nutrient]);
    if (value === null) {
      return null;
    }
    total += value;
  }
  return total;
};

/**
 * The table of the meal shares, one card for each meal: five orientations, and
 * for each one the part of the day's energy and of the day's protein.
 *
 * What the page says about the fields is a help only. The server decides: the
 * service validates the table again.
 */
export const MealShareEditor = ({
  table,
  source,
  setByName,
  setAtLabel,
}: Props) => {
  const [draft, setDraft] = useState(() => draftOf(table));
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);

  const totals = {
    energy: referenceTotal(draft, "energy"),
    protein: referenceTotal(draft, "protein"),
  };
  const everyCellValid = mealConfigurationSlots.every((meal) =>
    mealOrientations.every((orientation) =>
      mealShareNutrients.every((nutrient) =>
        inRange(numberOf(draft[meal][orientation][nutrient])),
      ),
    ),
  );
  const valid =
    everyCellValid && totals.energy === 100 && totals.protein === 100;

  const setCell = (
    meal: MealConfigurationSlot,
    orientation: MealOrientation,
    nutrient: MealShareNutrient,
    value: string,
  ) => {
    setSaved(null);
    setDraft((previous) => ({
      ...previous,
      [meal]: {
        ...previous[meal],
        [orientation]: { ...previous[meal][orientation], [nutrient]: value },
      },
    }));
  };

  const applied = (result: MealSharesSaveState, message: string) => {
    setError(result.error);
    if (result.table) {
      // The action revalidates the page: `source`, `setByName` and
      // `setAtLabel` come back as new props.
      setDraft(draftOf(result.table));
      setSaved(message);
    }
  };

  const save = () => {
    setSaved(null);
    startTransition(async () => {
      applied(await saveMealSharesAction(tableOf(draft)), "Table enregistrée.");
    });
  };

  const reset = () => {
    setSaved(null);
    startTransition(async () => {
      applied(
        await resetMealSharesAction(),
        "Les valeurs par défaut s'appliquent à nouveau.",
      );
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <Typography as="span" size="sm" tone="muted">
            Table utilisée :
          </Typography>
          <Badge
            variant={source === "setting" ? "info" : "neutral"}
            tone="subtle"
            size="sm"
          >
            {source === "setting"
              ? "corrigée dans la console"
              : "première proposition, à corriger"}
          </Badge>
        </div>
        {source === "setting" && setAtLabel ? (
          <Typography size="xs" tone="muted">
            Corrigée par {setByName || "un compte supprimé"}, le {setAtLabel}.
          </Typography>
        ) : null}
        {source === "default" ? (
          <Typography size="xs" tone="muted">
            Ces valeurs sont une première proposition de l&apos;équipe REMI.
            Elles ne viennent pas d&apos;un praticien : corrigez-les selon
            votre pratique.
          </Typography>
        ) : null}
      </div>

      {mealConfigurationSlots.map((meal) => (
        <Card key={meal}>
          <CardHeader>
            <CardTitle>{mealSlotLabels[meal]}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-border flex flex-col divide-y">
              {mealOrientations.map((orientation) => {
                const isReference =
                  referenceDayOrientations[meal] === orientation;
                return (
                  <li
                    key={orientation}
                    className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <Typography as="span" size="sm" weight="medium">
                        {mealOrientationLabels[orientation]}
                      </Typography>
                      {isReference ? (
                        <Badge variant="neutral" tone="subtle" size="sm">
                          journée de référence
                        </Badge>
                      ) : null}
                    </div>
                    <div className="flex gap-3">
                      {mealShareNutrients.map((nutrient) => {
                        const id = `share-${meal}-${orientation}-${nutrient}`;
                        const text = draft[meal][orientation][nutrient];
                        return (
                          <label
                            key={nutrient}
                            htmlFor={id}
                            className="flex flex-col gap-1"
                          >
                            <Typography as="span" size="xs" tone="muted">
                              {`${nutrientLabels[nutrient]} (%)`}
                            </Typography>
                            <Input
                              id={id}
                              className="w-24"
                              inputMode="numeric"
                              value={text}
                              invalid={!inRange(numberOf(text))}
                              disabled={pending}
                              onChange={(event) =>
                                setCell(
                                  meal,
                                  orientation,
                                  nutrient,
                                  event.target.value,
                                )
                              }
                            />
                          </label>
                        );
                      })}
                    </div>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      ))}

      <div className="flex flex-col gap-2" role="status">
        <Typography size="sm" weight="medium">
          Contrôle sur la journée de référence
        </Typography>
        <Typography size="sm" tone="muted">
          {`La journée de référence compte les quatre repas : ${mealConfigurationSlots
            .map(
              (meal) =>
                `${mealSlotLabels[meal]} « ${mealOrientationLabels[referenceDayOrientations[meal]]} »`,
            )
            .join(", ")}. Sur cette journée, chaque colonne doit donner 100 %.`}
        </Typography>
        {mealShareNutrients.map((nutrient) => {
          const total = totals[nutrient];
          return (
            <Typography
              key={nutrient}
              size="sm"
              className={total === 100 ? undefined : "text-error-text"}
            >
              {total === null
                ? `${nutrientLabels[nutrient]} : une valeur manque.`
                : `${nutrientLabels[nutrient]} : ${total} %${total === 100 ? "" : " — la somme doit être de 100 %."}`}
            </Typography>
          );
        })}
        {everyCellValid ? null : (
          <Typography size="sm" className="text-error-text">
            {`Chaque part est un nombre entier de ${MEAL_SHARE_MIN} à ${MEAL_SHARE_MAX}.`}
          </Typography>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" onClick={save} disabled={pending || !valid}>
          <Save aria-hidden="true" />
          {pending ? "Enregistrement…" : "Enregistrer"}
        </Button>
        {source === "setting" ? (
          <Button
            type="button"
            variant="ghost"
            onClick={reset}
            disabled={pending}
          >
            <RotateCcw aria-hidden="true" />
            Revenir aux valeurs par défaut
          </Button>
        ) : null}
      </div>

      {error ? (
        <Alert variant="error">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      {saved && !error ? (
        <Typography size="sm" tone="muted" role="status">
          {saved}
        </Typography>
      ) : null}
    </div>
  );
};
