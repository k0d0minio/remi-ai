import { Check } from "lucide-react";
import {
  Card,
  Container,
  Section,
  Separator,
  Typography,
} from "@remi/ui/server";
import type { PartnershipContent } from "@/lib/content/types";

type Props = {
  content: PartnershipContent;
  tone?: "muted";
};

/**
 * The one section that names a third party. Everything in it — the signed
 * partnership, the co-design, the pilot with FunMedDev patients — was
 * confirmed by the founders before this copy was written; the quote comes from
 * REMI's own published interview with Dr Mouton.
 */
export const PartnershipSection = ({ content, tone }: Props) => (
  <Section tone={tone} spacing="lg">
    <Container className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
      <div className="flex flex-col gap-4">
        <Typography variant="eyebrow" tone="muted">
          {content.eyebrow}
        </Typography>
        <Typography as="h2" variant="display" size="4xl" balance>
          {content.title}
        </Typography>
        <Typography variant="lead" size="lg">
          {content.body}
        </Typography>
        <ul className="mt-2 flex flex-col gap-3">
          {content.points.map((point) => (
            <li key={point} className="flex items-start gap-3">
              <Check
                aria-hidden="true"
                className="text-success-text mt-1 size-4 shrink-0"
              />
              <Typography as="span" size="sm" tone="muted">
                {point}
              </Typography>
            </li>
          ))}
        </ul>
      </div>

      <Card elevation="flat" className="border-border gap-6 p-8">
        <Typography
          as="blockquote"
          variant="display"
          size="2xl"
          balance
          className="italic"
        >
          “{content.quote}”
        </Typography>
        <Separator tone="subtle" />
        <div className="flex flex-col gap-1">
          <Typography as="span" weight="semibold">
            {content.quoteAuthor}
          </Typography>
          <Typography as="span" size="sm" tone="muted">
            {content.quoteRole}
          </Typography>
        </div>
      </Card>
    </Container>
  </Section>
);
