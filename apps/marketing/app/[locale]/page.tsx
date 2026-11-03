import type { Metadata } from "next";
import { FeaturesSection } from "@/components/sections/features-section";
import { GeneticSection } from "@/components/sections/genetic-section";
import { HeroSection } from "@/components/sections/hero-section";
import { OffersSection } from "@/components/sections/offers-section";
import { PractitionersSection } from "@/components/sections/practitioners-section";
import { SignupSection } from "@/components/sections/signup-section";
import { TeamSection } from "@/components/sections/team-section";
import { TimelineSection } from "@/components/sections/timeline-section";
import { StickyCta } from "@/components/sticky-cta";
import { META } from "@/lib/content/landing";
import { buildMetadata } from "@/lib/metadata";

export const metadata: Metadata = buildMetadata({
  title: META.title,
  description: META.description,
  path: "/",
  absoluteTitle: true,
});

/**
 * Morgane's single page, in her order: hero → offers → the genetic analysis
 * explained → how it works → sign-up → team → calendar → practitioners.
 * To reorder, move a section here and keep the anchors.
 */
const Page = () => (
  <>
    <HeroSection />
    <OffersSection />
    <GeneticSection />
    <FeaturesSection />
    <SignupSection />
    <TeamSection />
    <TimelineSection />
    <PractitionersSection />
    <StickyCta />
  </>
);

export default Page;
