import { Quote } from "lucide-react";
import { Card, CardContent, Separator, Typography } from "@remi/ui/server";
import { JournalConfidenceBadge } from "@/components/journal-confidence-badge";
import { JournalPhotoTile } from "@/components/journal-photo-tile";
import { JournalRecognitions } from "@/components/journal-recognitions";
import { slotLabels } from "@/lib/mock/journal";
import type { JournalEntry } from "@/lib/mock/types";

export type JournalViewer = "person" | "practitioner";

const copy = {
  person: {
    note: "Votre note",
    plan: "Face à votre plan",
    uncertain: "Vous pourrez corriger ce que REMI a lu avant la consultation.",
  },
  practitioner: {
    note: "Sa note",
    plan: "Face au plan que vous avez fixé",
    uncertain:
      "Reconnaissance incertaine : à lire comme une indication, pas comme un relevé.",
  },
} as const;

type Props = {
  entry: JournalEntry;
  viewer: JournalViewer;
  /** Set on an entry logged during the session, so the demo shows it landing. */
  fresh?: boolean;
};

/**
 * One logged meal. The order of the card is the argument: the photo first,
 * then what REMI read and how sure it is, and only then what that means against
 * the plan. A confidence badge under the recommendation instead of beside the
 * recognition would let a 61 % reading pass for a fact.
 */
export const JournalEntryCard = ({ entry, viewer, fresh }: Props) => (
  <Card
    elevation="flat"
    variant={fresh ? "success" : "neutral"}
    className="gap-4"
  >
    <CardContent className="flex gap-4">
      <JournalPhotoTile tone={entry.photoTone} />

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex flex-col gap-0.5">
            <Typography as="span" size="sm" tone="muted">
              {slotLabels[entry.slot]} · {entry.time}
            </Typography>
            <Typography as="span" weight="medium">
              {entry.identified}
            </Typography>
          </div>
          <JournalConfidenceBadge confidence={entry.confidence} />
        </div>

        <Typography size="sm" tone="muted">
          {entry.items.join(" · ")}
        </Typography>

        {entry.confidence < 75 ? (
          <Typography size="xs" tone="muted">
            {copy[viewer].uncertain}
          </Typography>
        ) : null}

        <Separator tone="subtle" />

        <div className="flex flex-col gap-2">
          <Typography variant="eyebrow" tone="muted">
            {copy[viewer].plan}
          </Typography>
          <JournalRecognitions recognitions={entry.recognitions} />
        </div>

        {entry.note ? (
          <div className="bg-muted flex items-start gap-2 rounded-lg p-3">
            <Quote
              aria-hidden="true"
              className="text-muted-foreground mt-0.5 size-3.5 shrink-0"
            />
            <div className="flex flex-col gap-0.5">
              <Typography as="span" size="xs" tone="muted">
                {copy[viewer].note}
              </Typography>
              <Typography as="span" size="sm">
                {entry.note}
              </Typography>
            </div>
          </div>
        ) : null}
      </div>
    </CardContent>
  </Card>
);
