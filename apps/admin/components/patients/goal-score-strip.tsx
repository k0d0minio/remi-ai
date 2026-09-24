import { formatDate } from "@remi/services/shared";
import { ScoreStrip } from "@remi/ui/server";

type Props = {
  title: string;
  /** The patient's scores on this goal, oldest first. */
  scores: readonly { id: string; checkedOn: string; score: number }[];
};

/**
 * The patient's weekly 0–5 on one goal, as the link's « Ma progression » shows
 * it (D-9: the same view on both sides). Renders nothing before a first score.
 */
export const GoalScoreStrip = ({ title, scores }: Props) =>
  scores.length > 0 ? (
    <ScoreStrip
      max={5}
      label={`${title} — les chiffres de la semaine, de 0 à 5`}
      items={scores.map((entry) => ({
        key: entry.id,
        value: entry.score,
        label: formatDate(entry.checkedOn),
      }))}
    />
  ) : null;
