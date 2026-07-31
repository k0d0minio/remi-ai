import { ArrowRight } from "lucide-react";
import NextLink from "next/link";
import { Button } from "@remi/ui";
import { FadeIn } from "@remi/ui/motion";
import { Badge, Hero } from "@remi/ui/server";
import type { HeroContent } from "@/lib/content/types";
import { localePath, type Locale } from "@/lib/i18n";

type Props = {
  content: HeroContent;
  locale: Locale;
};

/**
 * The headline is inside `FadeIn`, which renders its children statically first
 * and animates only once its chunk has loaded — so this copy is in the server
 * HTML and is the LCP element whether or not JavaScript ever arrives.
 *
 * No `media` slot: there is no product screenshot because there is no product
 * yet, and a mockup posing as one is exactly what this site must not do.
 */
export const HeroSection = ({ content, locale }: Props) => (
  <FadeIn>
    <Hero
      eyebrow={
        <Badge variant="info" tone="subtle">
          {content.eyebrow}
        </Badge>
      }
      title={content.title}
      subtitle={content.subtitle}
      actions={content.actions.map((action, index) => (
        <Button
          key={action.href}
          asChild
          size="xl"
          variant={action.variant}
        >
          <NextLink href={localePath(locale, action.href)}>
            {action.label}
            {index === 0 ? <ArrowRight aria-hidden="true" /> : null}
          </NextLink>
        </Button>
      ))}
    />
  </FadeIn>
);
