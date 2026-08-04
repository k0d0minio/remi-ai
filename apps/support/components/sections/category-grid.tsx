import { ArrowRight } from "lucide-react";
import NextLink from "next/link";
import type { Locale } from "@remi/services/shared";
import {
  Card,
  Container,
  IconTile,
  Link,
  Section,
  Typography,
} from "@remi/ui/server";
import { articleHref, categoryHref, listArticles } from "@/lib/articles";
import type { Category, Content } from "@/lib/content/types";

type Props = {
  content: Content["home"]["categories"];
  categories: Category[];
  locale: Locale;
};

/**
 * The five doors. Each card names what it covers and lists the articles behind
 * it — a category with a title and nothing else tells a stuck person nothing
 * about whether to open it.
 *
 * The card is not one big link: its title and each article are separate links,
 * because nesting an anchor inside an anchor is invalid, and because a reader
 * who already knows which answer they want should not have to go through the
 * category page to reach it.
 */
export const CategoryGrid = ({ content, categories, locale }: Props) => (
  <Section spacing="lg">
    <Container className="flex flex-col gap-10">
      <div className="flex max-w-2xl flex-col gap-4">
        <Typography variant="eyebrow" tone="muted">
          {content.eyebrow}
        </Typography>
        <Typography as="h2" variant="display" size="4xl" balance>
          {content.title}
        </Typography>
        <Typography variant="lead">{content.lead}</Typography>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => {
          const Icon = category.icon;
          const articles = listArticles(locale, category.slug);

          return (
            <Card
              key={category.slug}
              elevation="flat"
              interactive
              className="border-border h-full gap-4"
            >
              <div className="flex flex-col gap-4 px-6">
                <IconTile>
                  <Icon />
                </IconTile>

                <Typography as="h3" size="lg" weight="semibold">
                  <Link
                    as={NextLink}
                    href={categoryHref(locale, category.slug)}
                  >
                    {category.title}
                  </Link>
                </Typography>

                <Typography size="sm" tone="muted">
                  {category.body}
                </Typography>
              </div>

              <ul className="flex flex-col gap-2 px-6">
                {articles.map((article) => (
                  <li key={article.slug} className="flex items-start gap-2.5">
                    <span
                      aria-hidden="true"
                      className="bg-primary/40 mt-2 size-1.5 shrink-0 rounded-full"
                    />
                    <Link
                      as={NextLink}
                      href={articleHref(locale, article)}
                      variant="muted"
                      className="text-sm"
                    >
                      {article.title}
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="mt-auto px-6">
                <Link
                  as={NextLink}
                  href={categoryHref(locale, category.slug)}
                  variant="standalone"
                  className="text-sm"
                >
                  {articles.length}{" "}
                  {articles.length === 1
                    ? content.countLabel.one
                    : content.countLabel.many}
                  <ArrowRight aria-hidden="true" />
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </Container>
  </Section>
);
