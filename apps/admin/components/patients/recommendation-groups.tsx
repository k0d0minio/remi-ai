import type { PatientRecommendation } from "@remi/services/shared";
import { recommendationCategories } from "@remi/services/shared";
import { Typography } from "@remi/ui/server";
import { RecommendationItem } from "@/components/patients/recommendation-item";
import { categoryLabels } from "@/components/patients/vocabulary";

type Props = {
  /** Already ordered by the service: category, then rank within it. */
  recommendations: readonly PatientRecommendation[];
};

/**
 * The protocol, grouped by category.
 *
 * The grouping is derived here rather than stored, because the service already
 * returns the entries in category-then-rank order — this walks that order and
 * puts a heading in front of each run. Reordering is scoped to a category for
 * the same reason: the category order is the vocabulary's, not Morgane's, so
 * the only rank she can set is the one inside a group.
 */
export const RecommendationGroups = ({ recommendations }: Props) => {
  const groups = recommendationCategories
    .map((category) => ({
      category,
      entries: recommendations.filter(
        (recommendation) => recommendation.category === category,
      ),
    }))
    .filter((group) => group.entries.length > 0);

  return (
    <div className="flex flex-col gap-6">
      {groups.map((group) => (
        <div key={group.category} className="flex flex-col gap-2">
          <Typography as="h3" variant="eyebrow" tone="muted">
            {categoryLabels[group.category]}
          </Typography>

          <ul className="flex flex-col gap-3">
            {group.entries.map((recommendation, index) => (
              <RecommendationItem
                key={recommendation.id}
                recommendation={recommendation}
                canMoveUp={index > 0}
                canMoveDown={index < group.entries.length - 1}
              />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};
