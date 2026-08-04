import {
  Badge,
  Card,
  Container,
  IconTile,
  Section,
  Typography,
} from "@remi/ui/server";
import type { RoadmapContent } from "@/lib/content/types";

type Props = {
  content: RoadmapContent;
  tone?: "muted";
};

/**
 * The three horizons — now, next, later — read left to right. The badge carries
 * the phase, which is what lets each line stay a plain intention: nothing has to
 * be re-qualified as "not available yet" inside its own copy.
 *
 * The badge fades as the horizon recedes: `info` for what is being built, then
 * neutral, then an outline. An ordered list rather than a grid of divs, because
 * the order is the meaning.
 */
const horizon = [
  { badge: "info", tile: "primary" },
  { badge: "neutral", tile: "info" },
  { badge: "outline", tile: "neutral" },
] as const;

export const RoadmapSection = ({ content, tone }: Props) => (
  <Section id="roadmap" tone={tone} spacing="lg">
    <Container className="flex flex-col gap-12">
      <div className="flex max-w-2xl flex-col gap-4">
        <Typography variant="eyebrow" tone="muted">
          {content.eyebrow}
        </Typography>
        <Typography as="h2" variant="display" size="4xl" balance>
          {content.title}
        </Typography>
        <Typography variant="lead" size="lg">
          {content.lead}
        </Typography>
      </div>

      <ol className="grid gap-6 md:grid-cols-3">
        {content.columns.map((column, index) => {
          const Icon = column.icon;
          return (
            <li key={column.title} className="h-full">
              <Card elevation="flat" className="border-border h-full gap-5 p-8">
                <div className="flex items-start justify-between gap-4">
                  <IconTile intent={horizon[index].tile}>
                    <Icon />
                  </IconTile>
                  <Badge variant={horizon[index].badge} tone="subtle">
                    {column.status}
                  </Badge>
                </div>

                <div className="flex flex-col gap-2">
                  <Typography as="h3" size="xl" weight="semibold" balance>
                    {column.title}
                  </Typography>
                  <Typography size="sm" tone="muted">
                    {column.body}
                  </Typography>
                </div>

                <ul className="flex flex-col gap-3">
                  {column.items.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      {/* A dot, not a tick: a tick would read as shipped. */}
                      <span
                        aria-hidden="true"
                        className="bg-border mt-2 size-1.5 shrink-0 rounded-full"
                      />
                      <Typography as="span" size="sm">
                        {item}
                      </Typography>
                    </li>
                  ))}
                </ul>
              </Card>
            </li>
          );
        })}
      </ol>

      <Typography size="sm" tone="muted" className="max-w-3xl">
        {content.note}
      </Typography>
    </Container>
  </Section>
);
