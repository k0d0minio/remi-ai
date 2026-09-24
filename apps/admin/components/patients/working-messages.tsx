import { Badge, Typography } from "@remi/ui/server";
import { formatDate, type PatientMessageEntry } from "@remi/services/shared";
import { messagesAwaitingLabel } from "@/components/patients/vocabulary";

type Props = {
  /** Newest first — already loaded for the Messages section. */
  messages: readonly PatientMessageEntry[];
  unread: number;
};

/** The glance holds the three most recent messages, newest first. */
const MAX_VISIBLE = 3;

/**
 * The working view's line on the general thread: the unread count, worded
 * like the meals', and the latest few messages read-only. Replying and
 * « Marquer comme lu » stay in the Messages section.
 */
export const WorkingMessages = ({ messages, unread }: Props) => {
  if (messages.length === 0) {
    return (
      <Typography size="sm" tone="muted">
        Aucun message pour le moment.
      </Typography>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {unread > 0 ? (
        <Typography size="sm" tone="muted">
          {`${messagesAwaitingLabel(unread)}.`}
        </Typography>
      ) : null}

      <ol className="flex flex-col gap-2">
        {messages.slice(0, MAX_VISIBLE).map((message) => (
          <li
            key={message.id}
            className="border-border flex flex-col gap-1 border-b pb-2 last:border-b-0"
          >
            <div className="flex items-center gap-2">
              <Typography size="sm" tone="muted">
                {formatDate(message.sentAt)}
              </Typography>
              {message.author === "practitioner" ? (
                <Badge variant="neutral" tone="subtle" size="sm">
                  réponse
                </Badge>
              ) : message.readAt === null ? (
                <Badge variant="warning" tone="subtle" size="sm">
                  non lu
                </Badge>
              ) : null}
            </div>
            <Typography size="sm" className="line-clamp-2">
              {message.body}
            </Typography>
          </li>
        ))}
      </ol>
    </div>
  );
};
