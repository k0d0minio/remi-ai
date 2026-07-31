import { ArrowRight } from "lucide-react";
import NextLink from "next/link";
import { Button } from "@remi/ui";
import { FadeIn } from "@remi/ui/motion";
import { Badge, Card, Hero, Typography } from "@remi/ui/server";
import { hero } from "@/lib/content/landing";

/**
 * The headline is inside `FadeIn`, which renders its children statically first
 * and animates only once its chunk has loaded — so this copy is in the server
 * HTML and is the LCP element whether or not JavaScript ever arrives.
 */
export const HeroSection = () => (
  <FadeIn>
    <Hero
      eyebrow={
        <Badge variant="info" tone="subtle">
          {hero.eyebrow}
        </Badge>
      }
      title={hero.title}
      subtitle={hero.subtitle}
      actions={
        <>
          <Button asChild size="xl">
            <NextLink href="#pricing">
              Start free
              <ArrowRight aria-hidden="true" />
            </NextLink>
          </Button>
          <Button asChild size="xl" variant="outline">
            <NextLink href="#how-it-works">See how it works</NextLink>
          </Button>
        </>
      }
      media={
        <Card
          elevation="floating"
          className="aspect-16/10 mx-auto w-full max-w-3xl items-center justify-center overflow-hidden"
        >
          <Typography size="sm" tone="muted">
            Product screenshot — to be added
          </Typography>
        </Card>
      }
    />
  </FadeIn>
);
