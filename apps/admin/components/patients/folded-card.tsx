import type { ReactNode } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@remi/ui";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@remi/ui/server";

type Props = {
  /** Unique on the page — Radix keys the open item by it. */
  id: string;
  title: string;
  description: string;
  /** The trigger's words: « Afficher le résumé ». */
  openLabel: string;
  children: ReactNode;
};

/**
 * A live section the file keeps closed under the questionnaire (story 6): the
 * living summary and the anamnesis. Its title and its purpose stay in view.
 * The body opens on demand, so the answers stay the first thing read.
 */
export const FoldedCard = ({
  id,
  title,
  description,
  openLabel,
  children,
}: Props) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
      <CardDescription>{description}</CardDescription>
    </CardHeader>
    <CardContent>
      <Accordion type="single" collapsible>
        <AccordionItem value={id} variant="ghost">
          <AccordionTrigger className="text-muted-foreground py-2 text-sm font-normal">
            {openLabel}
          </AccordionTrigger>
          <AccordionContent className="pt-1">{children}</AccordionContent>
        </AccordionItem>
      </Accordion>
    </CardContent>
  </Card>
);
