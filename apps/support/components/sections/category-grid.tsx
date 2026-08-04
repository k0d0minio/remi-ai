import {
  Card,
  Container,
  IconTile,
  Section,
  Typography,
} from "@remi/ui/server";
import type { Content } from "@/lib/content/types";

type Props = {
  content: Content["home"]["categories"];
};

/**
 * The five doors. Each card names what it covers and lists the questions it is
 * being written to answer — a category with a title and nothing else tells a
 * stuck person nothing about whether to open it.
 *
 * The cards do not link yet: the article routes do not exist, and a card that
 * leads to a 404 is worse than one that does not move. Each card carries its
 * category's `slug`, which is the route segment those articles will live under,
 * so wiring them up later is one `href` per card and no content change.
 */
export const CategoryGrid = ({ content }: Props) => (
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
        {content.items.map((category) => {
          const Icon = category.icon;

          return (
            <Card
              key={category.slug}
              elevation="flat"
              className="border-border h-full gap-4"
            >
              <div className="flex flex-col gap-4 px-6">
                <IconTile>
                  <Icon />
                </IconTile>
                <Typography as="h3" size="lg" weight="semibold">
                  {category.title}
                </Typography>
                <Typography size="sm" tone="muted">
                  {category.body}
                </Typography>
              </div>

              <ul className="flex flex-col gap-2 px-6">
                {category.topics.map((topic) => (
                  <li key={topic} className="flex items-start gap-2.5">
                    <span
                      aria-hidden="true"
                      className="bg-primary/40 mt-2 size-1.5 shrink-0 rounded-full"
                    />
                    <Typography as="span" size="sm">
                      {topic}
                    </Typography>
                  </li>
                ))}
              </ul>
            </Card>
          );
        })}
      </div>
    </Container>
  </Section>
);
