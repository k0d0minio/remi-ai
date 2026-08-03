import { ScrollText } from "lucide-react";
import {
  Badge,
  EmptyState,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Typography,
} from "@remi/ui/server";
import { auditKindIntents, auditKindLabels } from "@/components/audit/kinds";
import type { AuditEntry } from "@/lib/fixtures";

type Props = {
  entries: AuditEntry[];
};

/**
 * Newest first, and never anything else. A log an operator can re-sort is a log
 * two people can describe differently, which is exactly what it exists to
 * prevent — the order is the record.
 */
export const AuditTable = ({ entries }: Props) => {
  if (entries.length === 0) {
    return (
      <EmptyState
        icon={ScrollText}
        title="Nothing of that kind"
        body="No entry in the log matches this filter. Widen it to see the rest."
      />
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>When</TableHead>
          <TableHead>Operator</TableHead>
          <TableHead>Action</TableHead>
          <TableHead>Target</TableHead>
          <TableHead>Kind</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {entries.map((entry) => (
          <TableRow key={entry.id}>
            <TableCell className="text-muted-foreground whitespace-nowrap text-sm tabular-nums">
              {entry.at}
            </TableCell>

            <TableCell className="whitespace-nowrap text-sm">
              {entry.operator}
            </TableCell>

            <TableCell>
              <Typography as="span" size="sm" weight="medium">
                {entry.action}
              </Typography>
            </TableCell>

            <TableCell className="text-muted-foreground max-w-80 truncate text-sm">
              {entry.target}
            </TableCell>

            <TableCell>
              <Badge
                variant={auditKindIntents[entry.kind]}
                tone="subtle"
                size="sm"
              >
                {auditKindLabels[entry.kind]}
              </Badge>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
