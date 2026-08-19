import { Separator, Typography } from "@remi/ui/server";
import {
  author,
  preparedFor,
  preparedOn,
  type PageHeader,
} from "@/lib/dossier/shared";

type Props = {
  header: PageHeader;
};

/**
 * One masthead for the whole dossier. The seven pages are a single document
 * split across a sidebar, and a shared header is what makes that legible
 * without repeating the framing paragraph on each of them.
 */
export const ReportHeader = ({ header }: Props) => (
  <div className="flex flex-col gap-3">
    <Typography variant="eyebrow" tone="muted">
      {header.eyebrow}
    </Typography>

    <Typography as="h1" size="2xl" weight="semibold">
      {header.title}
    </Typography>

    <Typography size="sm" tone="muted" className="max-w-2xl">
      {header.lead}
    </Typography>

    <Separator tone="subtle" />

    <div className="flex flex-wrap gap-x-8 gap-y-1">
      <Typography size="xs" tone="muted">
        {preparedFor}
      </Typography>
      <Typography size="xs" tone="muted">
        {author} · {preparedOn}
      </Typography>
    </div>
  </div>
);
