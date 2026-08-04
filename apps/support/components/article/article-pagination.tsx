import { ArrowLeft, ArrowRight } from "lucide-react";
import NextLink from "next/link";
import type { Locale } from "@remi/services/shared";
import { Typography } from "@remi/ui/server";
import { articleHref } from "@/lib/articles";
import type { Article, Content } from "@/lib/content/types";

type Props = {
  locale: Locale;
  previous: Article | null;
  next: Article | null;
  content: Content["article"];
};

/**
 * The two neighbours inside the same category. Both sides are rendered even
 * when one is missing, so the "next" card keeps its place at the end of a
 * category instead of sliding under the previous one.
 */
export const ArticlePagination = ({
  locale,
  previous,
  next,
  content,
}: Props) => (
  <nav className="grid gap-4 sm:grid-cols-2">
    {previous ? (
      <NextLink
        href={articleHref(locale, previous)}
        className="border-border hover:bg-muted/40 focus-visible:ring-ring/40 flex flex-col gap-1.5 rounded-xl border p-5 transition-colors focus-visible:outline-none focus-visible:ring-[3px]"
      >
        <span className="text-muted-foreground flex items-center gap-1.5">
          <ArrowLeft aria-hidden="true" className="size-3.5" />
          <Typography as="span" variant="eyebrow">
            {content.prevLabel}
          </Typography>
        </span>
        <Typography as="span" size="sm" weight="medium">
          {previous.title}
        </Typography>
      </NextLink>
    ) : (
      <div aria-hidden="true" />
    )}

    {next ? (
      <NextLink
        href={articleHref(locale, next)}
        className="border-border hover:bg-muted/40 focus-visible:ring-ring/40 flex flex-col items-end gap-1.5 rounded-xl border p-5 text-right transition-colors focus-visible:outline-none focus-visible:ring-[3px]"
      >
        <span className="text-muted-foreground flex items-center gap-1.5">
          <Typography as="span" variant="eyebrow">
            {content.nextLabel}
          </Typography>
          <ArrowRight aria-hidden="true" className="size-3.5" />
        </span>
        <Typography as="span" size="sm" weight="medium">
          {next.title}
        </Typography>
      </NextLink>
    ) : null}
  </nav>
);
