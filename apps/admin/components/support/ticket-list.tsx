"use client";

import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Typography,
} from "@remi/ui/server";
import { cn } from "@remi/ui/utils";
import {
  ticketPriorityIntents,
  ticketPriorityLabels,
  ticketStatusIntents,
  ticketStatusLabels,
} from "@/components/support/status";
import type { SupportTicket } from "@/lib/fixtures";

type Props = {
  tickets: SupportTicket[];
  selectedId: string;
  onSelect: (id: string) => void;
};

/**
 * The left half of the inbox. Every row is a button rather than a link: the
 * thread opens beside the list, so an operator working a queue never loses the
 * queue — and `aria-current` says which one they are reading, since the tint
 * alone does not survive a screen reader.
 */
export const TicketList = ({ tickets, selectedId, onSelect }: Props) => {
  const open = tickets.filter((ticket) => ticket.status === "open").length;

  return (
    <Card elevation="flat" className="gap-4">
      <CardHeader>
        <CardTitle>Tickets</CardTitle>
        <CardDescription>
          {tickets.length} in the inbox — {open} still waiting on an answer.
        </CardDescription>
      </CardHeader>

      <CardContent className="px-0">
        <ul className="flex flex-col">
          {tickets.map((ticket, index) => {
            const selected = ticket.id === selectedId;

            return (
              <li
                key={ticket.id}
                className={cn(index > 0 && "border-border border-t")}
              >
                <button
                  type="button"
                  onClick={() => onSelect(ticket.id)}
                  aria-current={selected ? "true" : undefined}
                  className={cn(
                    "focus-visible:ring-ring/40 flex w-full flex-col gap-1.5 border-l-2 px-6 py-3 text-left transition-colors duration-[--duration-fast] focus-visible:outline-none focus-visible:ring-[3px]",
                    selected
                      ? "border-l-primary bg-primary-subtle"
                      : "hover:bg-accent border-l-transparent",
                  )}
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <Typography as="span" size="sm" weight="medium">
                      {ticket.subject}
                    </Typography>
                    <Typography
                      as="span"
                      size="xs"
                      tone="muted"
                      className="shrink-0 tabular-nums"
                    >
                      {ticket.age}
                    </Typography>
                  </div>

                  <Typography size="xs" tone="muted">
                    {ticket.requester.name} · {ticket.requester.practice}
                  </Typography>

                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <Badge
                      variant={ticketStatusIntents[ticket.status]}
                      tone="subtle"
                      size="sm"
                    >
                      {ticketStatusLabels[ticket.status]}
                    </Badge>
                    <Badge
                      variant={ticketPriorityIntents[ticket.priority]}
                      tone="subtle"
                      size="sm"
                    >
                      {ticketPriorityLabels[ticket.priority]}
                    </Badge>
                    <Typography
                      as="span"
                      size="xs"
                      tone="muted"
                      className="ml-auto tabular-nums"
                    >
                      {ticket.reference}
                    </Typography>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
};
