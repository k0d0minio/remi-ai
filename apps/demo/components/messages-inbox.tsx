"use client";

import { ArrowRight } from "lucide-react";
import NextLink from "next/link";
import { useState } from "react";
import { Avatar, AvatarFallback } from "@remi/ui";
import { Badge, Link, Separator, Typography } from "@remi/ui/server";
import { cn } from "@remi/ui/utils";
import { MessageComposer } from "@/components/message-composer";
import { MessageThread } from "@/components/message-thread";
import { assistSuggestions, conversations } from "@/lib/mock/messages";
import type { Message } from "@/lib/mock/types";

const firstConversation = conversations[0];

/**
 * The practitioner's side: the list of threads and the open one, together.
 *
 * Two panes rather than a list page and a thread page, because the question this
 * screen has to answer — "who is waiting on me?" — is a comparison, and a
 * comparison you have to navigate away from is not one.
 *
 * Opening a thread clears its unread count and nothing else: no read receipt
 * travels back to the person, which is the behaviour a clinical exchange wants
 * and a chat app does not.
 */
export const MessagesInbox = () => {
  const [openId, setOpenId] = useState(firstConversation.id);
  const [readIds, setReadIds] = useState<string[]>([firstConversation.id]);
  const [replies, setReplies] = useState<Record<string, Message[]>>({});

  const open =
    conversations.find((conversation) => conversation.id === openId) ??
    firstConversation;

  const openThread = (id: string) => {
    setOpenId(id);
    setReadIds((current) =>
      current.includes(id) ? current : [...current, id],
    );
  };

  const reply = (body: string) => {
    setReplies((current) => {
      const existing = current[open.id] ?? [];

      return {
        ...current,
        [open.id]: [
          ...existing,
          {
            id: `${open.id}_reply_${existing.length + 1}`,
            author: "practitioner",
            day: "Aujourd'hui",
            time: "à l'instant",
            body,
          },
        ],
      };
    });
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[20rem_1fr]">
      <section
        aria-label="Conversations"
        className="border-border bg-card flex h-fit flex-col overflow-hidden rounded-lg border"
      >
        <ul>
          {conversations.map((conversation, index) => {
            const active = conversation.id === open.id;
            const unread = readIds.includes(conversation.id)
              ? 0
              : conversation.unread;
            const thread = [
              ...conversation.messages,
              ...(replies[conversation.id] ?? []),
            ];
            const snippet = thread.at(-1);

            return (
              <li key={conversation.id}>
                {index > 0 ? <Separator tone="subtle" /> : null}
                <button
                  type="button"
                  onClick={() => openThread(conversation.id)}
                  aria-current={active ? "true" : undefined}
                  className={cn(
                    "focus-visible:ring-ring/40 flex w-full items-start gap-3 p-3 text-left transition-colors duration-[--duration-fast] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-inset",
                    active ? "bg-primary-subtle" : "hover:bg-accent",
                  )}
                >
                  <Avatar size="sm">
                    <AvatarFallback>{conversation.initials}</AvatarFallback>
                  </Avatar>

                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <div className="flex items-baseline justify-between gap-2">
                      <Typography
                        as="span"
                        size="sm"
                        weight={unread ? "semibold" : "medium"}
                        className="truncate"
                      >
                        {conversation.clientName}
                      </Typography>
                      <Typography
                        as="span"
                        size="xs"
                        tone="muted"
                        className="shrink-0 whitespace-nowrap"
                      >
                        {conversation.lastAt}
                      </Typography>
                    </div>

                    <Typography
                      as="span"
                      size="xs"
                      tone="muted"
                      className="truncate"
                    >
                      {conversation.subject}
                    </Typography>

                    <div className="flex items-center justify-between gap-2">
                      <Typography
                        as="span"
                        size="xs"
                        tone="muted"
                        className="truncate"
                      >
                        {snippet?.author === "practitioner" ? "Vous : " : ""}
                        {snippet?.body}
                      </Typography>
                      {unread ? (
                        <Badge variant="info" size="sm" className="shrink-0">
                          {unread}
                        </Badge>
                      ) : null}
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section
        aria-label={`Échange avec ${open.clientName}`}
        className="flex flex-col gap-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <Typography as="h2" size="lg" weight="semibold">
              {open.clientName}
            </Typography>
            <Typography size="sm" tone="muted">
              {open.subject}
            </Typography>
          </div>

          <Link
            as={NextLink}
            href={`/practitioner/clients/${open.clientId}`}
            variant="primary"
            className="flex items-center gap-1 whitespace-nowrap text-sm"
          >
            Ouvrir la fiche
            <ArrowRight aria-hidden="true" className="size-3.5" />
          </Link>
        </div>

        <MessageThread
          messages={[...open.messages, ...(replies[open.id] ?? [])]}
          viewer="practitioner"
          counterpartLabel={open.firstName}
        />

        <MessageComposer
          chips={assistSuggestions[open.id] ?? []}
          variant="assist"
          placeholder={`Votre réponse à ${open.firstName}…`}
          onSend={reply}
        />
      </section>
    </div>
  );
};
