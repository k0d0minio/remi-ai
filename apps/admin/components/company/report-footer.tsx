import { Separator, Typography } from "@remi/ui/server";
import { author, preparedOn } from "@/lib/dossier/shared";

type Props = {
  /** Where the page's claims come from — named on every page, not just once. */
  note: string;
};

/**
 * The bottom of every dossier page: who wrote it, when, and what it was read
 * out of. A review document whose sources are one page away is a document that
 * gets quoted without them.
 */
export const ReportFooter = ({ note }: Props) => (
  <div className="flex flex-col gap-2">
    <Separator tone="subtle" />
    <Typography size="xs" tone="muted" className="max-w-2xl">
      {note}
    </Typography>
    <Typography size="xs" tone="muted">
      {author} · {preparedOn}
    </Typography>
  </div>
);
