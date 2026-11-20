import { Card, CardContent, Typography } from "@remi/ui/server";
import type { Content } from "@/lib/content/types";
import type { PlannedMeal } from "@/lib/meals/state";

type Props = {
  meal: PlannedMeal;
  content: Content["patientMeal"]["saved"];
};

/**
 * What the home page shows after a meal is saved. Today it confirms the save
 * and says that the suggestion is not there yet. `meal-improvement/meal-suggestion`
 * puts REMI's two blocks in this component.
 */
export const MealResult = ({ meal, content }: Props) => (
  <Card>
    <CardContent className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <Typography as="h2" size="lg" weight="semibold">
          {content.title}
        </Typography>
        <Typography tone="muted">{content.soon}</Typography>
      </div>
      <div className="flex flex-col gap-1">
        <Typography as="h3" size="sm" weight="medium" tone="muted">
          {content.mealLabel}
        </Typography>
        <Typography className="whitespace-pre-line break-words">
          {meal.description}
        </Typography>
      </div>
    </CardContent>
  </Card>
);
