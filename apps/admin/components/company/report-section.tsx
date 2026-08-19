import type { ReactNode } from "react";
import { Typography } from "@remi/ui/server";
import { Prose } from "@/components/company/prose";

type Props = {
  title: string;
  /** Read paragraphs, set at prose measure. */
  body?: readonly string[];
  children?: ReactNode;
};

/**
 * A titled run of the document. Every dossier page is a stack of these, so the
 * heading level and the gap between a section's title and its body are decided
 * once rather than page by page.
 */
export const ReportSection = ({ title, body, children }: Props) => (
  <section className="flex flex-col gap-3">
    <Typography as="h2" size="lg" weight="semibold">
      {title}
    </Typography>
    {body ? <Prose body={body} /> : null}
    {children}
  </section>
);
