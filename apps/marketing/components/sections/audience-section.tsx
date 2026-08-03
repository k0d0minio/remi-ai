import { ArrowRight, Check } from "lucide-react";
import NextLink from "next/link";
import { localePath, type Locale } from "@remi/services/shared";
import { Button } from "@remi/ui";
import { Card, Container, Section, Typography } from "@remi/ui/server";
import type { Content } from "@/lib/content/types";

type Props = {
  content: Content["home"]["audience"];
  locale: Locale;
};

/**
 * The fork in the road: one product, two readers. Two equal cards rather than
 * a primary one and an afterthought — the deliberate positioning is that
 * neither audience is secondary.
 */
export const AudienceSection = ({ content, locale }: Props) => (
  <Section spacing="lg">
    <Container className="flex flex-col gap-12">
      <div className="flex max-w-2xl flex-col gap-4">
        <Typography variant="eyebrow" tone="muted">
          {content.eyebrow}
        </Typography>
        <Typography as="h2" variant="display" size="4xl" balance>
          {content.title}
        </Typography>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {content.cards.map((card) => (
          <Card
            key={card.href}
            elevation="flat"
            className="border-border h-full gap-6 p-8"
          >
            <div className="flex flex-col gap-3">
              <Typography as="h3" size="2xl" weight="semibold" balance>
                {card.title}
              </Typography>
              <Typography tone="muted">{card.body}</Typography>
            </div>

            <ul className="flex flex-col gap-3">
              {card.bullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-3">
                  <Check
                    aria-hidden="true"
                    className="text-success-text mt-1 size-4 shrink-0"
                  />
                  <Typography as="span" size="sm" tone="muted">
                    {bullet}
                  </Typography>
                </li>
              ))}
            </ul>

            <div className="mt-auto">
              <Button asChild variant="outline">
                <NextLink href={localePath(locale, card.href)}>
                  {card.cta}
                  <ArrowRight aria-hidden="true" />
                </NextLink>
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </Container>
  </Section>
);
