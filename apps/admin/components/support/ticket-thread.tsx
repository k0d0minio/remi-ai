import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Typography,
} from "@remi/ui/server";
import { cn } from "@remi/ui/utils";
import { ReplyComposer } from "@/components/support/reply-composer";
import {
  ticketPriorityIntents,
  ticketPriorityLabels,
  ticketStatusIntents,
  ticketStatusLabels,
} from "@/components/support/status";
import type { SupportTicket } from "@/lib/fixtures";

type Props = {
  ticket: SupportTicket;
};

/**
 * The whole conversation, oldest first, with the requester's side flush and the
 * operator's side indented — the two are told apart by position before anything
 * is read, which is what makes a thread scannable at a glance.
 */
export const TicketThread = ({ ticket }: Props) => (
  <Card elevation="flat">
    <CardHeader className="flex flex-col gap-3">
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
        <div className="flex flex-col gap-1">
          <CardTitle>{ticket.subject}</CardTitle>
          <Typography size="sm" tone="muted">
            {ticket.requester.name} · {ticket.requester.practice} ·{" "}
            {ticket.requester.email}
          </Typography>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
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
        </div>
      </div>

      <Typography size="xs" tone="muted" className="tabular-nums">
        {ticket.reference} · raised {ticket.age} · last reply {ticket.lastReply}
      </Typography>
    </CardHeader>

    <CardContent className="flex flex-col gap-4">
      <ul className="flex flex-col gap-3">
        {ticket.thread.map((message) => (
          <li
            key={message.id}
            className={cn(
              "flex flex-col gap-1.5 rounded-lg border p-3",
              message.side === "operator"
                ? "border-primary-border bg-primary-subtle ml-6"
                : "border-border bg-muted mr-6",
            )}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
              <Typography as="span" size="sm" weight="medium">
                {message.author}
                {message.side === "operator" ? " · operator" : ""}
              </Typography>
              <Typography
                as="span"
                size="xs"
                tone="muted"
                className="tabular-nums"
              >
                {message.sentAt}
              </Typography>
            </div>

            <Typography size="sm">{message.body}</Typography>
          </li>
        ))}
      </ul>

      <ReplyComposer requesterName={ticket.requester.name} />
    </CardContent>
  </Card>
);
