import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { Button } from "@remi/ui";
import { Badge, Container, Typography } from "@remi/ui/server";
import { HERO } from "@/lib/content/landing";
import { SITE } from "@/lib/site";

/**
 * The headline is in the server HTML: it is the LCP element whether or not
 * JavaScript arrives. The photo is Morgane's (4 November 2026), a person with
 * a phone, cut out on the page's gradient. It is decorative: the headline
 * says what the page says, so `alt` is empty.
 */
export const HeroSection = () => (
  <section
    id="top"
    className="from-primary-subtle/70 bg-linear-to-br via-background to-success-subtle/60 py-10 lg:py-20"
  >
    <Container className="grid items-center gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
      <div className="flex max-w-2xl flex-col items-start gap-5">
        <Badge variant="warning" tone="subtle">
          {HERO.badge}
        </Badge>
        <Typography as="h1" size="4xl" weight="bold" balance className="md:text-5xl">
          <span className="block">{HERO.titleFirst}</span>
          <span className="text-primary block">{HERO.titleSecond}</span>
        </Typography>
        <Typography variant="lead" size="lg">
          {HERO.lead}
        </Typography>
        <Typography
          size="sm"
          className="border-warning bg-warning-subtle rounded-r-lg border-l-4 px-4 py-3"
        >
          {HERO.pilotBefore}
          <strong>{SITE.pilotStartLabel}</strong>
          {HERO.pilotAfter}
        </Typography>
        <div className="flex flex-wrap gap-3">
          <Button asChild size="xl">
            <a href="#inscription">
              {HERO.primary}
              <ArrowRight aria-hidden="true" />
            </a>
          </Button>
          <Button asChild size="xl" variant="outline">
            <a href="#offres">{HERO.secondary}</a>
          </Button>
        </div>
      </div>
      <div className="hidden lg:block">
        <Image
          src="/hero/patiente-pilote.png"
          alt=""
          width={742}
          height={495}
          sizes="(min-width: 1024px) 40vw, 0px"
          priority
          className="mx-auto h-auto w-full max-w-[560px]"
        />
      </div>
    </Container>
  </section>
);
