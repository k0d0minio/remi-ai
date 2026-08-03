import { ArrowRight, Check } from "lucide-react";
import NextLink from "next/link";
import { localePath, type Locale } from "@remi/services/shared";
import { Button } from "@remi/ui";
import {
  Alert,
  AlertDescription,
  Card,
  Container,
  Section,
  Typography,
} from "@remi/ui/server";
import type { Content } from "@/lib/content/types";

type Props = {
  content: Content["practitioners"]["pilot"];
  locale: Locale;
};

/**
 * The pilot programme, sold without a price: pricing is genuinely undecided,
 * and the `pricingNote` says so out loud instead of hiding the section.
 */
export const PilotSection = ({ content, locale }: Props) => (
  <Section id="pilot" tone="muted" spacing="lg">
    <Container className="flex flex-col gap-12">
      <div className="flex max-w-2xl flex-col gap-4">
        <Typography variant="eyebrow" tone="muted">
          {content.eyebrow}
        </Typography>
        <Typography as="h2" variant="display" size="4xl" balance>
          {content.title}
        </Typography>
        <Typography variant="lead" size="lg">
          {content.body}
        </Typography>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {[
          { title: content.includedTitle, items: content.included },
          { title: content.conditionsTitle, items: content.conditions },
        ].map((column) => (
          <Card
            key={column.title}
            elevation="flat"
            className="border-border h-full gap-5 p-8"
          >
            <Typography as="h3" size="lg" weight="semibold">
              {column.title}
            </Typography>
            <ul className="flex flex-col gap-3">
              {column.items.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <Check
                    aria-hidden="true"
                    className="text-success-text mt-1 size-4 shrink-0"
                  />
                  <Typography as="span" size="sm" tone="muted">
                    {item}
                  </Typography>
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>

      <Alert variant="info" className="max-w-3xl">
        <AlertDescription>{content.pricingNote}</AlertDescription>
      </Alert>

      <div>
        <Button asChild size="xl">
          <NextLink href={localePath(locale, content.action.href)}>
            {content.action.label}
            <ArrowRight aria-hidden="true" />
          </NextLink>
        </Button>
      </div>
    </Container>
  </Section>
);
