import { ArrowRight, Clock, TrendingDown } from "lucide-react";
import NextLink from "next/link";
import { Avatar, AvatarFallback, Button } from "@remi/ui";
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Link,
  Typography,
} from "@remi/ui/server";
import { TrendLine } from "@/components/trend-line";
import type { AtRiskClient } from "@/lib/mock/types";

type Props = {
  clients: AtRiskClient[];
};

/**
 * The list a practitioner opens the screen for. Every card carries the same
 * three things in the same order — what the cohort read shows, why it reads that
 * way, and what to do next — because a flag with no suggested action is the
 * dashboard failure mode this screen exists to avoid.
 *
 * The suggestion is a proposal, spelled as one: it names its reasoning and it
 * opens a surface where the practitioner does the deciding. Nothing here sends
 * anything to anyone.
 */
export const AtRiskList = ({ clients }: Props) => (
  <ul className="flex flex-col gap-4">
    {clients.map((client) => (
      <li key={client.name}>
        <Card variant={client.intent} elevation="flat" className="gap-4">
          <CardHeader className="gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <Avatar size="sm">
                <AvatarFallback>{client.initials}</AvatarFallback>
              </Avatar>
              <CardTitle className="text-base">{client.name}</CardTitle>
              <Badge variant={client.intent} tone="subtle" size="sm">
                {client.band}
              </Badge>
              {client.clientId ? (
                <Link
                  as={NextLink}
                  href={`/practitioner/clients/${client.clientId}`}
                  variant="primary"
                  className="ml-auto flex items-center gap-1 whitespace-nowrap text-sm"
                >
                  Ouvrir la fiche
                  <ArrowRight aria-hidden="true" className="size-3.5" />
                </Link>
              ) : null}
            </div>
          </CardHeader>

          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <Typography as="span" size="2xl" weight="semibold">
                {client.adherence} %
              </Typography>
              <Badge variant={client.intent} tone="subtle" size="sm">
                <TrendingDown aria-hidden="true" />−{Math.abs(client.delta)} pts
                en huit semaines
              </Badge>
              <Typography
                as="span"
                size="xs"
                tone="muted"
                className="flex items-center gap-1"
              >
                <Clock aria-hidden="true" className="size-3" />
                {client.lastActive}
              </Typography>
              <TrendLine
                points={client.trend}
                tone={client.intent}
                domain={[0, 100]}
                size="md"
                className="ml-auto"
              />
            </div>

            <ul className="flex flex-col gap-1">
              {client.reasons.map((reason) => (
                <li key={reason} className="flex gap-2">
                  <span aria-hidden="true" className="text-muted-foreground">
                    ·
                  </span>
                  <Typography size="sm" tone="muted">
                    {reason}
                  </Typography>
                </li>
              ))}
            </ul>

            <div className="border-border bg-muted/40 flex flex-col gap-2 rounded-lg border p-3">
              <Typography variant="eyebrow" tone="muted">
                Action suggérée
              </Typography>
              <Typography size="sm" weight="medium">
                {client.action.label}
              </Typography>
              <Typography size="sm" tone="muted">
                {client.action.why}
              </Typography>
              <div>
                <Button asChild variant="outline" size="sm">
                  <NextLink href={client.action.href}>
                    Commencer
                    <ArrowRight aria-hidden="true" />
                  </NextLink>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </li>
    ))}
  </ul>
);
