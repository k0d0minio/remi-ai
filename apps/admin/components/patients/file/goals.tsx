import type { ComponentProps } from "react";
import { MAX_ACTIVE_GOALS } from "@remi/services/server";
import { Typography } from "@remi/ui/server";
import { GoalAddForm } from "@/components/patients/goal-add-form";
import {
  GoalList,
  GoalsAwaitingAttention,
} from "@/components/patients/goal-list";
import { InstructionBlock } from "@/components/patients/instruction-block";
import { SectionFold } from "@/components/patients/section-fold";

type GoalListProps = ComponentProps<typeof GoalList>;
type InstructionProps = ComponentProps<typeof InstructionBlock>;

type Props = {
  patientId: string;
  pseudonym: string;
  goals: GoalListProps["goals"];
  archivedGoals: GoalListProps["goals"];
  checkIns: GoalListProps["checkIns"];
  awaitingAttention: number;
  instruction: InstructionProps["instruction"];
  supersededInstructions: InstructionProps["superseded"];
  today: string;
};

/** « Objectifs et consigne »: the goals in her order, then the instruction. */
export const GoalsSection = ({
  patientId,
  pseudonym,
  goals,
  archivedGoals,
  checkIns,
  awaitingAttention,
  instruction,
  supersededInstructions,
  today,
}: Props) => (
  <>
    <GoalsAwaitingAttention count={awaitingAttention} />
    {goals.length === 0 ? (
      <Typography size="sm" tone="muted">
        Aucun objectif pour le moment.
      </Typography>
    ) : (
      <GoalList goals={goals} checkIns={checkIns} ranked today={today} />
    )}

    {goals.length < MAX_ACTIVE_GOALS ? (
      <GoalAddForm patientId={patientId} />
    ) : (
      <Typography size="sm" tone="muted">
        {`${MAX_ACTIVE_GOALS} objectifs actifs — archivez-en un pour en ajouter un autre.`}
      </Typography>
    )}

    <div className="border-border flex flex-col gap-3 border-t pt-6">
      <InstructionBlock
        patientId={patientId}
        pseudonym={pseudonym}
        instruction={instruction}
        superseded={supersededInstructions}
      />
    </div>

    {archivedGoals.length > 0 ? (
      <SectionFold
        id="archived-goals"
        label="Objectifs archivés"
        count={archivedGoals.length}
      >
        <GoalList
          goals={archivedGoals}
          checkIns={checkIns}
          ranked={false}
          today={today}
        />
      </SectionFold>
    ) : null}
  </>
);
