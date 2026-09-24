"use client";

import { useState } from "react";
import {
  formatDateTime,
  type PatientMessageEntry,
} from "@remi/services/shared";
import { Badge, Field, Textarea, Typography } from "@remi/ui/server";
import { Button } from "@remi/ui";
import {
  markMessageReadAction,
  replyToPatientAction,
} from "@/lib/patients/actions";

type Props = {
  patientId: string;
  /** Carried to the trail as the target's label. */
  pseudonym: string;
  /** Newest first, as the service returns them. */
  messages: readonly PatientMessageEntry[];
};

/**
 * The patient's general thread (§ 6, § 7 « voir les feedbacks »): the reply box
 * first, then every message newest first, unread ones marked.
 *
 * Nothing clears on its own (D-32): a reply marks every earlier message read,
 * and « Marquer comme lu » is there for the one that needs no answer.
 */
export const MessageThread = ({ patientId, pseudonym, messages }: Props) => {
  // Controlled so a refused reply keeps what she typed; cleared on success.
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-6">
      <form
        action={async (formData: FormData) => {
          const result = await replyToPatientAction(
            { error: null, saved: false },
            formData,
          );
          setError(result.error);
          if (!result.error) {
            setBody("");
          }
        }}
        className="flex flex-col gap-3"
      >
        <input type="hidden" name="patientId" value={patientId} />
        <input type="hidden" name="pseudonym" value={pseudonym} />
        <Field
          id={`message-reply-${patientId}`}
          label="Votre réponse"
          error={error ?? undefined}
        >
          <Textarea
            id={`message-reply-${patientId}`}
            name="body"
            required
            rows={3}
            maxLength={2000}
            value={body}
            onChange={(event) => setBody(event.target.value)}
          />
        </Field>
        <div>
          <Button type="submit" variant="primary">
            Répondre
          </Button>
        </div>
      </form>

      {messages.length === 0 ? (
        <Typography size="sm" tone="muted">
          Aucun message pour le moment.
        </Typography>
      ) : (
        <ol className="flex flex-col gap-3">
          {messages.map((message) => (
            <MessageItem
              key={message.id}
              message={message}
              pseudonym={pseudonym}
            />
          ))}
        </ol>
      )}
    </div>
  );
};

const MessageItem = ({
  message,
  pseudonym,
}: {
  message: PatientMessageEntry;
  pseudonym: string;
}) => {
  const [error, setError] = useState<string | null>(null);
  const fromPatient = message.author === "patient";
  const unread = fromPatient && message.readAt === null;

  return (
    <li
      className={
        fromPatient
          ? "border-border flex flex-col gap-2 rounded-lg border p-4"
          : "border-border flex flex-col gap-2 rounded-lg border border-l-4 p-4"
      }
    >
      <div className="flex flex-wrap items-center gap-2">
        <Typography as="h4" size="sm" weight="medium">
          {fromPatient ? pseudonym : (message.operatorName ?? "Réponse")}
        </Typography>
        <Typography size="sm" tone="muted">
          {formatDateTime(message.sentAt)}
        </Typography>
        {fromPatient ? (
          <Badge variant="info" tone="subtle" size="sm">
            écrit depuis le lien
          </Badge>
        ) : null}
        {unread ? (
          <Badge variant="warning" tone="subtle" size="sm">
            non lu
          </Badge>
        ) : null}
      </div>
      <Typography size="sm" className="whitespace-pre-line">
        {message.body}
      </Typography>
      {unread ? (
        <form
          action={async (formData: FormData) => {
            const result = await markMessageReadAction(
              { error: null, saved: false },
              formData,
            );
            setError(result.error);
          }}
          className="flex flex-col gap-1"
        >
          <input type="hidden" name="id" value={message.id} />
          <input type="hidden" name="pseudonym" value={pseudonym} />
          <div>
            <Button type="submit" variant="outline" size="sm">
              Marquer comme lu
            </Button>
          </div>
          {error ? (
            <Typography size="sm" className="text-error-text" role="alert">
              {error}
            </Typography>
          ) : null}
        </form>
      ) : null}
    </li>
  );
};
