import NextLink from "next/link";
import {
  Badge,
  Link,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Typography,
} from "@remi/ui/server";
import {
  practitionerStatusIntents,
  practitionerStatusLabels,
} from "@/components/practitioners/status";
import type { Practitioner } from "@/lib/fixtures";

type Props = {
  practitioners: Practitioner[];
};

/**
 * The whole cohort on one screen — no pagination, because fifteen seats is the
 * ceiling and a page control would imply the list grows past what an operator
 * can hold in their head.
 *
 * The name is the link rather than a trailing "open" column: an operator's hand
 * is already on the name they were scanning for.
 */
export const PractitionerTable = ({ practitioners }: Props) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Name</TableHead>
        <TableHead>Specialty</TableHead>
        <TableHead className="text-right">Clients</TableHead>
        <TableHead>Pilot status</TableHead>
        <TableHead>Joined</TableHead>
      </TableRow>
    </TableHeader>

    <TableBody>
      {practitioners.map((practitioner) => (
        <TableRow key={practitioner.id}>
          <TableCell>
            <div className="flex flex-col gap-0.5">
              <Link
                as={NextLink}
                href={`/practitioners/${practitioner.id}`}
                variant="primary"
                className="text-sm font-medium"
              >
                {practitioner.name}
              </Link>
              <Typography size="xs" tone="muted">
                {practitioner.practice} · {practitioner.city}
              </Typography>
            </div>
          </TableCell>

          <TableCell className="text-muted-foreground whitespace-nowrap text-sm">
            {practitioner.specialty}
          </TableCell>

          <TableCell className="text-right text-sm tabular-nums">
            {practitioner.clientCount}
          </TableCell>

          <TableCell>
            <Badge
              variant={practitionerStatusIntents[practitioner.status]}
              tone="subtle"
              size="sm"
            >
              {practitionerStatusLabels[practitioner.status]}
            </Badge>
          </TableCell>

          <TableCell className="text-muted-foreground whitespace-nowrap text-sm">
            {practitioner.joinedDate ?? `invited ${practitioner.invitedOn}`}
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);
