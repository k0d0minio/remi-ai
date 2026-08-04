import { Typography } from "@remi/ui/server";
import type { ArticleBlock } from "@/lib/content/types";

type Props = {
  label: string;
  headings: Extract<ArticleBlock, { kind: "heading" }>[];
};

/**
 * Plain anchors to the headings already in the page — no scroll spying, no
 * hook, no client bundle. The active-section highlight everyone expects would
 * cost an observer and a hydration boundary on every article, and it tells a
 * reader something they can already see out of the window.
 *
 * Rendered only for articles long enough to need it; the threshold lives with
 * the rest of the article rules in `lib/articles.ts`.
 */
export const TableOfContents = ({ label, headings }: Props) => (
  <nav
    aria-label={label}
    className="border-border bg-muted/40 flex flex-col gap-3 rounded-xl border p-5"
  >
    <Typography variant="eyebrow" tone="muted">
      {label}
    </Typography>

    <ol className="flex flex-col gap-2.5">
      {headings.map((heading) => (
        <li key={heading.id}>
          <a
            href={`#${heading.id}`}
            className="text-muted-foreground hover:text-foreground focus-visible:ring-ring/40 block rounded-sm text-sm leading-snug transition-colors focus-visible:outline-none focus-visible:ring-[3px]"
          >
            {heading.text}
          </a>
        </li>
      ))}
    </ol>
  </nav>
);
