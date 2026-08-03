import { Container, Section, Typography } from "@remi/ui/server";
import { ContactForm } from "@/components/contact-form";
import { buildMetadata } from "@/lib/metadata";

export const metadata = buildMetadata({
  title: "Contact",
  description:
    "Questions about REMI, practitioner partnerships, or getting early access — send us a message.",
  path: "/contact",
});

const Page = () => (
  <Section spacing="lg">
    <Container size="narrow" className="flex flex-col gap-10">
      <div className="flex flex-col gap-4">
        <Typography variant="eyebrow" tone="muted">
          Contact
        </Typography>
        <Typography as="h1" variant="display" size="5xl" balance>
          Tell us what you need
        </Typography>
        <Typography variant="lead" size="lg">
          Questions about the product, clinical partnerships, or early access.
          Please do not send anything about your own health here — this is not a
          clinical channel and we cannot advise on it.
        </Typography>
      </div>

      <ContactForm />
    </Container>
  </Section>
);

export default Page;
