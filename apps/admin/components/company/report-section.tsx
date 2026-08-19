import type { ReactNode } from "react";
import { Typography } from "@remi/ui/server";
import { Prose } from "@/components/company/prose";

type Props = {
  title: string;
  /** Anchor target, so the page nav can jump here. */
  id?: string;
  /** Read paragraphs, set at prose measure. */
  body?: readonly string[];
  children?: ReactNode;
};

/**
 * A titled run of the document. The dossier is a stack of these, so the heading
 * level and the gap between a section's title and its body are decided once
 * rather than section by section.
 *
 * `scroll-mt` keeps an anchored heading clear of the fixed header when the page
 * nav jumps to it.
 */
export const ReportSection = ({ title, id, body, children }: Props) => (
  <section id={id} className="flex scroll-mt-24 flex-col gap-4">
    <Typography as="h2" size="lg" weight="semibold">
      {title}
    </Typography>
    {body ? <Prose body={body} /> : null}
    {children}
  </section>
);
