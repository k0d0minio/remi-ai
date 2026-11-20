import NextLink from "next/link";
import {
  formatNumber,
  mealTargets,
  type DayTargets,
  type MealConfiguration,
  type MealShareTable,
  type MealTargetStatus,
} from "@remi/services/shared";
import { Link, Typography } from "@remi/ui/server";
import {
  mealOrientationLabels,
  mealSlotLabels,
} from "@/components/patients/meal-configuration-labels";

type Props = {
  /** Null: the practitioner has entered no value. */
  configuration: MealConfiguration | null;
  /** The validated values of the day. Null: no validated value (D-30). */
  day: DayTargets;
  /** The table in use: the console setting, or the code default. */
  table: MealShareTable;
};

const columnText = (
  status: MealTargetStatus,
  value: number | null,
  unit: string,
  noTarget: string,
): string => {
  if (status === "no_validated_target" || value === null) {
    return noTarget;
  }
  return `${formatNumber(value)} ${unit}`;
};

/**
 * « Objectif de chaque repas » in the section « Repas » (REM-197): the part
 * of the day's validated energy and protein that each active meal carries.
 * Read-only. Each value is an « estimation »: a soft target that comes from
 * the table of the meal shares, not a quota (story 11).
 *
 * The values come from the validated values only. With no validated value,
 * the block says so and shows no number (D-30).
 */
export const MealTargetsBlock = ({ configuration, day, table }: Props) => {
  const targets = mealTargets(configuration, day, table);
  const active = targets.meals.filter((meal) => meal.active);
  // Why the block shows no value, or null when it shows the meals.
  let nothing: string | null = null;
  if (active.length === 0) {
    nothing = "Aucun repas actif : aucun objectif par repas.";
  } else if (
    targets.energy === "no_validated_target" &&
    targets.protein === "no_validated_target"
  ) {
    nothing =
      "Aucun objectif par repas : les besoins énergétiques et protéiques de la journée ne sont pas validés.";
  }

  return (
    <div className="border-border mt-5 flex flex-col gap-3 border-t pt-5">
      <div className="flex flex-col gap-1">
        <Typography as="h3" size="sm" weight="medium">
          Objectif de chaque repas (estimation)
        </Typography>
        <Typography size="sm" tone="muted">
          REMI répartit les objectifs validés de la journée entre les repas
          actifs, selon la table{" "}
          <Link as={NextLink} href="/meal-shares">
            Parts des repas
          </Link>. Un repas désactivé
          ou supprimé par le jeûne intermittent reçoit zéro, et sa part passe
          aux autres repas. Ces valeurs sont une estimation, pas un quota
          strict.
        </Typography>
      </div>

      {nothing ? (
        <Typography size="sm" tone="muted">
          {nothing}
        </Typography>
      ) : (
        <ul className="divide-border flex flex-col divide-y">
          {active.map((meal) => (
            <li
              key={meal.meal}
              className="flex flex-col gap-0.5 py-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4"
            >
              <Typography as="span" size="sm">
                {mealSlotLabels[meal.meal]}
                {meal.orientation ? (
                  <Typography as="span" size="sm" tone="muted">
                    {` · ${mealOrientationLabels[meal.orientation]}`}
                  </Typography>
                ) : null}
              </Typography>
              <Typography as="span" size="sm">
                {`${columnText(
                  targets.energy,
                  meal.energyKcal,
                  "kcal",
                  "énergie non validée",
                )} · ${columnText(
                  targets.protein,
                  meal.proteinG,
                  "g de protéines",
                  "protéines non validées",
                )}`}
                <Typography as="span" size="xs" tone="muted">
                  {" (estimation)"}
                </Typography>
              </Typography>
            </li>
          ))}
          <li className="flex flex-col gap-0.5 py-2 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
            <Typography as="span" size="sm" tone="muted">
              Journée (valeurs validées)
            </Typography>
            <Typography as="span" size="sm" tone="muted">
              {`${columnText(
                targets.energy,
                day.energyKcal,
                "kcal",
                "énergie non validée",
              )} · ${columnText(
                targets.protein,
                day.proteinG,
                "g de protéines",
                "protéines non validées",
              )}`}
            </Typography>
          </li>
        </ul>
      )}
    </div>
  );
};
