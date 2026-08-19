import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Typography,
} from "@remi/ui/server";
import { cn } from "@remi/ui/utils";
import type { FactRow } from "@/lib/dossier/shared";

type Props = {
  title: string;
  description?: string;
  columns: readonly string[];
  /** Header of the trailing status column. Omit when no row carries a tag. */
  statusColumn?: string;
  rows: readonly FactRow[];
  /** A caveat the rows would otherwise be read without. */
  note?: string;
};

/**
 * Rows of fact rather than rows of record: the first cell is the row's subject
 * and the rest are the sentence that makes it defensible, which is why the
 * table keeps a minimum width and scrolls instead of squeezing prose into
 * slivers. The status column is separate from the cells because its intent is
 * a badge, never text.
 */
export const FactTable = ({
  title,
  description,
  columns,
  statusColumn,
  rows,
  note,
}: Props) => (
  <Card elevation="flat">
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      {description ? <CardDescription>{description}</CardDescription> : null}
    </CardHeader>

    <CardContent className="flex flex-col gap-3">
      <Table className="min-w-[44rem]">
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column}>{column}</TableHead>
            ))}
            {statusColumn ? <TableHead>{statusColumn}</TableHead> : null}
          </TableRow>
        </TableHeader>

        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.cells[0]}>
              {row.cells.map((cell, index) => (
                <TableCell
                  key={cell}
                  className={cn(
                    "align-top",
                    index === 0
                      ? "font-medium"
                      : "text-muted-foreground min-w-64",
                  )}
                >
                  {cell}
                </TableCell>
              ))}
              {statusColumn ? (
                <TableCell className="align-top">
                  {row.tag ? (
                    <Badge variant={row.tag.intent} tone="subtle" size="sm">
                      {row.tag.label}
                    </Badge>
                  ) : null}
                </TableCell>
              ) : null}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {note ? (
        <Typography size="xs" tone="muted" className="max-w-2xl">
          {note}
        </Typography>
      ) : null}
    </CardContent>
  </Card>
);
