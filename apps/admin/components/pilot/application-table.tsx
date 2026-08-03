import {
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Typography,
} from "@remi/ui/server";
import type {
  ApplicationStatus,
  Intent,
  PilotApplication,
} from "@/lib/fixtures";

type Props = {
  applications: PilotApplication[];
};

const statusLabels: Record<ApplicationStatus, string> = {
  applied: "applied",
  invited: "invited",
  onboarded: "onboarded",
  declined: "declined",
};

/**
 * `applied` is warning rather than info: an application nobody has answered is
 * the state that costs the pilot a seat, and it should not read as calmly as an
 * invite that is already out.
 */
const statusIntents: Record<ApplicationStatus, Intent> = {
  applied: "warning",
  invited: "info",
  onboarded: "success",
  declined: "neutral",
};

export const ApplicationTable = ({ applications }: Props) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Name</TableHead>
        <TableHead>Specialty</TableHead>
        <TableHead>Where they came from</TableHead>
        <TableHead>Applied</TableHead>
        <TableHead>Status</TableHead>
      </TableRow>
    </TableHeader>

    <TableBody>
      {applications.map((application) => (
        <TableRow key={application.id}>
          <TableCell>
            <div className="flex flex-col gap-0.5">
              <Typography as="span" size="sm" weight="medium">
                {application.name}
              </Typography>
              <Typography size="xs" tone="muted">
                {application.city}
              </Typography>
            </div>
          </TableCell>

          <TableCell className="text-muted-foreground whitespace-nowrap text-sm">
            {application.specialty}
          </TableCell>

          <TableCell className="text-muted-foreground max-w-64 truncate text-sm">
            {application.source}
          </TableCell>

          <TableCell className="text-muted-foreground whitespace-nowrap text-sm">
            {application.appliedOn}
          </TableCell>

          <TableCell>
            <Badge
              variant={statusIntents[application.status]}
              tone="subtle"
              size="sm"
            >
              {statusLabels[application.status]}
            </Badge>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);
