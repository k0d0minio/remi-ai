import { FileText, Link2 } from "lucide-react";
import type { Locale, PatientDocument } from "@remi/services/shared";
import { formatDate, localePath } from "@remi/services/shared";
import { Card, CardContent, Typography } from "@remi/ui/server";
import type { Content } from "@/lib/content/types";

type Props = {
  documents: readonly PatientDocument[];
  locale: Locale;
  token: string;
  content: Content["patientLink"];
  /**
   * A plain list of links with no cards and no dates — for the documents a
   * goal or a recipe carries, where the parent is already the card.
   */
  inline?: boolean;
};

/**
 * What Morgane put on the page, in the order given (newest first from the
 * service): the title she wrote and the day she added it — never who added
 * it, which is always her (D-27).
 *
 * A file opens through `documents/[id]`, which checks the token owns it and
 * hands over a five-minute signed URL; there is no other address for it. A
 * link opens where she pointed, in a new tab so the page stays behind it.
 */
export const DocumentList = ({
  documents,
  locale,
  token,
  content,
  inline,
}: Props) => {
  const hrefOf = (document: PatientDocument) =>
    document.kind === "file"
      ? localePath(locale, `/p/${token}/documents/${document.id}`)
      : (document.url ?? "");

  const title = (document: PatientDocument) => (
    <a
      href={hrefOf(document)}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary focus-visible:ring-ring/40 inline-flex min-h-11 items-center gap-2 rounded-sm font-medium underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-[3px]"
    >
      {document.kind === "file" ? (
        <FileText aria-hidden="true" className="size-4 shrink-0" />
      ) : (
        <Link2 aria-hidden="true" className="size-4 shrink-0" />
      )}
      {document.title}
    </a>
  );

  if (inline) {
    return (
      <ul className="flex flex-col">
        {documents.map((document) => (
          <li key={document.id}>{title(document)}</li>
        ))}
      </ul>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {documents.map((document) => (
        <li key={document.id}>
          <Card>
            <CardContent className="flex flex-col gap-1">
              {title(document)}
              <Typography size="xs" tone="muted">
                {content.documentAddedLabel}{" "}
                {formatDate(document.addedOn, locale)}
              </Typography>
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  );
};
