import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@remi/ui";
import type { FaqItem } from "@/lib/content/landing";

/**
 * One question open at a time: on a page this long, an FAQ with every answer
 * open pushes the sign-up off the bottom of the document.
 */
export const Faq = ({ items }: { items: readonly FaqItem[] }) => (
  <Accordion type="single" collapsible>
    {items.map((item) => (
      <AccordionItem key={item.q} value={item.q}>
        <AccordionTrigger>{item.q}</AccordionTrigger>
        <AccordionContent>{item.a}</AccordionContent>
      </AccordionItem>
    ))}
  </Accordion>
);
