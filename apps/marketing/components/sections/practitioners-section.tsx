import { Container, Typography } from "@remi/ui/server";
import { PractitionerDialog } from "@/components/practitioner-dialog";
import { PRACTITIONERS } from "@/lib/content/landing";

/** The secondary audience, on ink: the practitioners' waiting list. */
export const PractitionersSection = () => (
  <section id="praticiens" className="bg-foreground text-background py-12 md:py-16">
    <Container className="flex flex-col items-start gap-4 [&>*]:max-w-3xl">
      <Typography variant="eyebrow" className="text-success">
        {PRACTITIONERS.eyebrow}
      </Typography>
      <Typography as="h2" size="3xl" weight="bold" balance>
        {PRACTITIONERS.title}
      </Typography>
      <Typography size="lg" className="text-background/80">
        {PRACTITIONERS.lead}
      </Typography>
      <Typography weight="semibold">{PRACTITIONERS.sub}</Typography>
      <PractitionerDialog />
    </Container>
  </section>
);
