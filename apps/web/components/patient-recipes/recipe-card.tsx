import {
  formatRecipeMinutes,
  recipeStepDetails,
  type PatientRecipeCard,
} from "@remi/services/shared";
import { Badge, Typography } from "@remi/ui/server";
import { fill } from "@/lib/content/fill";
import type { Content } from "@/lib/content/types";

type Props = {
  card: PatientRecipeCard;
  content: Content["patientRecipeCard"];
};

type FactProps = { label: string; value: string };

const Fact = ({ label, value }: FactProps) => (
  <div className="bg-muted flex flex-col gap-0.5 rounded-xl px-3 py-2">
    <Typography as="dt" size="xs" tone="muted">
      {label}
    </Typography>
    <Typography as="dd" size="sm" weight="semibold">
      {value}
    </Typography>
  </div>
);

/**
 * The recipe as the patient cooks it (REM-94, story 25): the name, the
 * description, the times, the portions, the ingredients with a quantity and a
 * unit for each line, and the numbered steps. The quantity of a line is
 * `card.amounts`: a weight in grams shows in the kitchen units of its food
 * (« 2 œufs », « 1 c. à soupe »), or in grams (REM-190, REM-192).
 *
 * It renders from its props only, and only a card that the compatibility gate
 * confirmed (`getPatientRecipeCard`). A value that the recipe does not give
 * shows as « Non renseigné » or does not show: no value is invented (D-30).
 *
 * Read-only for now. The places of the next tickets:
 * - REM-96 (portions): the « Portions » fact becomes the control, and the
 *   ingredient amounts follow it.
 * - REM-95 (favourites): one control beside the title.
 * - REM-98 (shopping list): the one dominant action, below the ingredients.
 */
export const RecipeCard = ({ card, content }: Props) => {
  const recipe = card.content;
  const time = (minutes: number | null) =>
    minutes === null ? content.notEntered : formatRecipeMinutes(minutes);

  return (
    <article className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <Badge
          variant={card.source === "remi" ? "info" : "neutral"}
          tone="subtle"
          className="self-start"
        >
          {card.source === "remi"
            ? content.proposedByRemi
            : content.chosenByPractitioner}
        </Badge>
        <Typography
          as="h1"
          size="2xl"
          weight="semibold"
          className="break-words"
        >
          {card.title}
        </Typography>
        {recipe.description !== "" ? (
          <Typography tone="muted" className="break-words">
            {recipe.description}
          </Typography>
        ) : null}
        <dl className="grid grid-cols-3 gap-2">
          <Fact label={content.prep} value={time(recipe.prepMinutes)} />
          <Fact label={content.cook} value={time(recipe.cookMinutes)} />
          <Fact label={content.portions} value={String(recipe.portions)} />
        </dl>
      </header>

      {card.justification !== "" ? (
        <section className="border-border flex flex-col gap-1 rounded-2xl border p-4">
          <Typography as="h2" size="sm" weight="semibold">
            {content.justificationTitle}
          </Typography>
          <Typography size="sm" className="whitespace-pre-line break-words">
            {card.justification}
          </Typography>
        </section>
      ) : null}

      <section className="flex flex-col gap-3">
        <div className="flex flex-col gap-0.5">
          <Typography as="h2" size="lg" weight="semibold">
            {content.ingredientsTitle}
          </Typography>
          <Typography size="sm" tone="muted">
            {recipe.portions === 1
              ? content.ingredientsForOne
              : fill(content.ingredientsForMany, { count: recipe.portions })}
          </Typography>
        </div>
        <ul className="divide-border flex flex-col divide-y">
          {recipe.ingredients.map((ingredient, index) => (
            // The lines have no id, and two lines can be equal: the place is the key.
            <li key={index} className="flex gap-3 py-2.5">
              <Typography
                as="span"
                weight="semibold"
                className="w-24 shrink-0 tabular-nums"
              >
                {card.amounts[index] ?? ""}
              </Typography>
              <Typography as="span" className="min-w-0 break-words">
                {ingredient.name}
                {ingredient.note !== "" ? (
                  <Typography as="span" tone="muted">
                    {`, ${ingredient.note}`}
                  </Typography>
                ) : null}
              </Typography>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex flex-col gap-3">
        <Typography as="h2" size="lg" weight="semibold">
          {content.stepsTitle}
        </Typography>
        <ol className="flex flex-col gap-5">
          {recipe.steps.map((step, index) => {
            const details = recipeStepDetails(step);
            return (
              <li key={index} className="flex gap-3">
                <Typography
                  as="span"
                  size="sm"
                  weight="semibold"
                  aria-hidden="true"
                  className="bg-primary text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-full"
                >
                  {index + 1}
                </Typography>
                <div className="flex min-w-0 flex-col gap-2 pt-1">
                  <Typography className="whitespace-pre-line break-words">
                    {step.text}
                  </Typography>
                  {details.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {details.map((detail) => (
                        <Badge key={detail} variant="neutral" tone="subtle">
                          {detail}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ol>
      </section>
    </article>
  );
};
