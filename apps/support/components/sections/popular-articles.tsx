import { FileText } from "lucide-react";
import { Badge, Container, Section, Typography } from "@remi/ui/server";
import type { Category, Content } from "@/lib/content/types";

type Props = {
  content: Content["home"]["popular"];
  /** Supplies each row's category label, looked up by slug so the two cannot drift. */
  categories: Category[];
};

/**
 * The shortlist a help centre opens with. Rows rather than cards: this is a
 * list to scan, and five equally-weighted cards would slow that down.
 *
 * Like the category grid, nothing links yet — these articles are not written.
 * The note says so in the visitor's own language, because a list headed
 * "popular" that has never been measured is the kind of small untruth this
 * product does not tell.
 */
export const PopularArticles = ({ content, categories }: Props) => {
  const labels = new Map(categories.map((c) => [c.slug, c.title]));

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

        <ul className="border-border divide-border bg-card divide-y rounded-xl border">
          {content.items.map((article) => (
            <li
              key={article.slug}
              className="flex flex-col gap-2 p-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
            >
              <div className="flex items-start gap-3">
                <FileText
                  aria-hidden="true"
                  className="text-muted-foreground mt-0.5 size-4 shrink-0"
                />
                <Typography as="span" weight="medium">
                  {article.title}
                </Typography>
              </div>

              <Badge variant="neutral" tone="subtle" className="w-fit shrink-0">
                {labels.get(article.category)}
              </Badge>
            </li>
          ))}
        </ul>

        <Typography size="sm" tone="muted">
          {content.note}
        </Typography>
      </Container>
    </Section>
  );
};
