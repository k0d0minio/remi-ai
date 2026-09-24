import type { PatientMessageEntry } from "@remi/services/shared";
import { formatDate } from "@remi/services/shared";
import { Typography } from "@remi/ui/server";
import { MessageForm } from "@/components/patient-link/message-form";
import type { Content } from "@/lib/content/types";

type Props = {
  messages: readonly PatientMessageEntry[];
  token: string;
  locale: string;
  /** The form's field id — distinct per placement. */
  id: string;
  content: Content["patientLink"];
};

/**
 * Her § 6 question, when the patient last answered it, and the box — the same
 * block on the home and on Messages, so the prompt (D-30) has one rendering.
 *
 * The last-sent line is the weekly framing without a scheduler: the prompt is
 * the same every visit, and the date says how long it has been.
 */
export const MessageComposer = ({
  messages,
  token,
  locale,
  id,
  content,
}: Props) => {
  const lastSent = messages.find((message) => message.author === "patient");

  return (
    <div className="flex flex-col gap-3">
      <Typography size="sm" weight="medium">
        {content.messages.prompt}
      </Typography>
      {lastSent ? (
        <Typography size="xs" tone="muted">
          {content.messages.lastSent} {formatDate(lastSent.sentAt, locale)}
        </Typography>
      ) : null}
      <MessageForm token={token} locale={locale} id={id} content={content} />
    </div>
  );
};
