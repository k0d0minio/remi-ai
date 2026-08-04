import { Check, MessageCircleQuestion } from "lucide-react";
import { Typography } from "@remi/ui/server";
import { cn } from "@remi/ui/utils";
import type { Recognition } from "@/lib/mock/types";

const verdicts = {
  matches: {
    icon: Check,
    className: "text-success-text",
    label: "Correspond",
  },
  discuss: {
    icon: MessageCircleQuestion,
    className: "text-warning-text",
    label: "À voir ensemble",
  },
} as const;

type Props = {
  recognitions: Recognition[];
};

/**
 * How a plate maps onto the practitioner's recommendations — the only reason
 * this feature exists. Two verdicts and no third: something matches, or it is a
 * question for the next consultation. There is deliberately no "écart", no
 * score and no red: REMI does not grade a meal, it prepares what the
 * practitioner may want to look at.
 */
export const JournalRecognitions = ({ recognitions }: Props) => (
  <ul className="flex flex-col gap-2">
    {recognitions.map((recognition) => {
      const verdict = verdicts[recognition.verdict];
      const Icon = verdict.icon;

      return (
        <li key={recognition.recommendation} className="flex items-start gap-2">
          <Icon
            aria-hidden="true"
            className={cn("mt-0.5 size-4 shrink-0", verdict.className)}
          />
          <div className="flex flex-col gap-0.5">
            <Typography as="span" size="sm" weight="medium">
              {recognition.recommendation}
            </Typography>
            <Typography as="span" size="sm" tone="muted">
              <span className="sr-only">{verdict.label} : </span>
              {recognition.detail}
            </Typography>
          </div>
        </li>
      );
    })}
  </ul>
);
