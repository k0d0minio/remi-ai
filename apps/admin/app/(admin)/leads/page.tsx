import type { Metadata } from "next";
import { Inbox, Mail, Phone } from "lucide-react";
import { listLeads, type Lead } from "@remi/services/server";
import { formatDate, isLeadType, type LeadType } from "@remi/services/shared";
import { Button } from "@remi/ui";
import { Badge, EmptyState, Link, Typography } from "@remi/ui/server";
import { LeadFilters } from "@/components/leads/lead-filters";
import {
  leadStateLabels,
  leadTypeIntents,
  leadTypeLabels,
  offerInterestLabels,
  type LeadState,
} from "@/components/leads/vocabulary";
import { requireOperator } from "@/lib/auth/session";
import { ensureDatabase } from "@/lib/database";
import { setLeadContactedAction } from "@/lib/leads/actions";

export const metadata: Metadata = {
  title: "Liste d'attente",
};

/** Reads the database on every hit — never prerendered. */
export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const first = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value[0] : value;

const asType = (value: string | undefined): LeadType | "all" =>
  value && isLeadType(value) ? value : "all";

const asState = (value: string | undefined): LeadState =>
  value && value in leadStateLabels ? (value as LeadState) : "pending";

const nameOf = (lead: Lead) =>
  [lead.firstName, lead.lastName].filter(Boolean).join(" ") || lead.email;

/**
 * The waiting lists of the public site (triage/morgane-transmission). Rows
 * rather than a table: Morgane reads this on her phone between consultations,
 * and answers each row by email from the address on it.
 *
 * The filters live in the URL, so a filtered list is a link, and the server
 * does the filtering. The default view is what is still to answer.
 */
const Leads = async ({ searchParams }: { searchParams: SearchParams }) => {
  ensureDatabase();
  const params = await searchParams;
  const type = asType(first(params.type));
  const state = asState(first(params.state));
  await requireOperator();

  const leads = await listLeads({ type, state });
  const filtered = type !== "all" || state !== "pending";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Typography as="h1" size="2xl" weight="semibold">
          Liste d&apos;attente
        </Typography>
        <Typography size="sm" tone="muted">
          Les personnes qui ont laissé leurs coordonnées sur le site : patients
          pilotes, questions et praticiens.
        </Typography>
      </div>

      <LeadFilters type={type} state={state} />

      {leads.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title={
            filtered ? "Aucune inscription ne correspond" : "Rien à contacter"
          }
          body={
            filtered
              ? "Changez la liste ou l'état pour retrouver une inscription."
              : "Chaque inscription sur le site apparaît ici, avec un e-mail à morgane@remiai.be."
          }
        />
      ) : (
        <>
          <Typography size="xs" tone="muted" role="status">
            {leads.length}{" "}
            {leads.length === 1 ? "inscription" : "inscriptions"}
          </Typography>

          <ul className="flex flex-col gap-2">
            {leads.map((lead) => (
              <li
                key={lead.id}
                className="border-border bg-card flex flex-col gap-3 rounded-lg border px-4 py-3"
              >
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <Typography as="span" size="sm" weight="medium">
                    {nameOf(lead)}
                  </Typography>
                  <Badge
                    variant={leadTypeIntents[lead.type]}
                    tone="subtle"
                    size="sm"
                  >
                    {leadTypeLabels[lead.type]}
                  </Badge>
                  {lead.offerInterest ? (
                    <Typography as="span" size="xs" tone="muted">
                      {offerInterestLabels[lead.offerInterest]}
                    </Typography>
                  ) : null}
                  {lead.profession ? (
                    <Typography as="span" size="xs" tone="muted">
                      {lead.profession}
                    </Typography>
                  ) : null}
                  <span className="ml-auto flex items-center gap-3">
                    <Typography as="span" size="xs" tone="muted">
                      reçu le {formatDate(lead.createdAt)}
                    </Typography>
                    {lead.contactedAt ? (
                      <Badge variant="neutral" tone="subtle" size="sm">
                        contacté le {formatDate(lead.contactedAt)}
                      </Badge>
                    ) : (
                      <Badge variant="info" tone="solid" size="sm">
                        à contacter
                      </Badge>
                    )}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                  <Link
                    href={`mailto:${lead.email}`}
                    variant="primary"
                    className="inline-flex items-center gap-1.5 text-sm"
                  >
                    <Mail aria-hidden="true" className="size-3.5" />
                    {lead.email}
                  </Link>
                  {lead.phone ? (
                    <Link
                      href={`tel:${lead.phone.replace(/[^+\d]/g, "")}`}
                      variant="primary"
                      className="inline-flex items-center gap-1.5 text-sm"
                    >
                      <Phone aria-hidden="true" className="size-3.5" />
                      {lead.phone}
                    </Link>
                  ) : null}
                </div>

                {lead.message ? (
                  <Typography size="sm" className="whitespace-pre-line">
                    {lead.message}
                  </Typography>
                ) : null}

                <form action={setLeadContactedAction} className="flex">
                  <input type="hidden" name="id" value={lead.id} />
                  <input
                    type="hidden"
                    name="contacted"
                    value={lead.contactedAt ? "false" : "true"}
                  />
                  <Button type="submit" variant="outline" size="sm">
                    {lead.contactedAt ? "Remettre à contacter" : "Marquer contacté"}
                  </Button>
                </form>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
};

export default Leads;
