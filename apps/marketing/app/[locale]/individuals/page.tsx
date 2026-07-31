import type { Metadata } from "next";
import { Alert, AlertDescription, AlertTitle, Container, Section } from "@remi/ui/server";
import { CtaSection } from "@/components/sections/cta-section";
import { FeatureSection } from "@/components/sections/feature-section";
import { HeroSection } from "@/components/sections/hero-section";
import { StepsSection } from "@/components/sections/steps-section";
import { getContent } from "@/lib/content";
import type { Locale } from "@/lib/i18n";
import { buildMetadata } from "@/lib/metadata";

type Params = { locale: Locale };

export const generateMetadata = async ({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> => {
  const { locale } = await params;
  const { meta } = getContent(locale).individuals;
  return buildMetadata({ ...meta, path: "/individuals", locale });
};

const Page = async ({ params }: { params: Promise<Params> }) => {
  const { locale } = await params;
  const content = getContent(locale).individuals;

  return (
    <>
      <HeroSection content={content.hero} locale={locale} />
      <StepsSection
        eyebrow={content.steps.eyebrow}
        title={content.steps.title}
        steps={content.steps.items}
        tone="muted"
      />
      <FeatureSection content={content.vision} columns={2} />

      {/* Where REMI actually stands — the section that keeps this page honest. */}
      <Section spacing="sm">
        <Container size="narrow">
          <Alert variant="info">
            <AlertTitle>{content.status.title}</AlertTitle>
            <AlertDescription>{content.status.body}</AlertDescription>
          </Alert>
        </Container>
      </Section>

      <CtaSection content={content.cta} locale={locale} />
    </>
  );
};

export default Page;
