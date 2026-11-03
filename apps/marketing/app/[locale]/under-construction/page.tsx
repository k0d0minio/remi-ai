import type { Metadata } from "next";
import { Container, Link, Section, Typography } from "@remi/ui/server";
import { Logo } from "@/components/logo";
import { UNDER_CONSTRUCTION } from "@/lib/content/landing";
import { buildMetadata } from "@/lib/metadata";
import { SITE } from "@/lib/site";
import { underConstructionSegment } from "@/lib/under-construction";

/**
 * The holding page. The proxy rewrites every page here while
 * `UNDER_CONSTRUCTION=1`; with the flag unset it stays reachable at its own
 * path, so a preview can show it for review. Never indexed either way.
 */
export const metadata: Metadata = {
  ...buildMetadata({
    ...UNDER_CONSTRUCTION.meta,
    path: `/${underConstructionSegment}`,
  }),
  robots: { index: false, follow: false },
};

const Page = () => (
  <Section spacing="lg" className="flex min-h-dvh items-center">
    <Container size="narrow" className="flex flex-col items-start gap-6">
      <Logo height={40} priority />
      <Typography variant="eyebrow" tone="muted">
        {UNDER_CONSTRUCTION.eyebrow}
      </Typography>
      <Typography as="h1" size="5xl" weight="bold" balance>
        {UNDER_CONSTRUCTION.title}
      </Typography>
      <Typography variant="lead" size="lg">
        {UNDER_CONSTRUCTION.lead}
      </Typography>
      <div className="flex flex-col gap-1">
        <Typography size="sm" tone="muted">
          {UNDER_CONSTRUCTION.contactLead}
        </Typography>
        <Link href={`mailto:${SITE.contactEmail}`} className="text-sm">
          {SITE.contactEmail}
        </Link>
      </div>
    </Container>
  </Section>
);

export default Page;
