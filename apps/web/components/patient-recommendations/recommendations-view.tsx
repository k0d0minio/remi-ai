import type { ReactNode } from "react";
import {
  hasFoodRecommendations,
  type ValidatedRecommendationsView,
} from "@remi/services/shared";
import { Typography } from "@remi/ui/server";
import { AdviceList } from "@/components/patient-recommendations/advice-list";
import { FoodRecommendations } from "@/components/patient-recommendations/food-recommendations";
import type { Content } from "@/lib/content/types";

type Props = {
  view: ValidatedRecommendationsView;
  content: Content["patientRecommendations"];
};

type CategoryProps = { title: string; children: ReactNode };

const Category = ({ title, children }: CategoryProps) => (
  <section className="flex flex-col gap-4">
    <Typography as="h2" size="lg" weight="semibold">
      {title}
    </Typography>
    {children}
  </section>
);

/**
 * The categories of story 23, in Morgane's order: 1 the supplements, 2 the
 * lifestyle advice, 3 the food recommendations, 4 the priority goals. A
 * category with no item does not show. Category 5 « Autres recommandations »
 * has no source yet (the breakdown's question 1), so it is not here.
 *
 * Read-only: no control adds, edits or deletes. An empty field of the
 * practitioner shows nothing, and no value is generated (D-30).
 */
export const RecommendationsView = ({ view, content }: Props) => {
  const hasSupplements =
    view.supplements.length > 0 || view.supplementAdvice.length > 0;
  const hasFood = hasFoodRecommendations(view);

  return (
    <div className="flex flex-col gap-8">
      {hasSupplements ? (
        <Category title={content.supplementsTitle}>
          {view.supplements.length > 0 ? (
            <ul className="flex flex-col gap-4">
              {view.supplements.map((supplement) => {
                const details: [string, string][] = [
                  [content.doseLabel, supplement.dose],
                  [content.timingLabel, supplement.timing],
                  [content.reasonLabel, supplement.reason],
                ];
                return (
                  <li key={supplement.id} className="flex flex-col gap-1">
                    <Typography weight="medium" className="break-words">
                      {supplement.name}
                    </Typography>
                    {details.map(([label, value]) =>
                      value.trim() !== "" ? (
                        <Typography
                          key={label}
                          size="sm"
                          tone="muted"
                          className="whitespace-pre-line break-words"
                        >
                          {label} : {value}
                        </Typography>
                      ) : null,
                    )}
                  </li>
                );
              })}
            </ul>
          ) : null}
          {view.supplementAdvice.length > 0 ? (
            <AdviceList items={view.supplementAdvice} />
          ) : null}
        </Category>
      ) : null}

      {view.lifestyle.length > 0 ? (
        <Category title={content.lifestyleTitle}>
          {view.lifestyle.map((group) => (
            <div key={group.category} className="flex flex-col gap-2">
              <Typography as="h3" weight="semibold">
                {content.lifestyleCategories[group.category]}
              </Typography>
              <AdviceList items={group.items} />
            </div>
          ))}
        </Category>
      ) : null}

      {hasFood ? (
        <Category title={content.foodTitle}>
          <FoodRecommendations view={view} content={content} />
        </Category>
      ) : null}

      {view.goals.length > 0 ? (
        <Category title={content.goalsTitle}>
          <ol className="flex list-decimal flex-col gap-1 pl-5">
            {view.goals.map((goal) => (
              <li key={goal.id}>
                <Typography as="span" className="break-words">
                  {goal.title}
                </Typography>
              </li>
            ))}
          </ol>
        </Category>
      ) : null}
    </div>
  );
};
