import { Users } from "lucide-react";
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@remi/ui/server";
import {
  rosterStatusIntents,
  rosterStatusLabels,
} from "@/components/practitioners/status";
import type { Practitioner } from "@/lib/fixtures";

type Props = {
  practitioner: Practitioner;
};

/**
 * The recently active end of the practitioner's book rather than the whole of
 * it. An operator opens this to answer "is anything moving on this account",
 * and the three most recent rows answer that where thirty would bury it.
 */
export const ClientRoster = ({ practitioner }: Props) => (
  <Card elevation="flat">
    <CardHeader>
      <CardTitle>Client roster</CardTitle>
      <CardDescription>
        {practitioner.roster.length === 0
          ? "Nobody on the books yet."
          : `The ${practitioner.roster.length} most recently active, of ${practitioner.clientCount} in total.`}
      </CardDescription>
    </CardHeader>

    <CardContent>
      {practitioner.roster.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No clients on this account"
          body="Clients appear once the practitioner accepts their invite and starts inviting people of their own."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Plans</TableHead>
              <TableHead>Last active</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {practitioner.roster.map((client) => (
              <TableRow key={client.id}>
                <TableCell className="whitespace-nowrap text-sm font-medium">
                  {client.name}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={rosterStatusIntents[client.status]}
                    tone="subtle"
                    size="sm"
                  >
                    {rosterStatusLabels[client.status]}
                  </Badge>
                </TableCell>
                <TableCell className="text-right text-sm tabular-nums">
                  {client.plans}
                </TableCell>
                <TableCell className="text-muted-foreground whitespace-nowrap text-sm">
                  {client.lastActive}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </CardContent>
  </Card>
);
