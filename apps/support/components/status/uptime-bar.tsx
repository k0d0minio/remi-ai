import { cn } from "@remi/ui/utils";
import type { DayState } from "@/lib/status";

type Props = {
  days: DayState[];
  /** The whole bar's accessible name — ninety spans announced one by one is noise. */
  label: string;
};

const tone: Record<DayState, string> = {
  up: "bg-success",
  degraded: "bg-warning",
  down: "bg-error",
};

/**
 * One column per day, oldest on the left. It is an image of a history rather
 * than a control: assistive technology gets the summary in `label`, and the
 * columns themselves are hidden from it.
 *
 * The columns shrink rather than scroll. Ninety days on a phone is a texture —
 * you read the red, not the individual day — and a bar that scrolls sideways
 * inside a page hides exactly the outage it exists to show.
 */
export const UptimeBar = ({ days, label }: Props) => (
  <div
    role="img"
    aria-label={label}
    className="flex h-8 w-full items-stretch gap-px"
  >
    {days.map((day, index) => (
      <span
        // Position in the window is the identity here: two days can share a
        // state, and nothing about a day but its place is meaningful.
        key={index}
        aria-hidden="true"
        className={cn("min-w-[2px] flex-1 rounded-[1px]", tone[day])}
      />
    ))}
  </div>
);
