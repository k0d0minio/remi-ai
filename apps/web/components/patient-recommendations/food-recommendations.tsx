import {
  formatDate,
  type ValidatedRecommendationsView,
} from "@remi/services/shared";
import { Card, CardContent, Typography } from "@remi/ui/server";
import { AdviceList } from "@/components/patient-recommendations/advice-list";
import { fill } from "@/lib/content/fill";
import type { Content } from "@/lib/content/types";

type Props = {
  view: Pick<
    ValidatedRecommendationsView,
    "evictions" | "favour" | "limit" | "foodAdvice"
  >;
  content: Content["patientRecommendations"];
};

/** Noon in UTC is the same calendar day in each time zone of the practice. */
const dayLabel = (day: string) => formatDate(`${day}T12:00:00Z`);

/**
 * « Recommandations alimentaires » (story 23, REM-88): the total evictions
 * first and in their own card, then « À favoriser » and « À limiter ». Each
 * term is the practitioner's term, as typed. A list with no item does not
 * show. The block renders from the view only, so the Profil tab can show it
 * again with no second read.
 */
export const FoodRecommendations = ({ view, content }: Props) => (
  <div className="flex flex-col gap-6">
    {view.evictions.length > 0 ? (
      <Card variant="warning" elevation="flat">
        <CardContent className="flex flex-col gap-3">
          <Typography as="h3" weight="semibold">
            {content.evictionsTitle}
          </Typography>
          <ul className="flex flex-col gap-3">
            {view.evictions.map((eviction) => (
              <li key={eviction.id} className="flex flex-col">
                <Typography weight="medium" className="break-words">
                  {eviction.term}
                </Typography>
                <Typography size="sm" tone="muted">
                  {[
                    eviction.startsOn
                      ? fill(content.evictionFrom, {
                          date: dayLabel(eviction.startsOn),
                        })
                      : null,
                    eviction.endsOn
                      ? fill(content.evictionUntil, {
                          date: dayLabel(eviction.endsOn),
                        })
                      : content.evictionDurable,
                  ]
                    .filter((part) => part !== null)
                    .join(", ")}
                </Typography>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    ) : null}

    {view.favour.length > 0 ? (
      <div className="flex flex-col gap-2">
        <Typography as="h3" weight="semibold">
          {content.favourTitle}
        </Typography>
        <ul className="flex list-disc flex-col gap-1 pl-5">
          {view.favour.map((directive) => (
            <li key={directive.id}>
              <Typography as="span" className="break-words">
                {directive.term}
              </Typography>
            </li>
          ))}
        </ul>
      </div>
    ) : null}

    {view.limit.length > 0 ? (
      <div className="flex flex-col gap-2">
        <Typography as="h3" weight="semibold">
          {content.limitTitle}
        </Typography>
        <ul className="flex list-disc flex-col gap-1 pl-5">
          {view.limit.map((directive) => (
            <li key={directive.id}>
              <Typography as="span" className="break-words">
                {directive.term}
              </Typography>
              {directive.limitLevel ? (
                <Typography as="span" size="sm" tone="muted">
                  {" "}
                  ({content.limitLevels[directive.limitLevel]})
                </Typography>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    ) : null}

    {view.foodAdvice.length > 0 ? (
      <div className="flex flex-col gap-2">
        <Typography as="h3" weight="semibold">
          {content.foodAdviceTitle}
        </Typography>
        <AdviceList items={view.foodAdvice} />
      </div>
    ) : null}
  </div>
);
