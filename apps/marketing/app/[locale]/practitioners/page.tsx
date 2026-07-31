import type { Metadata } from "next";
import { CtaSection } from "@/components/sections/cta-section";
import { FeatureSection } from "@/components/sections/feature-section";
import { HeroSection } from "@/components/sections/hero-section";
import { PilotSection } from "@/components/sections/pilot-section";
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
  const { meta } = getContent(locale).practitioners;
  return buildMetadata({ ...meta, path: "/practitioners", locale });
};

const Page = async ({ params }: { params: Promise<Params> }) => {
  const { locale } = await params;
  const content = getContent(locale).practitioners;

  return (
    <>
      <HeroSection content={content.hero} locale={locale} />
      <FeatureSection content={content.pains} tone="muted" />
      <FeatureSection content={content.vision} columns={2} />
      <PilotSection content={content.pilot} locale={locale} />
      <CtaSection content={content.cta} locale={locale} />
    </>
  );
};

export default Page;
