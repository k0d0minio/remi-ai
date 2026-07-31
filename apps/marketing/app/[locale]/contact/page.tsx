import type { Metadata } from "next";
import { Card, Container, Link, Section, Typography } from "@remi/ui/server";
import { ContactForm } from "@/components/contact-form";
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
  const { meta } = getContent(locale).contact;
  return buildMetadata({ ...meta, path: "/contact", locale });
};

const Page = async ({ params }: { params: Promise<Params> }) => {
  const { locale } = await params;
  const content = getContent(locale).contact;

  return (
    <Section spacing="lg">
      <Container size="narrow" className="flex flex-col gap-10">
        <div className="flex flex-col gap-4">
          <Typography variant="eyebrow" tone="muted">
            {content.eyebrow}
          </Typography>
          <Typography as="h1" variant="display" size="5xl" balance>
            {content.title}
          </Typography>
          <Typography variant="lead" size="lg">
            {content.lead}
          </Typography>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {content.people.map((person) => (
            <Card
              key={person.email}
              elevation="flat"
              className="border-border gap-2 p-6"
            >
              <Typography as="h2" size="lg" weight="semibold">
                {person.name}
              </Typography>
              <Typography size="sm" tone="muted">
                {person.role}
              </Typography>
              <div className="mt-2 flex flex-col gap-1">
                <Link href={`mailto:${person.email}`} className="text-sm">
                  {person.email}
                </Link>
                <Link href={`tel:${person.phone.replace(/\s/g, "")}`} className="text-sm">
                  {person.phone}
                </Link>
              </div>
            </Card>
          ))}
        </div>

        <ContactForm locale={locale} labels={content.form} />
      </Container>
    </Section>
  );
};

export default Page;
