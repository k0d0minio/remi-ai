import { notFound } from "next/navigation";
import {
  addDays,
  formatDate,
  isLocale,
  todayAtPractice,
} from "@remi/services/shared";
import { Card, CardContent, Typography } from "@remi/ui/server";
import { GoalScoreStrip } from "@/components/patient-link/goal-score-strip";
import { SegmentPage } from "@/components/patient-link/segment-page";
import { getContent } from "@/lib/content";
import { hasSegment, loadPatientLink } from "@/lib/patient-link/load";

/** Reads the database on every hit — never prerendered. */
export const dynamic = "force-dynamic";

type Params = { locale: string; token: string };

/**
 * « Ma progression » — the page the old version promised and never built,
 * kept by D-9: each goal's weekly scores as a strip, the consigne in force,
 * the meals logged in the last seven days, and the challenges already behind
 * the patient with how each ended.
 *
 * "Logged" counts the meals the patient says they ate, not the ones only
 * planned: a « je vais manger » that never became « j'ai mangé » is an
 * intention, and counting it would flatter the week.
 */
const Segment = async ({ params }: { params: Promise<Params> }) => {
  const { locale, token } = await params;
  if (!isLocale(locale)) {
    notFound();
  }
  const content = getContent(locale).patientLink;

  const data = await loadPatientLink(token);
  if (!data || !hasSegment(data, "progression")) {
    notFound();
  }

  const copy = content.progression;
  const consigne = data.instruction?.patientBody ?? null;
  const weekStart = addDays(todayAtPractice(), -6);
  const mealsThisWeek = data.meals.filter(
    (meal) => meal.intent === "eaten" && meal.eatenOn >= weekStart,
  ).length;
  const strips = new Map(
    data.scoreStrips.map((strip) => [strip.goalId, strip.scores]),
  );

  return (
    <SegmentPage title={copy.title}>
      <Typography size="sm" tone="muted">
        {copy.lead}
      </Typography>

      {data.goals.map((goal) => (
        <GoalScoreStrip
          key={goal.id}
          title={goal.title}
          scores={strips.get(goal.id) ?? []}
          locale={locale}
          stripLabel={copy.stripLabel}
          emptyLabel={copy.noScores}
        />
      ))}

      {consigne !== null ? (
        <Card variant="success">
          <CardContent className="flex flex-col gap-2">
            <Typography as="h3" size="sm" weight="semibold">
              {copy.instructionTitle}
            </Typography>
            <Typography size="sm" className="whitespace-pre-line">
              {consigne}
            </Typography>
          </CardContent>
        </Card>
      ) : null}

      <Typography size="sm">
        {copy.mealsLabel}{" "}
        <Typography as="span" size="sm" weight="semibold">
          {mealsThisWeek}
        </Typography>
      </Typography>

      {data.pastChallenges.length > 0 ? (
        <div className="flex flex-col gap-3">
          <Typography as="h3" size="sm" weight="medium" tone="muted">
            {copy.pastChallengesTitle}
          </Typography>
          <ul className="flex flex-col gap-3">
            {data.pastChallenges.map((challenge) => (
              <li key={challenge.id} className="flex flex-col gap-0.5">
                <Typography size="sm" weight="medium">
                  {challenge.text}
                </Typography>
                <Typography size="xs" tone="muted">
                  {formatDate(challenge.startedOn, locale)}{" "}
                  {copy.challengeUntil}{" "}
                  {challenge.closedOn
                    ? formatDate(challenge.closedOn, locale)
                    : ""}
                  {challenge.outcome
                    ? ` · ${copy.outcomes[challenge.outcome]}`
                    : ""}
                </Typography>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </SegmentPage>
  );
};

export default Segment;
