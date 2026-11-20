import type { ComponentProps } from "react";
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

/**
 * « Objectifs et consigne »: the goals in her order, then the instruction.
 *
 * A goal is one free text and their number has no limit (story 16). The first
 * goal of the list is the main goal (D-30), and the line above the list says
 * so. The disabled goals stay in the data, in the closed fold at the foot.
 */
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
      <>
        <Typography size="sm" tone="muted">
          Le premier objectif de la liste est l&apos;objectif principal.
        </Typography>
        <GoalList goals={goals} checkIns={checkIns} ranked today={today} />
      </>
    )}

    <GoalAddForm patientId={patientId} />

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
        id="disabled-goals"
        label="Objectifs désactivés"
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
