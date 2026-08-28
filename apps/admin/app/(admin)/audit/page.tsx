import type { Metadata } from "next";
import { listAuditEvents } from "@remi/services/server";
import {
  auditActions,
  formatDateTime,
  type AuditActionName,
} from "@remi/services/shared";
import { Badge, EmptyState, Typography } from "@remi/ui/server";
import { ScrollText } from "lucide-react";
import { AuditFilters } from "@/components/audit/audit-filters";
import { actionIntents, actionLabels } from "@/components/audit/vocabulary";
import { requireOperator } from "@/lib/auth/session";
import { ensureDatabase } from "@/lib/database";

export const metadata: Metadata = {
  title: "Journal",
};

/** Reads the database on every hit — never prerendered. */
export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const asAction = (value: string | undefined): AuditActionName | "all" =>
  (auditActions as readonly string[]).includes(value ?? "")
    ? (value as AuditActionName)
    : "all";

/**
 * Every operator action, newest first. The rest of the console shows what the
 * state is; this shows how it got there.
 *
 * Readable by any operator, not just owners. A trail only one person can read
 * is a trail that answers to nobody — and everything in it is an action that
 * an operator either took or could have taken.
 */
const Audit = async ({ searchParams }: { searchParams: SearchParams }) => {
  const operator = await requireOperator();
  ensureDatabase();

  const params = await searchParams;
  const action = asAction(first(params.action));
  const mine = first(params.mine) === "1";

  const events = await listAuditEvents({
    action,
    actorId: mine ? operator.id : undefined,
    limit: 200,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Typography as="h1" size="2xl" weight="semibold">
          Journal
        </Typography>
        <Typography size="sm" tone="muted">
          Qui a fait quoi, et quand. Les 200 dernières actions.
        </Typography>
      </div>

      <AuditFilters action={action} mine={mine} />

      {events.length === 0 ? (
        <EmptyState
          icon={ScrollText}
          title="Aucune action enregistrée"
          body="Le journal se remplit dès qu'une action est effectuée dans la console."
        />
      ) : (
        <ul className="flex flex-col gap-1">
          {events.map((event) => (
            <li
              key={event.id}
              className="border-border flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border px-4 py-2.5"
            >
              <Badge
                variant={actionIntents[event.action]}
                tone="subtle"
                size="sm"
              >
                {actionLabels[event.action]}
              </Badge>

              {event.targetLabel ? (
                <Typography as="span" size="sm" weight="medium">
                  {event.targetLabel}
                </Typography>
              ) : null}

              {event.detail ? (
                <Typography as="span" size="xs" tone="muted">
                  {event.detail}
                </Typography>
              ) : null}

              <span className="ml-auto flex flex-wrap items-center gap-3">
                <Typography as="span" size="xs" tone="muted">
                  {event.actorName || event.actorEmail || "compte supprimé"}
                </Typography>
                <Typography
                  as="span"
                  size="xs"
                  tone="muted"
                  className="tabular-nums"
                >
                  {formatDateTime(event.createdAt)}
                </Typography>
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Audit;
