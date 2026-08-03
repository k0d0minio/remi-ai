import type { Metadata } from "next";
import { Typography } from "@remi/ui/server";
import { SupportInbox } from "@/components/support/support-inbox";
import { supportTickets } from "@/lib/fixtures";

export const metadata: Metadata = {
  title: "Support",
};

/** Derived, so the sentence under the heading cannot drift from the list. */
const openTickets = supportTickets.filter(
  (ticket) => ticket.status === "open",
).length;

const Support = () => (
  <div className="flex flex-col gap-6">
    <div className="flex flex-col gap-1">
      <Typography as="h1" size="2xl" weight="semibold">
        Support
      </Typography>
      <Typography size="sm" tone="muted">
        Everything practitioners have written in about — {openTickets} of{" "}
        {supportTickets.length} still waiting on an answer, unanswered first.
      </Typography>
    </div>

    <SupportInbox tickets={supportTickets} />
  </div>
);

export default Support;
