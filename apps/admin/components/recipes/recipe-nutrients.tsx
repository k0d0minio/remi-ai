import type { RecipeNutrientEstimate } from "@remi/services/server";
import {
  formatNumber,
  formatRecipeNutrient,
  kitchenQuantityText,
  recipeNutrientKeys,
  recipeNutrientSources,
} from "@remi/services/shared";
import { Typography } from "@remi/ui/server";

const NOT_COMPUTED = "Non calculé";
const NO_VALUE = "—";

type Line = RecipeNutrientEstimate["lines"][number];

/** Why a line stops the calculation, or null when the line is counted. */
const blockOf = (line: Line): string | null => {
  if (line.foodCode === null) {
    return "pas de code CIQUAL";
  }
  if (line.foodName === null) {
    return "code CIQUAL inconnu";
  }
  return line.grams === null ? "pas de quantité en grammes" : null;
};

type Props = {
  /** Null for a recipe of the old form: it has no structured ingredient. */
  estimate: RecipeNutrientEstimate | null;
};

/**
 * The energy and the macronutrients of a recipe, for the practitioner
 * (REM-191). Each value is an estimate that code computed from CIQUAL. A value
 * that the code cannot compute reads « Non calculé »: the table never shows a
 * partial total. The lines below the table say what was counted, with the
 * CIQUAL name of each food, which states its raw or cooked form, and with the
 * quantity as the patient reads it in the kitchen units of the food.
 */
export const RecipeNutrients = ({ estimate }: Props) => {
  if (estimate === null) {
    return (
      <Typography size="sm" tone="muted">
        {NOT_COMPUTED} — cette recette n&apos;a pas d&apos;ingrédients
        structurés.
      </Typography>
    );
  }
  const { nutrients, lines } = estimate;
  const blocked = lines.some((line) => blockOf(line) !== null);

  return (
    <div className="flex flex-col gap-4">
      <div
        role="table"
        aria-label="Estimation des valeurs nutritionnelles"
        className="border-border grid grid-cols-[1fr_auto_auto] gap-x-6 gap-y-1.5 rounded-lg border p-3"
      >
        <div role="row" className="contents">
          {["Estimation", "Par portion", "Recette entière"].map((heading) => (
            <Typography
              key={heading}
              role="columnheader"
              size="xs"
              tone="muted"
              weight="medium"
            >
              {heading}
            </Typography>
          ))}
        </div>
        {recipeNutrientKeys.map((key) => {
          const amount = nutrients[key];
          return (
            <div key={key} role="row" className="contents">
              <Typography role="rowheader" size="sm">
                {recipeNutrientSources[key].label}
              </Typography>
              <Typography role="cell" size="sm" weight="medium">
                {amount === null
                  ? NOT_COMPUTED
                  : formatRecipeNutrient(key, amount.portion)}
              </Typography>
              <Typography role="cell" size="sm" tone="muted">
                {amount === null
                  ? NOT_COMPUTED
                  : formatRecipeNutrient(key, amount.recipe)}
              </Typography>
            </div>
          );
        })}
      </div>

      {blocked ? (
        <Typography size="sm" tone="muted">
          REMI ne donne jamais un total partiel. Chaque ingrédient doit avoir un
          aliment CIQUAL et une quantité en grammes : choisissez-les sous les
          ingrédients de la recette, puis enregistrez.
        </Typography>
      ) : null}

      <div
        role="table"
        aria-label="Ingrédients comptés dans l'estimation"
        className="border-border grid grid-cols-[1fr_6.5rem_1.5fr] gap-x-3 gap-y-1.5 rounded-lg border p-3"
      >
        <div role="row" className="contents">
          {["Ingrédient", "Quantité", "Aliment CIQUAL compté"].map(
            (heading) => (
              <Typography
                key={heading}
                role="columnheader"
                size="xs"
                tone="muted"
                weight="medium"
              >
                {heading}
              </Typography>
            ),
          )}
        </div>
        {lines.map((line, index) => {
          const block = blockOf(line);
          return (
            // The lines have no id, and two lines can be equal: the place is the key.
            <div key={index} role="row" className="contents">
              <Typography role="cell" size="sm">
                {line.name}
              </Typography>
              <Typography role="cell" size="sm">
                {line.grams === null
                  ? NO_VALUE
                  : `${formatNumber(line.grams)} g`}
                {/* What the patient reads, when it is not the grams. */}
                {line.shown !== null &&
                line.shown !== kitchenQuantityText(line.grams ?? 0, null) ? (
                  <Typography
                    as="span"
                    size="xs"
                    tone="muted"
                    className="block"
                  >
                    {line.grams === null
                      ? line.shown
                      : `affiché : ${line.shown}`}
                  </Typography>
                ) : null}
              </Typography>
              <Typography role="cell" size="sm">
                {line.foodName ?? NO_VALUE}
                {block === null ? null : (
                  <Typography as="span" size="sm" tone="muted">
                    {line.foodName === null ? " " : " — "}
                    {block}
                  </Typography>
                )}
              </Typography>
            </div>
          );
        })}
      </div>
    </div>
  );
};
