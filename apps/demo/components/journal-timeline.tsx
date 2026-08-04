import { Typography } from "@remi/ui/server";
import {
  JournalEntryCard,
  type JournalViewer,
} from "@/components/journal-entry-card";
import type { JournalEntry } from "@/lib/mock/types";

type Props = {
  entries: JournalEntry[];
  viewer: JournalViewer;
  /** Ids logged during this session — flagged so a new entry is visibly new. */
  freshIds?: string[];
  /** The day separator's level, so the timeline nests under whatever precedes it. */
  dayHeading?: "h2" | "h3";
};

/**
 * The day timeline. Grouped by the `day` label the fixture already carries
 * rather than by a parsed date: a prototype that ships a date library to render
 * "Hier" has spent its budget in the wrong place.
 */
export const JournalTimeline = ({
  entries,
  viewer,
  freshIds = [],
  dayHeading = "h2",
}: Props) => {
  const days = entries.reduce<string[]>((accumulator, entry) => {
    if (!accumulator.includes(entry.day)) {
      accumulator.push(entry.day);
    }

    return accumulator;
  }, []);

  return (
    <div className="flex flex-col gap-8">
      {days.map((day) => (
        <section key={day} className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Typography as={dayHeading} size="sm" weight="medium">
              {day}
            </Typography>
            <div className="bg-border h-px flex-1" />
          </div>

          <div className="flex flex-col gap-3">
            {entries
              .filter((entry) => entry.day === day)
              .map((entry) => (
                <JournalEntryCard
                  key={entry.id}
                  entry={entry}
                  viewer={viewer}
                  fresh={freshIds.includes(entry.id)}
                />
              ))}
          </div>
        </section>
      ))}
    </div>
  );
};
