import type { PatientMessageEntry } from "@remi/services/shared";
import { formatDate } from "@remi/services/shared";
import { Card, CardContent, Typography } from "@remi/ui/server";
import type { Content } from "@/lib/content/types";

type Props = {
  messages: readonly PatientMessageEntry[];
  locale: string;
  content: Content["patientLink"];
};

/**
 * The thread, newest first: who wrote each message and when. Her replies are
 * signed with the operator's name and set off like the meal journal's
 * response, so the two voices read apart at a glance.
 */
export const MessageThread = ({ messages, locale, content }: Props) => (
  <ul className="flex flex-col gap-3">
    {messages.map((message) => {
      const fromPatient = message.author === "patient";
      const author = fromPatient
        ? content.messages.you
        : (message.operatorName ?? content.messages.practitioner);

      return (
        <li key={message.id}>
          <Card>
            <CardContent
              className={
                fromPatient
                  ? "flex flex-col gap-1"
                  : "flex flex-col gap-1 border-l-2 pl-3"
              }
            >
              <Typography size="xs" tone="muted">
                <Typography as="span" size="xs" weight="medium">
                  {author}
                </Typography>{" "}
                · {formatDate(message.sentAt, locale)}
              </Typography>
              <Typography size="sm" className="whitespace-pre-line">
                {message.body}
              </Typography>
            </CardContent>
          </Card>
        </li>
      );
    })}
  </ul>
);
