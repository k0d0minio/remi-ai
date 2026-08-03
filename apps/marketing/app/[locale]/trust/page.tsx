import { Ban, Check } from "lucide-react";
import type { Metadata } from "next";
import type { Locale } from "@remi/services/shared";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Card,
  Container,
  Section,
  Typography,
} from "@remi/ui/server";
import { CtaSection } from "@/components/sections/cta-section";
import { FeatureSection } from "@/components/sections/feature-section";
import { StepsSection } from "@/components/sections/steps-section";
import { getContent } from "@/lib/content";
import { buildMetadata } from "@/lib/metadata";

type Params = { locale: Locale };

export const generateMetadata = async ({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> => {
  const { locale } = await params;
  const { meta } = getContent(locale).trust;
  return buildMetadata({ ...meta, path: "/trust", locale });
};

/**
 * The page a Belgian clinic reads before it agrees to a pilot. It is a sales
 * asset, so it answers rather than reassures: what is decided, what is only
 * intent, and what has not been chosen. The closing disclaimer is
 * `footer.disclaimer` itself — the same sentence the footer carries on every
 * page, rendered here rather than reworded, so the two can never drift.
 */
const Page = async ({ params }: { params: Promise<Params> }) => {
  const { locale } = await params;
  const { footer, trust: content } = getContent(locale);

  return (
    <>
      <Section spacing="lg">
        <Container size="narrow" className="flex flex-col gap-6">
          <Typography variant="eyebrow" tone="muted">
            {content.intro.eyebrow}
          </Typography>
          <Typography as="h1" variant="display" size="5xl" balance>
            {content.intro.title}
          </Typography>
          <Typography variant="lead" size="lg">
            {content.intro.lead}
          </Typography>
          <Typography tone="muted">{content.intro.body}</Typography>

          <Alert variant="info" className="mt-2">
            <AlertTitle>{content.status.title}</AlertTitle>
            <AlertDescription>{content.status.body}</AlertDescription>
          </Alert>
        </Container>
      </Section>

      <FeatureSection content={content.commitments} tone="muted" />

      <Section spacing="lg">
        <Container className="flex flex-col gap-12">
          <div className="flex max-w-2xl flex-col gap-4">
            <Typography variant="eyebrow" tone="muted">
              {content.residency.eyebrow}
            </Typography>
            <Typography as="h2" variant="display" size="4xl" balance>
              {content.residency.title}
            </Typography>
            <Typography variant="lead" size="lg">
              {content.residency.lead}
            </Typography>
          </div>

          <Card elevation="flat" className="border-border max-w-3xl gap-5 p-8">
            <ul className="flex flex-col gap-3">
              {content.residency.items.map((item) => (
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

          {/* Named as intent in the copy as well as in the layout — an
              unqualified residency claim is the one a buyer checks first. */}
          <Alert variant="warning" className="max-w-3xl">
            <AlertDescription>{content.residency.note}</AlertDescription>
          </Alert>
        </Container>
      </Section>

      <StepsSection
        eyebrow={content.frame.eyebrow}
        title={content.frame.title}
        lead={content.frame.lead}
        steps={content.frame.items}
        tone="muted"
      />

      <Section spacing="lg">
        <Container className="flex flex-col gap-12">
          <div className="flex max-w-2xl flex-col gap-4">
            <Typography variant="eyebrow" tone="muted">
              {content.never.eyebrow}
            </Typography>
            <Typography as="h2" variant="display" size="4xl" balance>
              {content.never.title}
            </Typography>
            <Typography variant="lead" size="lg">
              {content.never.lead}
            </Typography>
          </div>

          <ul className="grid gap-6 md:grid-cols-2">
            {content.never.items.map((item) => (
              <li key={item} className="h-full">
                <Card elevation="flat" className="border-border h-full p-6">
                  <div className="flex items-start gap-4">
                    <Ban
                      aria-hidden="true"
                      className="text-error-text mt-0.5 size-4 shrink-0"
                    />
                    <Typography size="sm">{item}</Typography>
                  </div>
                </Card>
              </li>
            ))}
          </ul>

          <Alert className="max-w-3xl">
            <AlertDescription>{footer.disclaimer}</AlertDescription>
          </Alert>
        </Container>
      </Section>

      <Section tone="muted" spacing="lg">
        <Container className="flex flex-col gap-12">
          <div className="flex max-w-2xl flex-col gap-4">
            <Typography variant="eyebrow" tone="muted">
              {content.questions.eyebrow}
            </Typography>
            <Typography as="h2" variant="display" size="4xl" balance>
              {content.questions.title}
            </Typography>
            <Typography variant="lead" size="lg">
              {content.questions.lead}
            </Typography>
          </div>

          <ul className="grid gap-6 md:grid-cols-2">
            {content.questions.items.map((question) => (
              <li key={question} className="h-full">
                <Card elevation="flat" className="border-border h-full p-6">
                  <Typography as="p" weight="medium" balance>
                    {question}
                  </Typography>
                </Card>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <CtaSection content={content.cta} locale={locale} />
    </>
  );
};

export default Page;
