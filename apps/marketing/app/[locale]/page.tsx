import type { Metadata } from "next";
import type { Locale } from "@remi/services/shared";
import { AudienceSection } from "@/components/sections/audience-section";
import { CtaSection } from "@/components/sections/cta-section";
import { FaqSection } from "@/components/sections/faq-section";
import { FeatureSection } from "@/components/sections/feature-section";
import { HeroSection } from "@/components/sections/hero-section";
import { PartnershipSection } from "@/components/sections/partnership-section";
import { RoadmapSection } from "@/components/sections/roadmap-section";
import { StatsSection } from "@/components/sections/stats-section";
import { StepsSection } from "@/components/sections/steps-section";
import { getContent } from "@/lib/content";
import { buildMetadata } from "@/lib/metadata";

type Params = { locale: Locale };

export const generateMetadata = async ({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> => {
  const { locale } = await params;
  const { meta } = getContent(locale).home;
  return buildMetadata({ ...meta, path: "/", locale });
};

// `const Page` rather than `export default function`: prefer-arrow is a warning
// and CI runs with --max-warnings=0, with no exemption for route files.
const Page = async ({ params }: { params: Promise<Params> }) => {
  const { locale } = await params;
  const content = getContent(locale).home;

  return (
    <>
      <HeroSection content={content.hero} locale={locale} />
      <StatsSection
        eyebrow={content.stats.eyebrow}
        title={content.stats.title}
        note={content.stats.note}
        stats={content.stats.items}
      />
      <AudienceSection content={content.audience} locale={locale} />
      <StepsSection
        eyebrow={content.steps.eyebrow}
        title={content.steps.title}
        steps={content.steps.items}
        tone="muted"
      />
      <FeatureSection content={content.vision} id="vision" />
      <RoadmapSection content={content.roadmap} tone="muted" />
      <PartnershipSection content={content.partnership} />
      <FaqSection
        eyebrow={content.faq.eyebrow}
        title={content.faq.title}
        items={content.faq.items}
      />
      <CtaSection content={content.cta} locale={locale} />
    </>
  );
};

export default Page;
