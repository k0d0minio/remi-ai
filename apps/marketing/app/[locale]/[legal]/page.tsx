import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import NextLink from "next/link";
import { notFound } from "next/navigation";
import { localePath } from "@remi/services/shared";
import { Container, Link, Section, Typography } from "@remi/ui/server";
import { LEGAL_PAGE } from "@/lib/content/landing";
import { isLegalSlug, legalDocs, legalSlugs } from "@/lib/content/legal";
import { buildMetadata } from "@/lib/metadata";

type Params = { locale: string; legal: string };

/** The four legal pages the footer links to. Any other slug is a 404. */
export const generateStaticParams = (): Params[] =>
  legalSlugs.map((legal) => ({ locale: "fr", legal }));

export const dynamicParams = false;

export const generateMetadata = async ({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> => {
  const { legal } = await params;
  if (!isLegalSlug(legal)) {
    return {};
  }
  const doc = legalDocs[legal];
  return {
    ...buildMetadata({
      title: doc.title,
      description: doc.lead ?? doc.sections[0]?.paragraphs[0] ?? doc.title,
      path: `/${legal}`,
    }),
    robots: { index: false, follow: true },
  };
};

const Page = async ({ params }: { params: Promise<Params> }) => {
  const { legal } = await params;
  if (!isLegalSlug(legal)) {
    notFound();
  }
  const doc = legalDocs[legal];

  return (
    <Section spacing="md">
      <Container size="narrow" className="flex flex-col gap-6">
        <Link
          as={NextLink}
          href={localePath("fr", "/")}
          variant="standalone"
          className="self-start text-sm"
        >
          <ArrowLeft aria-hidden="true" />
          {LEGAL_PAGE.back}
        </Link>

        <div className="flex flex-col gap-2">
          <Typography as="h1" size="3xl" weight="bold" balance>
            {doc.title}
          </Typography>
          {doc.updated ? (
            <Typography size="sm" tone="muted">
              {LEGAL_PAGE.updated}
              {doc.updated}
            </Typography>
          ) : null}
        </div>

        {doc.intro ? (
          <Typography
            size="sm"
            weight="semibold"
            className="bg-warning-subtle text-warning-text rounded-lg px-3.5 py-2.5"
          >
            {doc.intro}
          </Typography>
        ) : null}
        {doc.lead ? <Typography tone="muted">{doc.lead}</Typography> : null}

        {doc.sections.map((section) => (
          <section key={section.title} className="flex flex-col gap-2">
            <Typography as="h2" size="lg" weight="semibold">
              {section.title}
            </Typography>
            {section.paragraphs.map((paragraph) => (
              <Typography key={paragraph} tone="muted" className="whitespace-pre-line">
                {paragraph}
              </Typography>
            ))}
          </section>
        ))}

        {doc.outro ? (
          <Typography size="sm" tone="muted" className="mt-4">
            {doc.outro}
          </Typography>
        ) : null}
      </Container>
    </Section>
  );
};

export default Page;
