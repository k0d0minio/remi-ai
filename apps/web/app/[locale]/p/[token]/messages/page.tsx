import { notFound } from "next/navigation";
import { isLocale } from "@remi/services/shared";
import { Card, CardContent, Typography } from "@remi/ui/server";
import { MessageComposer } from "@/components/patient-link/message-composer";
import { MessageThread } from "@/components/patient-link/message-thread";
import { SegmentPage } from "@/components/patient-link/segment-page";
import { getContent } from "@/lib/content";
import { loadPatientLink } from "@/lib/patient-link/load";

/** Reads the database on every hit — never prerendered. */
export const dynamic = "force-dynamic";

type Params = { locale: string; token: string };

/**
 * Messages: her § 6 question and the box first, then the thread newest first
 * with her replies under her name.
 *
 * Like Repas it never 404s on an empty record and is never hidden from the
 * navigation — it is where the first message is written
 * (`lib/patient-link/load.ts` → `visibleSegments`).
 */
const Segment = async ({ params }: { params: Promise<Params> }) => {
  const { locale, token } = await params;
  if (!isLocale(locale)) {
    notFound();
  }
  const content = getContent(locale).patientLink;

  const data = await loadPatientLink(token);
  if (!data) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-8">
      <SegmentPage title={content.messages.title}>
        <Card>
          <CardContent>
            <MessageComposer
              messages={data.messages}
              token={token}
              locale={locale}
              id="message-segment-body"
              content={content}
            />
          </CardContent>
        </Card>
      </SegmentPage>

      <SegmentPage title={content.messages.threadTitle}>
        {data.messages.length > 0 ? (
          <MessageThread
            messages={data.messages}
            locale={locale}
            content={content}
          />
        ) : (
          <Typography size="sm" tone="muted">
            {content.messages.empty}
          </Typography>
        )}
      </SegmentPage>
    </div>
  );
};

export default Segment;
