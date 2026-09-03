import type { PatientGoal, PatientGoalCheckIn } from "@remi/services/shared";
import { GoalItem } from "@/components/patients/goal-item";

type Props = {
  /** Already ordered by the service — her priority order, or archive date. */
  goals: readonly PatientGoal[];
  /** Every goal's trail, keyed by goal id and newest first within each. */
  checkIns: Record<string, readonly PatientGoalCheckIn[]>;
  /** Numbered in the active list; the archived one is a record, not a ranking. */
  ranked: boolean;
  today: string;
};

export const GoalList = ({ goals, checkIns, ranked, today }: Props) => (
  <ul className="flex flex-col gap-3">
    {goals.map((goal, index) => (
      <GoalItem
        key={goal.id}
        goal={goal}
        checkIns={checkIns[goal.id] ?? []}
        rank={ranked ? index + 1 : undefined}
        canMoveUp={ranked && index > 0}
        canMoveDown={ranked && index < goals.length - 1}
        today={today}
      />
    ))}
  </ul>
);
