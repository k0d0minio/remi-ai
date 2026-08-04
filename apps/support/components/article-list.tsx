import { ArrowRight, FileText } from "lucide-react";
import NextLink from "next/link";
import type { Locale } from "@remi/services/shared";
import { Badge, Typography } from "@remi/ui/server";
import { cn } from "@remi/ui/utils";
import { articleHref } from "@/lib/articles";
import type { Article, Category } from "@/lib/content/types";

type Props = {
  locale: Locale;
  articles: Article[];
  /**
   * Supplies each row's category label, looked up by slug so the two cannot
   * drift. Omitted inside a single category, where the badge would say the same
   * thing on every row.
   */
  categories?: Category[];
  className?: string;
};

/**
 * The one way an article is listed on this site — the home page's shortlist, a
 * category's contents, and "read next" at the foot of an article all render
 * this. Rows rather than cards: a help centre is scanned, and equally-weighted
 * cards slow that down.
 *
 * The whole row is the link. A title-only target is a smaller thing to hit on a
 * phone than the summary that convinced someone to tap it.
 */
export const ArticleList = ({
  locale,
  articles,
  categories,
  className,
}: Props) => {
  const labels = new Map((categories ?? []).map((c) => [c.slug, c.title]));

  return (
    <ul
      className={cn(
        "border-border divide-border bg-card divide-y rounded-xl border",
        className,
      )}
    >
      {articles.map((article) => (
        <li key={article.slug}>
          <NextLink
            href={articleHref(locale, article)}
            className="focus-visible:ring-ring/40 hover:bg-muted/40 group flex flex-col gap-3 rounded-xl p-5 transition-colors focus-visible:outline-none focus-visible:ring-[3px] sm:flex-row sm:items-start sm:gap-6"
          >
            <FileText
              aria-hidden="true"
              className="text-muted-foreground mt-0.5 hidden size-4 shrink-0 sm:block"
            />

            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <Typography as="span" weight="medium" className="text-balance">
                {article.title}
              </Typography>
              <Typography as="span" size="sm" tone="muted">
                {article.summary}
              </Typography>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              {labels.has(article.category) ? (
                <Badge variant="neutral" tone="subtle" className="w-fit">
                  {labels.get(article.category)}
                </Badge>
              ) : null}
              <ArrowRight
                aria-hidden="true"
                className="text-muted-foreground hidden size-4 shrink-0 transition-transform group-hover:translate-x-0.5 sm:block"
              />
            </div>
          </NextLink>
        </li>
      ))}
    </ul>
  );
};
