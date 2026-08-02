import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import NextLink from "next/link";
import { Avatar, AvatarFallback } from "@remi/ui";
import {
  Badge,
  Link,
  Progress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Typography,
} from "@remi/ui/server";
import { clients } from "@/lib/mock/clients";

export const metadata: Metadata = { title: "Personnes accompagnées" };

const statusLabels = {
  invited: "Invitée",
  active: "Active",
  paused: "En pause",
} as const;

const statusVariant = {
  invited: "info",
  active: "success",
  paused: "warning",
} as const;

const readinessLabels = {
  exploring: "En exploration",
  committed: "Engagée",
  struggling: "En difficulté",
} as const;

const readinessVariant = {
  exploring: "info",
  committed: "success",
  struggling: "warning",
} as const;

/**
 * The roster as a working surface: assiduité is a bar rather than a number
 * because the practitioner is scanning for the outlier, and a bar is read in one
 * pass where four percentages are not.
 */
const Page = () => (
  <div className="flex flex-col gap-6">
    <div className="flex flex-col gap-2">
      <Typography as="h1" size="2xl" weight="semibold">
        Personnes accompagnées
      </Typography>
      <Typography tone="muted">
        Où chacune en est entre deux consultations.
      </Typography>
    </div>

    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nom</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead>Disposition</TableHead>
          <TableHead className="w-40">Assiduité</TableHead>
          <TableHead>Étape en cours</TableHead>
          <TableHead>Prochaine consultation</TableHead>
          <TableHead />
        </TableRow>
      </TableHeader>
      <TableBody>
        {clients.map((client) => (
          <TableRow key={client.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar size="sm">
                  <AvatarFallback>{client.initials}</AvatarFallback>
                </Avatar>
                <Typography
                  as="span"
                  size="sm"
                  weight="medium"
                  className="whitespace-nowrap"
                >
                  {client.name}
                </Typography>
              </div>
            </TableCell>
            <TableCell>
              <Badge
                variant={statusVariant[client.status]}
                tone="subtle"
                size="sm"
              >
                {statusLabels[client.status]}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge
                variant={readinessVariant[client.readiness]}
                tone="subtle"
                size="sm"
              >
                {readinessLabels[client.readiness]}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Progress
                  value={client.adherence}
                  label={`Assiduité de ${client.name}`}
                  size="sm"
                  intent={
                    client.adherence >= 70
                      ? "success"
                      : client.adherence >= 40
                        ? "warning"
                        : "error"
                  }
                  className="w-20"
                />
                <Typography as="span" size="xs" tone="muted">
                  {client.adherence} %
                </Typography>
              </div>
            </TableCell>
            <TableCell className="text-muted-foreground max-w-56 truncate text-sm">
              {client.currentStep}
            </TableCell>
            <TableCell className="text-muted-foreground whitespace-nowrap text-sm">
              {client.nextConsultation}
            </TableCell>
            <TableCell>
              <Link
                as={NextLink}
                href={`/practitioner/clients/${client.id}`}
                variant="primary"
                className="flex items-center gap-1 whitespace-nowrap text-sm"
              >
                Ouvrir
                <ArrowRight aria-hidden="true" className="size-3.5" />
              </Link>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
);

export default Page;
