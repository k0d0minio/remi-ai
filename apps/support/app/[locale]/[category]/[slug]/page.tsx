import { ArrowLeft, CalendarCheck, Clock } from "lucide-react";
import type { Metadata } from "next";
import NextLink from "next/link";
import { notFound } from "next/navigation";
import { formatDate, localePath, type Locale } from "@remi/services/shared";
import {
  Container,
  Link,
  Section,
  Separator,
  Typography,
} from "@remi/ui/server";
import { ArticleBody } from "@/components/article/article-body";
import { ArticlePagination } from "@/components/article/article-pagination";
import { ArticleList } from "@/components/article-list";
import { HelpfulRow } from "@/components/article/helpful-row";
import { TableOfContents } from "@/components/article/table-of-contents";
import { en } from "@/lib/content/en";
import {
  articleHeadings,
  articleNeighbours,
  findArticle,
  findArticleBySlug,
  findCategory,
  hasTableOfContents,
  readingMinutes,
} from "@/lib/articles";
import { getContent } from "@/lib/content";
import { buildMetadata } from "@/lib/metadata";

type Params = { locale: Locale; category: string; slug: string };

/** Article slugs are identical across locales, so one dictionary answers for both. */
export const generateStaticParams = () =>
  en.articles.map((article) => ({
    category: article.category,
    slug: article.slug,
  }));

export const dynamicParams = false;

export const generateMetadata = async ({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> => {
  const { locale, category, slug } = await params;
  const article = findArticle(locale, category, slug);

  if (!article) {
    return {};
  }

  return buildMetadata({
    title: article.title,
    description: article.summary,
    path: `/${article.category}/${article.slug}`,
    locale,
  });
};

/**
 * One answer, and the shortest route out of it: back to its category, on to its
 * neighbour, or to a person if it did not help.
 *
 * `updated` is rendered as the day the article was last checked against the
 * product rather than the day the file changed. In a pre-launch help centre
 * that distinction is the whole value of the date — an article can be edited
 * without being re-verified, and only one of the two is worth a reader's trust.
 */
const Page = async ({ params }: { params: Promise<Params> }) => {
  const { locale, category: categorySlug, slug } = await params;
  const article = findArticle(locale, categorySlug, slug);
  const category = findCategory(locale, categorySlug);

  if (!article || !category) {
    notFound();
  }

  const content = getContent(locale);
  const { previous, next } = articleNeighbours(locale, article);
  const showToc = hasTableOfContents(article);
  const related = (article.related ?? [])
    .map((relatedSlug) => findArticleBySlug(locale, relatedSlug))
    .filter((found) => found !== undefined);

  return (
    <>
      <Section spacing="sm" tone="subtle">
        <Container size="content" className="flex flex-col gap-5">
          <Link
            as={NextLink}
            href={localePath(locale, `/${category.slug}`)}
            variant="muted"
            className="flex w-fit items-center gap-1.5 text-sm"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            {content.article.backLabel} {category.title}
          </Link>

          <Typography
            as="h1"
            variant="display"
            size="5xl"
            balance
            className="max-w-3xl"
          >
            {article.title}
          </Typography>

          <Typography variant="lead" size="lg" className="max-w-2xl">
            {article.summary}
          </Typography>

          <div className="text-muted-foreground flex flex-wrap items-center gap-x-6 gap-y-2">
            <span className="flex items-center gap-2">
              <CalendarCheck aria-hidden="true" className="size-4" />
              <time dateTime={article.updated}>
                <Typography as="span" size="sm" tone="muted">
                  {content.article.updatedLabel}{" "}
                  {formatDate(article.updated, locale)}
                </Typography>
              </time>
            </span>

            <span className="flex items-center gap-2">
              <Clock aria-hidden="true" className="size-4" />
              <Typography as="span" size="sm" tone="muted">
                {readingMinutes(article)} {content.article.minutesLabel}
              </Typography>
            </span>
          </div>
        </Container>
      </Section>

      <Section spacing="md">
        <Container
          size="content"
          className="flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-12"
        >
          {showToc ? (
            <div className="lg:sticky lg:top-24 lg:order-2 lg:w-60 lg:shrink-0">
              <TableOfContents
                label={content.article.tocLabel}
                headings={articleHeadings(article)}
              />
            </div>
          ) : null}

          <div className="flex min-w-0 max-w-2xl flex-col gap-10 lg:order-1 lg:flex-1">
            <ArticleBody blocks={article.blocks} locale={locale} />

            <Separator tone="subtle" />

            <HelpfulRow locale={locale} content={content.article.helpful} />

            {related.length > 0 ? (
              <div className="flex flex-col gap-4">
                <Typography variant="eyebrow" tone="muted">
                  {content.article.relatedLabel}
                </Typography>
                <ArticleList
                  locale={locale}
                  articles={related}
                  categories={content.categories}
                />
              </div>
            ) : null}

            <ArticlePagination
              locale={locale}
              previous={previous}
              next={next}
              content={content.article}
            />
          </div>
        </Container>
      </Section>
    </>
  );
};

export default Page;
