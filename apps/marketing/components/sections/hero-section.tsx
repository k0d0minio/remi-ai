import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { Button } from "@remi/ui";
import { Badge, Container, Typography } from "@remi/ui/server";
import { HERO } from "@/lib/content/landing";

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
        <Typography
          as="h1"
          size="4xl"
          weight="bold"
          balance
          className="md:text-5xl"
        >
          {HERO.title}
        </Typography>
        <Typography size="xl" weight="medium" className="text-primary">
          {HERO.subtitle}
        </Typography>
        <ul className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:gap-x-2">
          {HERO.highlights.map((item, index) => (
            <li key={item} className="flex items-center gap-2">
              {index > 0 && (
                <span
                  aria-hidden="true"
                  className="text-muted-foreground hidden sm:inline"
                >
                  ·
                </span>
              )}
              <Typography as="span" size="base" weight="medium">
                {item}
              </Typography>
            </li>
          ))}
        </ul>
        <Typography size="sm" weight="medium" tone="muted">
          {HERO.pilotInfo.join(" · ")}
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
