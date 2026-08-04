"use client";

import { useState } from "react";
import { MessageComposer } from "@/components/message-composer";
import { MessageThread } from "@/components/message-thread";
import {
  conversations,
  personConversationId,
  quickReplies,
} from "@/lib/mock/messages";
import type { Message } from "@/lib/mock/types";

type Props = {
  /** How the practitioner signs in the thread — from `clients.ts`, not retyped. */
  practitionerLabel: string;
};

const conversation =
  conversations.find((candidate) => candidate.id === personConversationId) ??
  conversations[0];

/**
 * Camille's side of the exact thread the practitioner reads on
 * `/practitioner/messages` — same fixture, `viewer` flipped.
 *
 * The one thing this side does not get is a suggestion engine. REMI proposing
 * words to the person would put a machine on both ends of a clinical exchange;
 * the chips here are her own recurring phrases, which is a shortcut rather than
 * a voice.
 */
export const PersonMessages = ({ practitionerLabel }: Props) => {
  const [sent, setSent] = useState<Message[]>([]);

  const send = (body: string) => {
    setSent((current) => [
      ...current,
      {
        id: `${conversation.id}_sent_${current.length + 1}`,
        author: "person",
        day: "Aujourd'hui",
        time: "à l'instant",
        body,
      },
    ]);
  };

  return (
    <div className="flex flex-col gap-4">
      <MessageThread
        messages={[...conversation.messages, ...sent]}
        viewer="person"
        counterpartLabel={practitionerLabel}
      />

      <MessageComposer
        chips={quickReplies}
        variant="quick"
        placeholder={`Votre message à ${practitionerLabel}…`}
        onSend={send}
      />
    </div>
  );
};
