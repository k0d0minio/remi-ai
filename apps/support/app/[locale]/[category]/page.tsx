import { ArrowLeft, ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import NextLink from "next/link";
import { notFound } from "next/navigation";
import { localePath, type Locale } from "@remi/services/shared";
import { Container, Link, Section, Typography } from "@remi/ui/server";
import { ArticleList } from "@/components/article-list";
import { en } from "@/lib/content/en";
import { findCategory, listArticles } from "@/lib/articles";
import { getContent } from "@/lib/content";
import { externalHref } from "@/lib/links";
import { buildMetadata } from "@/lib/metadata";

type Params = { locale: Locale; category: string };

/**
 * The slugs are the same in both languages, so one dictionary answers for both.
 * `[locale]/layout.tsx` supplies the locale half of each param pair.
 */
export const generateStaticParams = () =>
  en.categories.map((category) => ({ category: category.slug }));

export const dynamicParams = false;

export const generateMetadata = async ({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> => {
  const { locale, category: slug } = await params;
  const category = findCategory(locale, slug);

  if (!category) {
    return {};
  }

  return buildMetadata({
    title: category.title,
    /* The card's own line, rather than a second description that can drift
       from it — they answer the same question in the same number of words. */
    description: category.body,
    path: `/${category.slug}`,
    locale,
  });
};

/**
 * One category, and everything written in it. There is no partial state here:
 * a category exists in the dictionary or it does not exist at all, so an
 * unknown segment is a 404 rather than an empty page with a heading on it.
 */
const Page = async ({ params }: { params: Promise<Params> }) => {
  const { locale, category: slug } = await params;
  const category = findCategory(locale, slug);

  if (!category) {
    notFound();
  }

  const content = getContent(locale);
  const articles = listArticles(locale, category.slug);
  const Icon = category.icon;

  return (
    <>
      <Section spacing="md" tone="subtle">
        <Container size="narrow" className="flex flex-col gap-5">
          <Link
            as={NextLink}
            href={localePath(locale, "/")}
            variant="muted"
            className="flex w-fit items-center gap-1.5 text-sm"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
            {content.category.backLabel}
          </Link>

          <div className="flex items-center gap-3">
            <Icon aria-hidden="true" className="text-primary size-6" />
            <Typography variant="eyebrow" tone="muted">
              {content.category.eyebrow}
            </Typography>
          </div>

          <Typography as="h1" variant="display" size="5xl" balance>
            {category.title}
          </Typography>

          <Typography variant="lead" size="lg">
            {category.body}
          </Typography>

          <Typography size="sm" tone="muted">
            {articles.length}{" "}
            {articles.length === 1
              ? content.category.countLabel.one
              : content.category.countLabel.many}
          </Typography>
        </Container>
      </Section>

      <Section spacing="md">
        <Container size="narrow" className="flex flex-col gap-10">
          <ArticleList locale={locale} articles={articles} />

          <div className="border-border flex flex-col items-start gap-3 rounded-xl border border-dashed p-6">
            <Typography as="h2" weight="semibold">
              {content.category.missing.title}
            </Typography>
            <Typography size="sm" tone="muted" className="leading-relaxed">
              {content.category.missing.body}
            </Typography>
            <Link
              href={externalHref(locale, content.category.missing.action)}
              variant="standalone"
              className="text-sm"
            >
              {content.category.missing.action.label}
              <ArrowUpRight aria-hidden="true" />
            </Link>
          </div>
        </Container>
      </Section>
    </>
  );
};

export default Page;
