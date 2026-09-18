import { notFound } from "next/navigation";
import {
  firstRecommendationPerCategory,
  isLocale,
  localePath,
} from "@remi/services/shared";
import { Card, CardContent, Typography } from "@remi/ui/server";
import { GoalList } from "@/components/patient-link/goal-list";
import { HomeSection } from "@/components/patient-link/home-section";
import { MealEntryPoint } from "@/components/patient-link/meal-entry-point";
import { PantryList } from "@/components/patient-link/pantry-list";
import { RecipeList } from "@/components/patient-link/recipe-list";
import { RecommendationList } from "@/components/patient-link/recommendation-list";
import { SegmentPage } from "@/components/patient-link/segment-page";
import { getContent } from "@/lib/content";
import { loadPatientLink } from "@/lib/patient-link/load";

/** Reads the database on every hit — never prerendered. */
export const dynamic = "force-dynamic";

type Params = { locale: string; token: string };

/**
 * Home: the patient's today, in her § 6 order — « Aujourd'hui / cette semaine »
 * (the goals, then the week's consigne), the prioritised recommendations, the
 * current recipes, the essentials, the way in to a meal, and the living summary
 * last.
 *
 * The summary used to lead. It was the right page when the link was something
 * to read and the wrong one now that it is something to act in: a patient
 * opening this from a message needs what they are being asked to do this week
 * above the fold, and where they have got to underneath it. Nothing is lost —
 * the summary is the same block, further down.
 *
 * Everything below « Aujourd'hui » is a preview onto a segment that already
 * exists, which is why each block links onward and each one disappears when its
 * segment is empty — the same data-driven rule the navigation uses, so the home
 * can never offer a way through to a page that would 404.
 *
 * The consigne rendered here is `patientBody`, the half she writes TO the
 * patient. `body` is § E's line to REMI and never reaches this page — not even
 * as a fallback, which would put a note about someone in front of them.
 *
 * Home always renders, even when nothing is written yet — it carries the
 * greeting and the meal invitation, and a patient whose record is still empty
 * should reach a page rather than a 404.
 */
const PatientLinkHome = async ({ params }: { params: Promise<Params> }) => {
  const { locale, token } = await params;
  if (!isLocale(locale)) {
    notFound();
  }
  const content = getContent(locale).patientLink;

  const data = await loadPatientLink(token);
  if (!data) {
    notFound();
  }

  const { summary, instruction, goals, recommendations, essentials, recipes } =
    data;

  const weekChallenge = instruction?.patientBody ?? null;
  const principales = firstRecommendationPerCategory(recommendations);
  const segment = (path: string) => localePath(locale, `/p/${token}/${path}`);

  const hasToday = goals.length > 0 || weekChallenge !== null;
  // The meal invitation renders unconditionally, so "empty" means every block
  // that depends on her having written something is absent — not just the two
  // the home used to carry.
  const nothingWritten =
    !hasToday &&
    summary === null &&
    principales.length === 0 &&
    recipes.length === 0 &&
    essentials.length === 0;

  return (
    <>
      {hasToday ? (
        <SegmentPage title={content.todayTitle}>
          {goals.length > 0 ? (
            <div className="flex flex-col gap-3">
              <Typography as="h3" size="sm" weight="medium" tone="muted">
                {content.goalsTitle}
              </Typography>
              <GoalList goals={goals} content={content} />
            </div>
          ) : null}

          {weekChallenge !== null ? (
            <Card variant="success">
              <CardContent className="flex flex-col gap-2">
                <Typography as="h3" size="sm" weight="semibold">
                  {content.weekChallengeTitle}
                </Typography>
                <Typography size="sm" className="whitespace-pre-line">
                  {weekChallenge}
                </Typography>
              </CardContent>
            </Card>
          ) : null}
        </SegmentPage>
      ) : null}

      <MealEntryPoint content={content} />

      {principales.length > 0 ? (
        <HomeSection
          title={content.recommendationsTitle}
          seeAll={{
            href: segment("recommandations"),
            label: content.seeAllLabel,
          }}
        >
          <RecommendationList recommendations={principales} content={content} />
        </HomeSection>
      ) : null}

      {recipes.length > 0 ? (
        <HomeSection
          title={content.recipesTitle}
          seeAll={{ href: segment("recettes"), label: content.seeAllLabel }}
        >
          <RecipeList recipes={recipes} content={content} compact />
        </HomeSection>
      ) : null}

      {essentials.length > 0 ? (
        <HomeSection
          title={content.pantryTitle}
          seeAll={{
            href: segment("placard-frigo"),
            label: content.seeAllLabel,
          }}
        >
          <PantryList essentials={essentials} content={content} compact />
        </HomeSection>
      ) : null}

      {summary !== null ? (
        <SegmentPage title={content.summaryTitle}>
          <Typography size="sm" className="whitespace-pre-line">
            {summary.body}
          </Typography>
        </SegmentPage>
      ) : null}

      {nothingWritten ? (
        <Typography size="sm" tone="muted">
          {content.empty}
        </Typography>
      ) : null}
    </>
  );
};

export default PatientLinkHome;
