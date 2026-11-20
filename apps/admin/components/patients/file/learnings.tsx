import type { ComponentProps } from "react";
import { Typography } from "@remi/ui/server";
import {
  ArchivedObservations,
  LearningsList,
} from "@/components/patients/learnings-list";
import { ObservationAddForm } from "@/components/patients/observation-add-form";
import { SectionFold } from "@/components/patients/section-fold";

type Props = {
  patientId: string;
  learnings: ComponentProps<typeof LearningsList>["learnings"];
  archivedObservations: ComponentProps<
    typeof ArchivedObservations
  >["observations"];
  today: string;
};

/** « À retenir »: the learnings, the add form, then the archived observations. */
export const LearningsSection = ({
  patientId,
  learnings,
  archivedObservations,
  today,
}: Props) => (
  <>
    {learnings.length === 0 ? (
      <Typography size="sm" tone="muted">
        Rien à retenir pour le moment.
      </Typography>
    ) : (
      <LearningsList learnings={learnings} />
    )}

    <ObservationAddForm patientId={patientId} today={today} />

    {archivedObservations.length > 0 ? (
      <SectionFold
        id="archived-observations"
        label="Observations archivées"
        count={archivedObservations.length}
      >
        <ArchivedObservations observations={archivedObservations} />
      </SectionFold>
    ) : null}
  </>
);
