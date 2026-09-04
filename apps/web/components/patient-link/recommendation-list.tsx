import type { PatientRecommendation } from "@remi/services/shared";
import { Badge, Card, CardContent, Typography } from "@remi/ui/server";
import type { Content } from "@/lib/content/types";

type Props = {
  recommendations: readonly PatientRecommendation[];
  content: Content["patientLink"];
};

/** What the single page showed, moved behind its own route unchanged. */
export const RecommendationList = ({ recommendations, content }: Props) => (
  <ul className="flex flex-col gap-3">
    {recommendations.map((recommendation) => (
      <li key={recommendation.id}>
        <Card>
          <CardContent className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="info" tone="subtle" size="sm">
                {content.categories[recommendation.category]}
              </Badge>
              <Typography as="h3" size="sm" weight="medium">
                {recommendation.title}
              </Typography>
            </div>
            {recommendation.detail ? (
              <Typography
                size="sm"
                tone="muted"
                className="whitespace-pre-line"
              >
                {recommendation.detail}
              </Typography>
            ) : null}
          </CardContent>
        </Card>
      </li>
    ))}
  </ul>
);
