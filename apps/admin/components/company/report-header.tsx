import { Separator, Typography } from "@remi/ui/server";
import {
  author,
  preparedFor,
  preparedOn,
  type PageHeader,
} from "@/lib/dossier/shared";

type Props = {
  header: PageHeader;
  /**
   * Renders the audience and authorship line. Set on the Synthèse alone: the
   * dossier is one document, and a masthead repeated on every page of it is
   * four lines the reader has to skip four times to reach the content.
   */
  masthead?: true;
};

export const ReportHeader = ({ header, masthead }: Props) => (
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

    {masthead ? (
      <>
        <Separator tone="subtle" />
        <div className="flex flex-wrap gap-x-8 gap-y-1">
          <Typography size="xs" tone="muted">
            {preparedFor}
          </Typography>
          <Typography size="xs" tone="muted">
            {author} · {preparedOn}
          </Typography>
        </div>
      </>
    ) : null}
  </div>
);
