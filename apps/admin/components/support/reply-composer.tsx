import { CircleCheck, Send } from "lucide-react";
import { Button } from "@remi/ui";
import { Textarea, Typography } from "@remi/ui/server";

type Props = {
  /** Named in the placeholder, so the composer says who it is about to answer. */
  requesterName: string;
};

/**
 * Drawn but not wired, like the access actions on a practitioner: admin has no
 * backend, so nothing typed here can leave the browser and the line underneath
 * says so outright. It is here now because it decides the height of the thread
 * above it — an operator reads a conversation differently when the reply box is
 * already on screen — and retrofitting that is a redesign rather than a wiring
 * job.
 */
export const ReplyComposer = ({ requesterName }: Props) => (
  <div className="border-border flex flex-col gap-3 border-t pt-4">
    <Textarea
      aria-label={`Reply to ${requesterName}`}
      placeholder={`Reply to ${requesterName}…`}
      rows={3}
    />

    <div className="flex flex-wrap items-center gap-3">
      <Button type="button" size="sm" disabled>
        <Send aria-hidden="true" />
        Send reply
      </Button>

      <Button type="button" variant="outline" size="sm" disabled>
        <CircleCheck aria-hidden="true" />
        Resolve ticket
      </Button>

      <Typography size="xs" tone="muted" className="basis-full">
        The composer is not wired yet — nothing typed here is sent or saved.
      </Typography>
    </div>
  </div>
);
