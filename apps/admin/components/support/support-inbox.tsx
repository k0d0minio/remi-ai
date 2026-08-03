"use client";

import { Inbox } from "lucide-react";
import { useState } from "react";
import { EmptyState } from "@remi/ui/server";
import { TicketList } from "@/components/support/ticket-list";
import { TicketThread } from "@/components/support/ticket-thread";
import type { SupportTicket } from "@/lib/fixtures";

type Props = {
  tickets: SupportTicket[];
};

/**
 * The two panes share one piece of state — which ticket is open — so the island
 * is drawn around both rather than around either. That state is the whole reason
 * this is a client component; everything inside it is presentational and would
 * render on the server if the selection lived in the URL instead.
 *
 * Selection is deliberately not a route: an operator triaging a queue moves
 * through it quickly, and a navigation per ticket costs a frame each time.
 */
export const SupportInbox = ({ tickets }: Props) => {
  const [selectedId, setSelectedId] = useState(tickets[0]?.id ?? "");
  const selected =
    tickets.find((ticket) => ticket.id === selectedId) ?? tickets[0];

  if (!selected) {
    return (
      <EmptyState
        icon={Inbox}
        intent="success"
        title="The inbox is empty"
        body="Every ticket has been answered. New ones land here as practitioners write in."
      />
    );
  }

  return (
    <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,24rem)_1fr]">
      <TicketList
        tickets={tickets}
        selectedId={selected.id}
        onSelect={setSelectedId}
      />
      <TicketThread ticket={selected} />
    </div>
  );
};
