import { notFound } from "next/navigation";
import { isLocale } from "@remi/services/shared";
import { DocumentList } from "@/components/patient-link/document-list";
import { SegmentPage } from "@/components/patient-link/segment-page";
import { getContent } from "@/lib/content";
import { hasSegment, loadPatientLink } from "@/lib/patient-link/load";

/** Reads the database on every hit — never prerendered. */
export const dynamic = "force-dynamic";

type Params = { locale: string; token: string };

/**
 * Documents: every PDF, image and link she put on the page, newest first — her
 * 14 Sept § 4, « un document accessible dans son espace est suffisant ».
 *
 * A patient with no document 404s here and sees no navigation entry, the same
 * rule as every segment.
 */
const Segment = async ({ params }: { params: Promise<Params> }) => {
  const { locale, token } = await params;
  if (!isLocale(locale)) {
    notFound();
  }
  const content = getContent(locale).patientLink;

  const data = await loadPatientLink(token);
  if (!data || !hasSegment(data, "documents")) {
    notFound();
  }

  return (
    <SegmentPage title={content.documentsTitle}>
      <DocumentList
        documents={data.documents}
        locale={locale}
        token={token}
        content={content}
      />
    </SegmentPage>
  );
};

export default Segment;
