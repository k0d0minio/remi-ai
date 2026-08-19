import NextLink from "next/link";
import { Typography } from "@remi/ui/server";

export type Anchor = {
  id: string;
  label: string;
};

type Props = {
  anchors: readonly Anchor[];
};

/**
 * In-page jumps for a document that is one long scroll. The dossier used to be
 * seven routes; a reader preparing for a call does not want to navigate, but
 * they do want to get back to the decisions without hunting, and a row of
 * anchors costs a line to give them that.
 */
export const PageNav = ({ anchors }: Props) => (
  <nav aria-label="Sections du dossier" className="flex flex-wrap gap-2">
    {anchors.map((anchor) => (
      <NextLink
        key={anchor.id}
        href={`#${anchor.id}`}
        className="border-border hover:bg-accent hover:text-foreground focus-visible:ring-ring/40 rounded-full border px-3 py-1 transition-colors duration-[--duration-fast] focus-visible:outline-none focus-visible:ring-[3px]"
      >
        <Typography as="span" size="xs" tone="muted">
          {anchor.label}
        </Typography>
      </NextLink>
    ))}
  </nav>
);
