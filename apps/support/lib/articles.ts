import { localePath, type Locale } from "@remi/services/shared";
import { getContent } from "@/lib/content";
import type { Article, ArticleBlock, Category } from "@/lib/content/types";

/**
 * Reading the article dictionaries. Every route goes through here rather than
 * indexing into the content module directly, so the relationships between a
 * category and its articles are stated once — an article's `category` is the
 * only link between the two, and nothing else is allowed to imply an order.
 *
 * The slugs are identical in both locales (see `Article["slug"]`), so a lookup
 * that succeeds in English succeeds in French: the locale switcher can swap the
 * prefix mid-article without landing anyone on a 404.
 */

export const findCategory = (
  locale: Locale,
  slug: string,
): Category | undefined =>
  getContent(locale).categories.find((category) => category.slug === slug);

/** A category's articles, in the order the dictionary lists them. */
export const listArticles = (locale: Locale, category: string): Article[] =>
  getContent(locale).articles.filter(
    (article) => article.category === category,
  );

export const findArticle = (
  locale: Locale,
  category: string,
  slug: string,
): Article | undefined =>
  getContent(locale).articles.find(
    (article) => article.category === category && article.slug === slug,
  );

/**
 * By slug alone — what the home page's shortlist and an article's `related`
 * list have to work from, since neither carries a category. An unknown slug
 * answers `undefined` and the caller drops the row rather than rendering a
 * link to nothing.
 */
export const findArticleBySlug = (
  locale: Locale,
  slug: string,
): Article | undefined =>
  getContent(locale).articles.find((article) => article.slug === slug);

export const categoryHref = (locale: Locale, category: string) =>
  localePath(locale, `/${category}`);

export const articleHref = (locale: Locale, article: Article) =>
  localePath(locale, `/${article.category}/${article.slug}`);

/**
 * The previous and next article inside the same category. Neighbours stop at
 * the category boundary on purpose: "next" landing in a different subject is
 * a worse answer than no link at all.
 */
export const articleNeighbours = (locale: Locale, article: Article) => {
  const siblings = listArticles(locale, article.category);
  const index = siblings.findIndex((sibling) => sibling.slug === article.slug);

  return {
    previous: index > 0 ? siblings[index - 1] : null,
    next: index < siblings.length - 1 ? siblings[index + 1] : null,
  };
};

/** The headings the table of contents is built from, in document order. */
export const articleHeadings = (article: Article) =>
  article.blocks.filter(
    (block): block is Extract<ArticleBlock, { kind: "heading" }> =>
      block.kind === "heading",
  );

/**
 * Below this, a contents list is longer than the scroll it saves. Three is the
 * point at which an article stops being readable in one go on a phone.
 */
const TOC_THRESHOLD = 3;

export const hasTableOfContents = (article: Article) =>
  articleHeadings(article).length >= TOC_THRESHOLD;

/** Words a minute. The conventional figure for prose read on a screen. */
const READING_SPEED = 200;

const blockWords = (block: ArticleBlock): number => {
  const count = (text: string) => text.trim().split(/\s+/).length;

  switch (block.kind) {
    case "heading":
      return count(block.text);
    case "paragraph":
      return count(block.text);
    case "list":
      return block.items.reduce((total, item) => total + count(item), 0);
    case "steps":
      return block.items.reduce(
        (total, item) => total + count(item.title) + count(item.body),
        0,
      );
    case "columns":
      return block.columns.reduce(
        (total, column) =>
          total +
          count(column.title) +
          column.items.reduce((sum, item) => sum + count(item), 0),
        0,
      );
    case "note":
      return count(block.title) + count(block.body);
    case "action":
      return count(block.body);
  }
};

/**
 * Derived rather than authored: a hand-written "5 min read" is a number that
 * drifts the first time someone adds a paragraph, and nobody notices.
 */
export const readingMinutes = (article: Article) =>
  Math.max(
    1,
    Math.round(
      article.blocks.reduce((total, block) => total + blockWords(block), 0) /
        READING_SPEED,
    ),
  );
