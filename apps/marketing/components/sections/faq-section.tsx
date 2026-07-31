import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@remi/ui";
import { Container, Section, Typography } from "@remi/ui/server";
import { faqs } from "@/lib/content/landing";

/**
 * `type="single" collapsible` rather than `multiple`: on a page this long, an
 * FAQ where every answer can be open at once pushes the closing call to action
 * off the bottom of the document.
 */
export const FaqSection = () => (
  <Section id="faq" spacing="lg">
    <Container size="narrow" className="flex flex-col gap-10">
      <div className="flex flex-col gap-4">
        <Typography variant="eyebrow" tone="muted">
          FAQ
        </Typography>
        <Typography as="h2" variant="display" size="4xl" balance>
          The questions worth answering first
        </Typography>
      </div>

      <Accordion type="single" collapsible>
        {faqs.map((faq) => (
          <AccordionItem key={faq.id} value={faq.id}>
            <AccordionTrigger>{faq.question}</AccordionTrigger>
            <AccordionContent>{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Container>
  </Section>
);
