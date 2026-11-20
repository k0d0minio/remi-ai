import {
  formatRecipeMinutes,
  type RecipeIngredient,
  type RecipeStep,
} from "@remi/services/shared";
import { Badge, Typography } from "@remi/ui/server";
import {
  quantityText,
  unitText,
} from "@/components/recipes/vocabulary";

type IngredientsProps = {
  ingredients: readonly RecipeIngredient[];
};

/**
 * The ingredient lines as REMI reads them: one row for each line, with the
 * quantity, the unit and the food apart. The practitioner sees a line that
 * REMI did not split, and corrects the text of that line.
 */
export const IngredientPreview = ({ ingredients }: IngredientsProps) => (
  <div
    role="table"
    aria-label="Ingrédients lus par REMI"
    className="border-border grid grid-cols-[4.5rem_5.5rem_1fr] gap-x-3 gap-y-1.5 rounded-lg border p-3"
  >
    <div role="row" className="contents">
      {["Quantité", "Unité", "Aliment"].map((heading) => (
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
    {ingredients.map((ingredient, index) => (
      // The lines have no id, and two lines can be equal: the place is the key.
      <div key={index} role="row" className="contents">
        <Typography role="cell" size="sm">
          {quantityText(ingredient)}
        </Typography>
        <Typography role="cell" size="sm">
          {unitText(ingredient)}
        </Typography>
        <Typography role="cell" size="sm">
          {ingredient.name}
          {ingredient.note ? (
            <Typography as="span" size="sm" tone="muted">
              {" "}
              — {ingredient.note}
            </Typography>
          ) : null}
        </Typography>
      </div>
    ))}
  </div>
);

type StepsProps = {
  steps: readonly RecipeStep[];
};

/** The steps in order, each with the temperature and the duration REMI read. */
export const StepPreview = ({ steps }: StepsProps) => (
  <ol className="border-border flex flex-col gap-2 rounded-lg border p-3">
    {steps.map((step, index) => (
      <li key={index} className="flex gap-3">
        <Typography size="sm" weight="medium" tone="muted" className="w-5 shrink-0">
          {index + 1}.
        </Typography>
        <div className="flex flex-col gap-1">
          <Typography size="sm">{step.text}</Typography>
          {step.temperatureC !== null || step.durationMinutes !== null ? (
            <div className="flex flex-wrap gap-1.5">
              {step.temperatureC !== null ? (
                <Badge variant="neutral" tone="subtle" size="sm">
                  {step.temperatureC} °C
                </Badge>
              ) : null}
              {step.durationMinutes !== null ? (
                <Badge variant="neutral" tone="subtle" size="sm">
                  {formatRecipeMinutes(step.durationMinutes)}
                </Badge>
              ) : null}
            </div>
          ) : null}
        </div>
      </li>
    ))}
  </ol>
);
