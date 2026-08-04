import type { Intent, TicketPriority, TicketStatus } from "@/lib/fixtures";

/**
 * One mapping, read by the list and by the thread beside it. A ticket that reads
 * as urgent in the list and normal once opened is how an operator answers the
 * wrong one first.
 *
 * `open` is warning rather than info for the same reason `applied` is on the
 * pilot table: a ticket nobody has answered is the state that costs something,
 * and it should not read as calmly as one already waiting on the requester.
 */
export const ticketStatusLabels: Record<TicketStatus, string> = {
  open: "open",
  pending: "pending",
  resolved: "resolved",
};

export const ticketStatusIntents: Record<TicketStatus, Intent> = {
  open: "warning",
  pending: "info",
  resolved: "success",
};

export const ticketPriorityLabels: Record<TicketPriority, string> = {
  urgent: "urgent",
  high: "high",
  normal: "normal",
  low: "low",
};

export const ticketPriorityIntents: Record<TicketPriority, Intent> = {
  urgent: "error",
  high: "warning",
  normal: "info",
  low: "neutral",
};
