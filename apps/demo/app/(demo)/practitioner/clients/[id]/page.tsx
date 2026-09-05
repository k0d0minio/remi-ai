import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Activity, ArrowLeft, NotebookPen } from "lucide-react";
import NextLink from "next/link";
import { Link } from "@remi/ui/server";
import { PatientWorkspace } from "@/components/workspace/patient-workspace";
import { renderSections } from "@/components/workspace/workspace-sections";
import { clients } from "@/lib/mock/clients";
import type { ClientStatus, WorkspaceSegment } from "@/lib/mock/types";
import { patientRecords, segmentOrder } from "@/lib/mock/workspace";

type Params = { id: string };
type Search = { vue?: string };

/** The segment lives in the URL, so it is read here rather than after hydration. */
export const dynamic = "force-dynamic";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> => {
  const { id } = await params;
  return { title: patientRecords[id]?.pseudonym ?? "Dossier" };
};

const statusLabels: Record<ClientStatus, string> = {
  active: "suivi actif",
  invited: "invitée",
  paused: "en pause",
};

/**
 * The admin patient page, laid out for the screen it is on.
 *
 * The prototype for `.icm/intake/patient-workspace/` — the whole record on one
 * page, in three views: a two-column desktop with a sticky rail, a single
 * medium column under a scrolling anchor row, and a phone that shows one
 * segment at a time. It is deliberately the same route the console's client
 * detail was, rather than a second page beside it.
 */
const Page = async ({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Search>;
}) => {
  const { id } = await params;
  const { vue } = await searchParams;
  const record = patientRecords[id];
  const client = clients.find((candidate) => candidate.id === id);
  if (!record || !client) {
    notFound();
  }

  const initialSegment: WorkspaceSegment = segmentOrder.includes(
    vue as WorkspaceSegment,
  )
    ? (vue as WorkspaceSegment)
    : "suivi";

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          as={NextLink}
          href="/practitioner/clients"
          variant="muted"
          className="flex w-fit items-center gap-1.5 text-sm"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Personnes accompagnées
        </Link>
        {/* The two screens this page used to lead to. They are separate
            prototypes, so they stay reachable rather than being orphaned by
            this one. */}
        <div className="flex flex-wrap items-center gap-4">
          <Link
            as={NextLink}
            href={`/practitioner/clients/${client.id}/labs`}
            variant="muted"
            className="flex items-center gap-1.5 text-sm"
          >
            <Activity aria-hidden="true" className="size-4" />
            Biologie et marqueurs
          </Link>
          <Link
            as={NextLink}
            href={`/practitioner/clients/${client.id}/plan`}
            variant="muted"
            className="flex items-center gap-1.5 text-sm"
          >
            <NotebookPen aria-hidden="true" className="size-4" />
            Préparer le plan
          </Link>
        </div>
      </div>

      <PatientWorkspace
        patient={{
          pseudonym: record.pseudonym,
          fullName: record.fullName,
          status: record.status,
          statusLabel: statusLabels[record.status],
          identity: record.identity,
          linkUrl: record.link.url,
        }}
        glance={record.glance}
        initialSegment={initialSegment}
        sections={renderSections(record)}
      />
    </div>
  );
};

export default Page;
