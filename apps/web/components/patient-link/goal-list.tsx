import type { PatientGoal } from "@remi/services/shared";
import { Card, CardContent, Typography } from "@remi/ui/server";
import type { Content } from "@/lib/content/types";

type Props = {
  goals: readonly PatientGoal[];
  content: Content["patientLink"];
};

/**
 * The priority goals in Morgane's order, each with the starting point she
 * wrote where there is one — § D's structured replacement for the profile's
 * free-text objective. The check-ins stay in the console: her record of how a
 * goal is moving is not the patient's page.
 */
export const GoalList = ({ goals, content }: Props) => (
  <ul className="flex flex-col gap-3">
    {goals.map((goal) => (
      <li key={goal.id}>
        <Card>
          <CardContent className="flex flex-col gap-2">
            <Typography as="h3" size="sm" weight="medium">
              {goal.title}
            </Typography>
            {goal.baseline.trim() !== "" ? (
              <Typography size="sm" tone="muted">
                {content.baselineLabel} : {goal.baseline}
              </Typography>
            ) : null}
          </CardContent>
        </Card>
      </li>
    ))}
  </ul>
);
