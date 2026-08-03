import { CtaSection } from "@/components/sections/cta-section";
import { FaqSection } from "@/components/sections/faq-section";
import { FeaturesSection } from "@/components/sections/features-section";
import { HeroSection } from "@/components/sections/hero-section";
import { HowItWorksSection } from "@/components/sections/how-it-works-section";
import { LogoSection } from "@/components/sections/logo-section";
import { PricingSection } from "@/components/sections/pricing-section";
import { StatsSection } from "@/components/sections/stats-section";
import { TestimonialsSection } from "@/components/sections/testimonials-section";
import { hero } from "@/lib/content/landing";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "The wellness copilot between consultations",
  description: hero.subtitle,
  path: "/",
});

// `const Page` rather than `export default function`: prefer-arrow is a warning
// and CI runs with --max-warnings=0, with no exemption for route files.
const Page = () => (
  <>
    <HeroSection />
    <LogoSection />
    <StatsSection />
    <FeaturesSection />
    <HowItWorksSection />
    <TestimonialsSection />
    <PricingSection />
    <FaqSection />
    <CtaSection />
  </>
);

export default Page;
