import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Typography,
} from "@remi/ui/server";
import { FrameEditor } from "@/components/practitioner/frame-editor";
import { getSession } from "@/lib/auth/session";
import { getContent } from "@/lib/content";
import { getFrame } from "@/lib/queries/frames";
import { resolveLocale, type LocaleParams } from "@/lib/locale-params";

export const generateMetadata = async ({
  params,
}: {
  params: Promise<LocaleParams>;
}): Promise<Metadata> => {
  const locale = await resolveLocale(params);
  return { title: getContent(locale).frame.title };
};

/**
 * The screen that separates REMI from a diet app. Everything else in the
 * practitioner surface reports on what happened; this one decides what REMI is
 * allowed to say in the first place.
 */
const Page = async ({ params }: { params: Promise<LocaleParams> }) => {
  const locale = await resolveLocale(params);
  const session = await getSession();
  if (!session) {
    notFound();
  }

  const content = getContent(locale).frame;
  const frame = await getFrame(session.practitionerId);
  if (!frame) {
    notFound();
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8">
      <div className="flex flex-col gap-2">
        <Typography as="h1" size="2xl" weight="semibold">
          {content.title}
        </Typography>
        <Typography tone="muted">
          {frame.name} · {frame.summary}
        </Typography>
      </div>

      <Alert variant="info">
        <AlertTitle>{content.effects.title}</AlertTitle>
        <AlertDescription>
          <ul className="mt-2 flex flex-col gap-1.5">
            {content.effects.points.map((point) => (
              <li key={point} className="flex items-start gap-2">
                <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                {point}
              </li>
            ))}
          </ul>
        </AlertDescription>
      </Alert>

      <FrameEditor
        principles={frame.principles}
        excluded={frame.excluded}
        emphasised={frame.emphasised}
        content={content}
      />
    </div>
  );
};

export default Page;
