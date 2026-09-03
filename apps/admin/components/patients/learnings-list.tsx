import {
  formatDate,
  type PatientLearning,
  type PatientObservation,
} from "@remi/services/shared";
import { Badge, Typography } from "@remi/ui/server";
import { ObservationItem } from "@/components/patients/observation-item";
import { mealSlotLabels } from "@/components/patients/vocabulary";

type Props = {
  /** Already merged and ordered by the service — newest first, both sources. */
  learnings: readonly PatientLearning[];
};

/**
 * Archived observations, so archiving one stays reversible.
 *
 * Without this the « Réactiver » control on an observation is unreachable the
 * moment it is used, which makes archive a disguised delete — the opposite of
 * what archiving means everywhere else in the console.
 */
export const ArchivedObservations = ({
  observations,
}: {
  observations: readonly PatientObservation[];
}) => (
  <ul className="flex flex-col gap-3">
    {observations.map((observation) => (
      <li
        key={observation.id}
        className="border-border flex flex-col gap-2 rounded-lg border p-4"
      >
        <div className="flex flex-wrap items-center gap-2">
          <Typography as="h4" size="sm" weight="medium">
            {formatDate(observation.observedOn)}
          </Typography>
          <Badge variant="neutral" tone="subtle" size="sm">
            archivée
          </Badge>
        </div>
        <Typography size="sm">{observation.body}</Typography>
        <ObservationItem observation={observation} />
      </li>
    ))}
  </ul>
);

/**
 * The per-patient learnings, from both write paths, in one list.
 *
 * This is what makes the « mémorisation utile » worth typing: § 5 step 4's
 * point is that the week teaches something, and a note that only ever lives on
 * the meal it came from is one nobody re-reads. Goal check-ins are the other
 * half of PROGRESS and live in the patient record — consolidating the two into
 * a single feed is a later question, not this list's.
 *
 * Each line says where it came from, because that is the only real difference
 * between the two kinds: a learning noticed on a meal shows the meal.
 */
export const LearningsList = ({ learnings }: Props) => (
  <ul className="flex flex-col gap-3">
    {learnings.map((learning) => (
      <li
        key={`${learning.kind}-${learning.id}`}
        className="border-border flex flex-col gap-2 rounded-lg border p-4"
      >
        <div className="flex flex-wrap items-center gap-2">
          <Typography as="h4" size="sm" weight="medium">
            {formatDate(learning.on)}
          </Typography>
          <Badge variant="neutral" tone="subtle" size="sm">
            {learning.kind === "meal" ? "sur un repas" : "observation"}
          </Badge>
        </div>

        <Typography size="sm">{learning.body}</Typography>

        {learning.kind === "meal" ? (
          <Typography size="sm" tone="muted">
            {learning.entry.slot
              ? `${mealSlotLabels[learning.entry.slot]} · `
              : ""}
            {learning.entry.description}
          </Typography>
        ) : (
          <ObservationItem observation={learning.observation} />
        )}
      </li>
    ))}
  </ul>
);
