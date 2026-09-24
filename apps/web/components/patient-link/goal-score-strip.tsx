import { formatDate } from "@remi/services/shared";
import { ScoreStrip, Typography } from "@remi/ui/server";

type Props = {
  title: string;
  /** The patient's scores on this goal, oldest first. */
  scores: readonly { id: string; checkedOn: string; score: number }[];
  locale: string;
  /** Follows the goal's title as the strip's accessible name. */
  stripLabel: string;
  emptyLabel: string;
};

/** One goal on « Ma progression »: its title, then its weekly scores. */
export const GoalScoreStrip = ({
  title,
  scores,
  locale,
  stripLabel,
  emptyLabel,
}: Props) => (
  <div className="flex flex-col gap-2">
    <Typography as="h3" size="sm" weight="semibold">
      {title}
    </Typography>
    {scores.length > 0 ? (
      <ScoreStrip
        max={5}
        label={`${title} — ${stripLabel}`}
        items={scores.map((entry) => ({
          key: entry.id,
          value: entry.score,
          label: formatDate(entry.checkedOn, locale),
        }))}
      />
    ) : (
      <Typography size="sm" tone="muted">
        {emptyLabel}
      </Typography>
    )}
  </div>
);
