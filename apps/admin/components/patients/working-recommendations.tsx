import { Typography } from "@remi/ui/server";
import { recommendationCategories } from "@remi/services/shared";
import type { PatientRecommendation } from "@remi/services/shared";
import { categoryLabels } from "@/components/patients/vocabulary";

type Props = {
  recommendations: readonly PatientRecommendation[];
};

/**
 * The working view's answer to "que dois-je faire maintenant ?": the first
 * active recommendation of each category (§ 9 — not flagged, not a top-N). One
 * compact row per category; the full protocol, all categories and all entries,
 * stays in the secondary sections.
 */
export const WorkingRecommendations = ({ recommendations }: Props) => {
  const rows = recommendationCategories.flatMap((category) => {
    const first = recommendations.find(
      (recommendation) => recommendation.category === category,
    );
    return first ? [{ category, first }] : [];
  });

  if (rows.length === 0) {
    return (
      <Typography size="sm" tone="muted">
        Rien d&apos;encodé pour le moment.
      </Typography>
    );
  }

  return (
    <ol className="flex flex-col gap-2">
      {rows.map(({ category, first }) => (
        <li
          key={category}
          className="border-border flex flex-col gap-0.5 border-b pb-2 last:border-b-0"
        >
          <Typography variant="eyebrow" tone="muted">
            {categoryLabels[category]}
          </Typography>
          <Typography size="sm" weight="medium">
            {first.title}
          </Typography>
          {first.detail ? (
            <Typography size="sm" tone="muted" className="line-clamp-2">
              {first.detail}
            </Typography>
          ) : null}
        </li>
      ))}
    </ol>
  );
};
