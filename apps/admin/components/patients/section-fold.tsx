import type { ReactNode } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@remi/ui";
import { cn } from "@remi/ui/utils";

type Props = {
  /** Unique on the page — Radix keys the open item by it. */
  id: string;
  /** What is inside, in her words: « Recommandations archivées ». */
  label: string;
  /** Shown beside the label. Omitted where there is nothing to count. */
  count?: number;
  /** `error` for the delete flow; everything else reads as a quiet aside. */
  tone?: "muted" | "error";
  children: ReactNode;
};

/**
 * The one way this page shows what is no longer live — archived rows, and the
 * delete flow at the foot of the profile.
 *
 * Closed by default with the count on the trigger (R16): the page's shape then
 * stops changing from patient to patient, and nothing is hidden without saying
 * how much. The fold wraps the section's existing list component; it never
 * forks it, so an archived row renders exactly as its active twin does.
 */
export const SectionFold = ({
  id,
  label,
  count,
  tone = "muted",
  children,
}: Props) => (
  <Accordion type="single" collapsible className="border-border border-t pt-2">
    <AccordionItem value={id} variant="ghost">
      <AccordionTrigger
        className={cn(
          "py-2 text-sm font-normal",
          tone === "error" ? "text-error-text" : "text-muted-foreground",
        )}
      >
        {count === undefined ? label : `${label} · ${count}`}
      </AccordionTrigger>
      <AccordionContent className="pt-1">{children}</AccordionContent>
    </AccordionItem>
  </Accordion>
);
