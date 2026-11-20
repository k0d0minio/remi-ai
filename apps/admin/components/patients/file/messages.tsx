import type { ComponentProps } from "react";
import { Typography } from "@remi/ui/server";
import { MessageThread } from "@/components/patients/message-thread";
import { messagesAwaitingLabel } from "@/components/patients/vocabulary";

type Props = {
  patientId: string;
  pseudonym: string;
  messages: ComponentProps<typeof MessageThread>["messages"];
  /** The patient's messages that no one has read yet. */
  unread: number;
};

/** « Messages »: what waits for an answer, then the thread. */
export const MessagesSection = ({
  patientId,
  pseudonym,
  messages,
  unread,
}: Props) => (
  <>
    {unread > 0 ? (
      <Typography size="sm" tone="muted">
        {`${messagesAwaitingLabel(unread)}.`}
      </Typography>
    ) : null}
    <MessageThread
      patientId={patientId}
      pseudonym={pseudonym}
      messages={messages}
    />
  </>
);
