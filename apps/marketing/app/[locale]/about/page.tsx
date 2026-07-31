import type { Metadata } from "next";
import { Avatar, AvatarFallback } from "@remi/ui";
import { Card, Container, Section, Typography } from "@remi/ui/server";
import { CtaSection } from "@/components/sections/cta-section";
import { PartnershipSection } from "@/components/sections/partnership-section";
import { StepsSection } from "@/components/sections/steps-section";
import { getContent } from "@/lib/content";
import type { Locale } from "@/lib/i18n";
import { buildMetadata } from "@/lib/metadata";

type Params = { locale: Locale };

export const generateMetadata = async ({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> => {
  const { locale } = await params;
  const { meta } = getContent(locale).about;
  return buildMetadata({ ...meta, path: "/about", locale });
};

const Page = async ({ params }: { params: Promise<Params> }) => {
  const { locale } = await params;
  const content = getContent(locale).about;

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
        </Container>
      </Section>

      <Section tone="muted" spacing="lg">
        <Container className="flex flex-col gap-12">
          <div className="flex max-w-2xl flex-col gap-4">
            <Typography variant="eyebrow" tone="muted">
              {content.team.eyebrow}
            </Typography>
            <Typography as="h2" variant="display" size="4xl" balance>
              {content.team.title}
            </Typography>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {content.team.members.map((member) => (
              <Card
                key={member.name}
                elevation="flat"
                className="border-border h-full gap-5 p-8"
              >
                <div className="flex items-center gap-4">
                  <Avatar className="size-12">
                    <AvatarFallback>{member.initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <Typography as="h3" size="lg" weight="semibold">
                      {member.name}
                    </Typography>
                    <Typography size="sm" tone="muted">
                      {member.role}
                    </Typography>
                  </div>
                </div>
                <Typography tone="muted">{member.bio}</Typography>
                <Typography as="blockquote" className="italic">
                  “{member.quote}”
                </Typography>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      <PartnershipSection content={content.partnership} />

      <StepsSection
        eyebrow={content.principles.eyebrow}
        title={content.principles.title}
        steps={content.principles.items}
        tone="muted"
      />

      <CtaSection content={content.cta} locale={locale} />
    </>
  );
};

export default Page;
