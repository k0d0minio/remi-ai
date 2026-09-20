import type { ReactNode } from "react";
import {
  formatDate,
  isCheckInCategory,
  todayAtPractice,
} from "@remi/services/shared";
import type { Locale } from "@remi/services/shared";
import {
  Card,
  CardContent,
  CheckInStrip,
  Typography,
  type CheckInMark,
} from "@remi/ui/server";
import type { Content } from "@/lib/content/types";
import type { PatientLinkData } from "@/lib/patient-link/load";

type Props = {
  data: PatientLinkData;
  locale: Locale;
  content: Content["patientLink"];
};

/**
 * « Ma progression » — what the patient has answered, and where they are.
 *
 * The page the old version promised and never built (V2's « Ma progression »,
 * "pas encore créé"), kept to what a one-tap answer can honestly support: a
 * strip per subject, the consigne, and the week's meals. No score, no average,
 * no trend line — three faces do not add up to a number, and presenting them as
 * one would be the product claiming to know more than it does.
 */
export const ProgressionView = ({ data, locale, content }: Props) => {
  const since = eightWeeksAgo();
  const instruction = data.instruction?.patientBody ?? null;
  const mealsThisWeek = data.meals.filter((meal) =>
    isWithinThisWeek(meal.eatenOn),
  ).length;

  const goals = data.checkIns.goals.map((trail) => ({
    id: trail.goal.id,
    title: trail.goal.title,
    marks: marksFrom(
      trail.checkIns.filter((entry) => entry.checkedOn >= since),
      (entry) => entry.writtenBy === "patient",
    ),
  }));

  // Answered recommendations only: the protocol itself is the recommandations
  // segment's job, and a strip with nothing on it for every recommendation she
  // has ever written would bury the goals under empty rows.
  const recommendations = data.checkIns.recommendations
    .filter(
      (trail) =>
        isCheckInCategory(trail.recommendation.category) &&
        trail.checkIns.length > 0,
    )
    .map((trail) => ({
      id: trail.recommendation.id,
      title: trail.recommendation.title,
      marks: marksFrom(
        trail.checkIns.filter((entry) => entry.checkedOn >= since),
        () => true,
      ),
    }));

  if (goals.length === 0 && recommendations.length === 0) {
    return (
      <Typography size="sm" tone="muted">
        {content.checkIn.empty}
      </Typography>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {instruction !== null ? (
        <Card variant="success">
          <CardContent className="flex flex-col gap-2">
            <Typography as="h3" size="sm" weight="semibold">
              {content.checkIn.instructionLabel}
            </Typography>
            <Typography size="sm" className="whitespace-pre-line">
              {instruction}
            </Typography>
          </CardContent>
        </Card>
      ) : null}

      {goals.length > 0 ? (
        <Section heading={content.checkIn.goalsHeading}>
          {goals.map((goal) => (
            <SubjectStrip
              key={goal.id}
              title={goal.title}
              marks={goal.marks}
              locale={locale}
              content={content}
            />
          ))}
        </Section>
      ) : null}

      {recommendations.length > 0 ? (
        <Section heading={content.checkIn.recommendationsHeading}>
          {recommendations.map((recommendation) => (
            <SubjectStrip
              key={recommendation.id}
              title={recommendation.title}
              marks={recommendation.marks}
              locale={locale}
              content={content}
            />
          ))}
        </Section>
      ) : null}

      <Typography size="sm" tone="muted">
        {`${mealsThisWeek} ${content.checkIn.mealsThisWeek}`}
      </Typography>
    </div>
  );
};

const Section = ({
  heading,
  children,
}: {
  heading: string;
  children: ReactNode;
}) => (
  <div className="flex flex-col gap-4">
    <Typography as="h3" size="sm" weight="medium" tone="muted">
      {heading}
    </Typography>
    {children}
  </div>
);

const SubjectStrip = ({
  title,
  marks,
  locale,
  content,
}: {
  title: string;
  marks: readonly CheckInMark[];
  locale: Locale;
  content: Content["patientLink"];
}) => (
  <div className="flex flex-col gap-2">
    <Typography as="h4" size="sm" weight="medium">
      {title}
    </Typography>
    <CheckInStrip
      marks={marks}
      label={content.checkIn.stripLabel}
      empty={content.checkIn.stripEmpty}
      directionLabels={content.checkIn.directions}
      formatDate={(value) => formatDate(value, locale)}
    />
  </div>
);

/**
 * Oldest first: the trails arrive newest first because that is how both
 * consoles read them, and a timeline reads the other way.
 *
 * A goal check-in with no direction is one of Morgane's measure-only rows; it
 * has no face to draw, so it is skipped rather than guessed at.
 */
type AnsweredRow = {
  id: string;
  checkedOn: string;
  direction: CheckInMark["direction"] | null;
  note: string;
};

const marksFrom = (
  entries: readonly AnsweredRow[],
  fromPatient: (entry: AnsweredRow) => boolean,
): readonly CheckInMark[] =>
  [...entries].reverse().flatMap((entry) =>
    entry.direction === null
      ? []
      : [
          {
            id: entry.id,
            checkedOn: entry.checkedOn,
            direction: entry.direction,
            note: entry.note,
            fromPatient: fromPatient(entry),
          },
        ],
  );

/**
 * The window the strip draws. Older answers stay stored and are simply not
 * drawn — eight weeks is two months of one-tap answers, which is as far back as
 * a strip stays readable on a phone.
 */
const eightWeeksAgo = (): string => {
  const day = new Date(`${todayAtPractice()}T00:00:00Z`);
  day.setUTCDate(day.getUTCDate() - 8 * 7);
  return day.toISOString().slice(0, 10);
};

/** Monday as the first day — the consultation week Morgane works in. */
const isWithinThisWeek = (day: string): boolean => {
  const monday = new Date(`${todayAtPractice()}T00:00:00Z`);
  monday.setUTCDate(monday.getUTCDate() - ((monday.getUTCDay() + 6) % 7));
  return day >= monday.toISOString().slice(0, 10);
};
