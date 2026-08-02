import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { UserPlus } from "lucide-react";
import { formatDate, type Locale, type Person } from "@remi/services/shared";
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
import { getSession } from "@/lib/auth/session";
import { getContent } from "@/lib/content";
import { listClients } from "@/lib/queries/clients";

type Params = { locale: Locale };

export const generateMetadata = async ({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> => {
  const { locale } = await params;
  return { title: getContent(locale).clients.title };
};

const statusVariant = {
  invited: "info",
  active: "success",
  paused: "warning",
  ended: "neutral",
} as const;

const readinessVariant = {
  exploring: "info",
  committed: "success",
  struggling: "warning",
} as const;

/**
 * The first screen wired end to end through the query seam — proof that a page
 * reads the domain shape and never the storage behind it.
 */
const Page = async ({ params }: { params: Promise<Params> }) => {
  const { locale } = await params;
  const session = await getSession();
  if (!session) {
    notFound();
  }

  const content = getContent(locale).clients;
  const clients: Person[] = await listClients(session.practitionerId);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <Typography as="h1" size="2xl" weight="semibold">
          {content.title}
        </Typography>
        <Typography tone="muted">{content.lead}</Typography>
      </div>

      {clients.length === 0 ? (
        <EmptyState
          icon={UserPlus}
          title={content.empty.title}
          body={content.empty.body}
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{content.columns.name}</TableHead>
              <TableHead>{content.columns.status}</TableHead>
              <TableHead>{content.columns.readiness}</TableHead>
              <TableHead>{content.columns.nextConsultation}</TableHead>
              <TableHead>{content.columns.lastActive}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell className="font-medium">{client.name}</TableCell>
                <TableCell>
                  <Badge
                    variant={statusVariant[client.status]}
                    tone="subtle"
                    size="sm"
                  >
                    {content.status[client.status]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      readinessVariant[
                        client.profile.psychology.changeReadiness
                      ]
                    }
                    tone="subtle"
                    size="sm"
                  >
                    {
                      content.readiness[
                        client.profile.psychology.changeReadiness
                      ]
                    }
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {client.nextConsultationAt
                    ? formatDate(client.nextConsultationAt, locale)
                    : "—"}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {client.lastActiveAt
                    ? formatDate(client.lastActiveAt, locale)
                    : content.never}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default Page;
