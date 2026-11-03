import type { Metadata } from "next";
import type { Locale } from "@remi/services/shared";
import { Container, Link, Section, Typography } from "@remi/ui/server";
import { getContent } from "@/lib/content";
import { buildMetadata } from "@/lib/metadata";
import { underConstructionSegment } from "@/lib/under-construction";

type Params = { locale: Locale };

/**
 * The holding page. The proxy rewrites every page here while
 * `UNDER_CONSTRUCTION=1`; with the flag unset it stays reachable at its own
 * path, so a preview can show it for review. Never indexed either way.
 */
export const generateMetadata = async ({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> => {
  const { locale } = await params;
  const { meta } = getContent(locale).underConstruction;
  return {
    ...buildMetadata({
      ...meta,
      path: `/${underConstructionSegment}`,
      locale,
    }),
    robots: { index: false, follow: false },
  };
};

const Page = async ({ params }: { params: Promise<Params> }) => {
  const { locale } = await params;
  const content = getContent(locale);
  const page = content.underConstruction;

  return (
    <Section spacing="lg" className="flex min-h-dvh items-center">
      <Container size="narrow" className="flex flex-col items-start gap-6">
        <Typography variant="eyebrow" tone="muted">
          {page.eyebrow}
        </Typography>
        <Typography as="h1" variant="display" size="5xl" balance>
          {page.title}
        </Typography>
        <Typography variant="lead" size="lg">
          {page.lead}
        </Typography>
        <div className="flex flex-col gap-1">
          <Typography size="sm" tone="muted">
            {page.contactLead}
          </Typography>
          {content.contact.people.map((person) => (
            <Link
              key={person.email}
              href={`mailto:${person.email}`}
              className="text-sm"
            >
              {person.email}
            </Link>
          ))}
        </div>
      </Container>
    </Section>
  );
};

export default Page;
