import type { Locale } from "@remi/services/shared";
import { Container, Section, Typography } from "@remi/ui/server";
import { ArticleList } from "@/components/article-list";
import { findArticleBySlug } from "@/lib/articles";
import type { Category, Content } from "@/lib/content/types";

type Props = {
  content: Content["home"]["popular"];
  /** Supplies each row's category label, looked up by slug so the two cannot drift. */
  categories: Category[];
  locale: Locale;
};

/**
 * The shortlist a help centre opens with. The dictionary holds slugs rather
 * than titles: a shortlist that repeated the titles would be a second place for
 * an article's name to live, and the two would disagree the first time one was
 * reworded.
 *
 * The note stays. This is the order the help centre was written in, not a
 * ranking — nothing here is measured, and a list headed "popular" that has
 * never been counted is the kind of small untruth this product does not tell.
 */
export const PopularArticles = ({ content, categories, locale }: Props) => {
  const articles = content.slugs
    .map((slug) => findArticleBySlug(locale, slug))
    .filter((article) => article !== undefined);

  return (
    <Section spacing="lg" tone="muted">
      <Container size="narrow" className="flex flex-col gap-8">
        <div className="flex flex-col gap-4">
          <Typography variant="eyebrow" tone="muted">
            {content.eyebrow}
          </Typography>
          <Typography as="h2" variant="display" size="4xl" balance>
            {content.title}
          </Typography>
        </div>

        <ArticleList
          locale={locale}
          articles={articles}
          categories={categories}
        />

        <Typography size="sm" tone="muted">
          {content.note}
        </Typography>
      </Container>
    </Section>
  );
};
