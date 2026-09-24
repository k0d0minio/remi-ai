import { Badge, Typography } from "@remi/ui/server";
import { formatDate } from "@remi/services/shared";
import type { PatientGoal, PatientGoalCheckIn } from "@remi/services/shared";
import { GoalScoreStrip } from "@/components/patients/goal-score-strip";
import {
  goalDirectionIntents,
  goalDirectionLabels,
} from "@/components/patients/vocabulary";

type Props = {
  goals: readonly PatientGoal[];
  checkIns: Record<string, readonly PatientGoalCheckIn[]>;
  /** The patient's weekly scores per goal, oldest first. */
  scoreStrips: Record<
    string,
    readonly { id: string; checkedOn: string; score: number }[]
  >;
  /** The patient's lower scores she has not marked « vu » (D-33). */
  awaitingAttention: number;
};

/**
 * The working view's answer to "où en est-on ?": the active goals, each
 * showing its latest measure first and its direction second (§ D, glance-
 * shaped), then the patient's weekly scores as the strip the link shows them
 * (D-9). The full trail and every edit stay in the secondary sections — this
 * block is read, not worked.
 */
export const WorkingGoals = ({
  goals,
  checkIns,
  scoreStrips,
  awaitingAttention,
}: Props) => {
  if (goals.length === 0) {
    return (
      <Typography size="sm" tone="muted">
        Aucun objectif pour le moment.
      </Typography>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <GoalsAwaitingAttention count={awaitingAttention} />
      <ol className="flex flex-col gap-3">
        {goals.map((goal, index) => {
          const latest = checkIns[goal.id]?.[0] ?? null;
          return (
            <li
              key={goal.id}
              className="border-border flex flex-col gap-1 border-b pb-3 last:border-b-0 last:pb-0"
            >
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-xs tabular-nums">
                  {`${index + 1}.`}
                </span>
                <Typography as="h3" size="sm" weight="medium">
                  {goal.title}
                </Typography>
              </div>
              {latest ? (
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 pl-5">
                  {latest.measure ? (
                    <Typography size="sm" weight="medium">
                      {latest.measure}
                    </Typography>
                  ) : null}
                  {latest.direction ? (
                    <Badge
                      variant={goalDirectionIntents[latest.direction]}
                      tone="subtle"
                      size="sm"
                    >
                      {goalDirectionLabels[latest.direction]}
                    </Badge>
                  ) : null}
                  <Typography size="sm" tone="muted">
                    {`le ${formatDate(latest.checkedOn)}`}
                  </Typography>
                </div>
              ) : (
                <Typography size="sm" tone="muted" className="pl-5">
                  Pas encore de point d&apos;étape.
                </Typography>
              )}
              <div className="pl-5">
                <GoalScoreStrip
                  title={goal.title}
                  scores={scoreStrips[goal.id] ?? []}
                />
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
};

/**
 * « N objectif(s) en baisse » — worded and placed like the meals awaiting a
 * reply. Cleared row by row with « Vu » in the goal's trail.
 */
export const GoalsAwaitingAttention = ({ count }: { count: number }) =>
  count > 0 ? (
    <Typography size="sm" tone="muted">
      {count === 1
        ? "1 objectif en baisse attend votre regard."
        : `${count} objectifs en baisse attendent votre regard.`}
    </Typography>
  ) : null;
