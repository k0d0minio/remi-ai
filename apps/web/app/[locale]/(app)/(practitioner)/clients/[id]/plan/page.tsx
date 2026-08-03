import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, NotebookPen } from "lucide-react";
import NextLink from "next/link";
import { formatDate, localePath } from "@remi/services/shared";
import { EmptyState, Link, Typography } from "@remi/ui/server";
import { PlanComposer } from "@/components/practitioner/plan-composer";
import { getSession } from "@/lib/auth/session";
import { getContent } from "@/lib/content";
import { fill } from "@/lib/content/fill";
import { getClient } from "@/lib/queries/clients";
import { getLatestConsultation } from "@/lib/queries/consultations";
import { listDraftRecommendations } from "@/lib/queries/plans";
import { resolveLocale, type LocaleParams } from "@/lib/locale-params";

type Params = LocaleParams & { id: string };

export const generateMetadata = async ({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> => {
  const locale = await resolveLocale(params);
  return { title: getContent(locale).planComposer.title };
};

/**
 * The composer sits behind the client's own page rather than on the roster: it
 * is what a practitioner opens straight out of a consultation, and it reads the
 * notes of that consultation and nothing else.
 */
const Page = async ({ params }: { params: Promise<Params> }) => {
  const locale = await resolveLocale(params);
  const { id } = await params;
  const session = await getSession();
  if (!session) {
    notFound();
  }

  const client = await getClient(session.practitionerId, id);
  if (!client.ok) {
    notFound();
  }

  const content = getContent(locale);
  const composer = content.planComposer;
  const person = client.data;
  const consultation = await getLatestConsultation(person.id);
  const drafts = consultation
    ? await listDraftRecommendations(consultation.id)
    : [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <Link
          as={NextLink}
          href={localePath(locale, `/clients/${person.id}`)}
          variant="muted"
          className="flex w-fit items-center gap-1.5 text-sm"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          {person.name}
        </Link>

        <div className="flex flex-col gap-2">
          <Typography as="h1" size="2xl" weight="semibold">
            {composer.title}
          </Typography>
          {consultation ? (
            <Typography tone="muted">
              {fill(composer.lead, {
                date: formatDate(consultation.heldAt, locale),
                name: person.name,
              })}
            </Typography>
          ) : null}
        </div>
      </div>

      {consultation ? (
        <PlanComposer
          clientName={person.name}
          notes={consultation.notes.split("\n")}
          drafts={drafts}
          categories={content.plan.categories}
          content={composer}
        />
      ) : (
        <EmptyState
          icon={NotebookPen}
          title={composer.empty.title}
          body={composer.empty.body}
        />
      )}
    </div>
  );
};

export default Page;
