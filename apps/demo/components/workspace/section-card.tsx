import type { ReactNode } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@remi/ui";
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
import type { WorkspaceRow } from "@/lib/mock/types";

type SectionProps = {
  /** The section landmark's id — the heading carries `<id>-title`. */
  id: string;
  title: string;
  description: string;
  /** Rendered next to the title — a count, a status, never decoration (R22). */
  badge?: ReactNode;
  children: ReactNode;
};

/**
 * The one shell every section renders in.
 *
 * On a phone it drops its border, its surface and its padding: fourteen framed
 * cards in a column spend the whole screen on frames. From `md` up the frame
 * comes back, because on a wide column it is what separates one section from
 * the next.
 *
 * It also opens a container-query context, so a section can lay its rows in two
 * columns when it has the width for it and one when it sits in a narrow segment
 * — the section decides from its own width, not from the window's (R18).
 */
export const WorkspaceSection = ({
  id,
  title,
  description,
  badge,
  children,
}: SectionProps) => (
  <Card
    elevation="flat"
    className="@container max-md:gap-4 max-md:rounded-none max-md:border-0 max-md:bg-transparent max-md:py-0"
  >
    <CardHeader className="max-md:px-0">
      <div className="flex flex-wrap items-center gap-2">
        <CardTitle id={`${id}-title`} className="text-base">
          {title}
        </CardTitle>
        {badge}
      </div>
      <CardDescription className="max-w-[70ch]">{description}</CardDescription>
    </CardHeader>
    <CardContent className="flex flex-col gap-4 max-md:px-0">
      {children}
    </CardContent>
  </Card>
);

type RowListProps = {
  rows: WorkspaceRow[];
  /** Two columns once the section itself is wide enough — never the window. */
  dense?: boolean;
  empty: string;
};

/**
 * Homogeneous items in a plain list, never a card each (R13). The rows in a
 * pantry list differ by their words, not their kind, so a card per row costs
 * space and scannability at once.
 */
export const WorkspaceRows = ({ rows, dense, empty }: RowListProps) => {
  if (rows.length === 0) {
    return (
      <Typography size="sm" tone="muted">
        {empty}
      </Typography>
    );
  }

  return (
    <ul
      className={cn(
        dense
          ? "@2xl:grid-cols-2 grid gap-2"
          : "border-border divide-border divide-y rounded-lg border",
      )}
    >
      {rows.map((row) => (
        <li
          key={row.id}
          className={cn(
            "flex min-h-11 flex-col gap-1 px-3 py-3",
            dense && "border-border rounded-lg border",
          )}
        >
          <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <Typography as="h3" size="sm" weight="medium">
              {row.title}
            </Typography>
            <div className="flex items-center gap-2">
              {row.badge ? (
                <Badge variant={row.badge.variant} tone="subtle" size="sm">
                  {row.badge.label}
                </Badge>
              ) : null}
              {row.meta ? (
                <Typography as="span" size="xs" tone="muted">
                  {row.meta}
                </Typography>
              ) : null}
            </div>
          </div>
          <Typography size="sm" tone="muted" className="max-w-[70ch]">
            {row.detail}
          </Typography>
        </li>
      ))}
    </ul>
  );
};

type FoldProps = {
  id: string;
  label: string;
  count: number;
  children: ReactNode;
};

/**
 * Archived material, folded into its own section with the count showing (R16).
 * It replaces the four conditional "archivées" cards the page grew: history
 * belongs under the thing it is the history of, not beside it.
 */
export const ArchivedFold = ({ id, label, count, children }: FoldProps) => {
  if (count === 0) {
    return null;
  }

  return (
    <Accordion type="single" collapsible>
      <AccordionItem value={id} variant="ghost">
        <AccordionTrigger className="py-2 text-sm">
          {label}
          <Badge variant="neutral" tone="subtle" size="sm" className="ml-2">
            {count}
          </Badge>
        </AccordionTrigger>
        <AccordionContent className="pb-2">{children}</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};
