import { Stagger, StaggerItem } from "@remi/ui/motion";
import { Container, FeatureGrid, Section, Typography } from "@remi/ui/server";
import type { FeatureSectionContent } from "@/lib/content/types";

type Props = {
  content: FeatureSectionContent;
  id?: string;
  columns?: 2 | 3 | 4;
  tone?: "muted";
};

/**
 * One grid serves every "what we're building" and "the problem" block on the
 * site — the copy differs per page and locale, the layout does not.
 */
export const FeatureSection = ({ content, id, columns = 3, tone }: Props) => (
  <Section id={id} spacing="lg" tone={tone}>
    <Container className="flex flex-col gap-12">
      <div className="flex max-w-2xl flex-col gap-4">
        <Typography variant="eyebrow" tone="muted">
          {content.eyebrow}
        </Typography>
        <Typography as="h2" variant="display" size="4xl" balance>
          {content.title}
        </Typography>
        {content.lead ? (
          <Typography variant="lead" size="lg">
            {content.lead}
          </Typography>
        ) : null}
      </div>

      {/* The wrappers are passed in rather than imported by FeatureGrid: the grid
          is a server component and these are client islands. */}
      <FeatureGrid
        items={content.items}
        columns={columns}
        as={Stagger}
        itemAs={StaggerItem}
      />
    </Container>
  </Section>
);
