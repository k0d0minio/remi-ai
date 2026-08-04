import { Info } from "lucide-react";
import type { Metadata } from "next";
import type { Locale } from "@remi/services/shared";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Badge,
  Container,
  Section,
  Typography,
} from "@remi/ui/server";
import { StatusBoard } from "@/components/status/status-board";
import { getContent } from "@/lib/content";
import { buildMetadata } from "@/lib/metadata";

type Params = { locale: Locale };

export const generateMetadata = async ({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> => {
  const { locale } = await params;
  const { meta } = getContent(locale).status;
  return buildMetadata({ ...meta, path: "/status", locale });
};

/**
 * A static segment beside `[category]`, which Next resolves in its favour — so
 * "status" is a page and never a category. Nothing else claims that slug.
 *
 * The notice is not a disclaimer added late: no monitoring is connected, so
 * every figure below is placeholder, and a status page that let a reader assume
 * otherwise would be the one page on this site where a lie actually costs
 * someone something. The page exists now so it is finished the day real checks
 * do run — the board reads from `lib/status.ts`, and a probe replaces that
 * module without touching a line of markup.
 */
const Page = async ({ params }: { params: Promise<Params> }) => {
  const { locale } = await params;
  const content = getContent(locale).status;

  return (
    <Section spacing="md">
      <Container size="content" className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <Typography variant="eyebrow" tone="muted">
            {content.eyebrow}
          </Typography>

          <Typography as="h1" variant="display" size="5xl" balance>
            {content.title}
          </Typography>

          <Typography variant="lead" size="lg">
            {content.lead}
          </Typography>

          <Badge variant="success" tone="subtle" className="mt-2 w-fit">
            {content.overall}
          </Badge>
        </div>

        <Alert variant="info">
          <Info aria-hidden="true" />
          <AlertTitle>{content.notice.title}</AlertTitle>
          <AlertDescription>
            <Typography size="sm" className="leading-relaxed">
              {content.notice.body}
            </Typography>
          </AlertDescription>
        </Alert>

        <StatusBoard locale={locale} content={content} />
      </Container>
    </Section>
  );
};

export default Page;
