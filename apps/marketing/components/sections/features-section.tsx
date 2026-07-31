import { Stagger, StaggerItem } from "@remi/ui/motion";
import { Container, FeatureGrid, Section, Typography } from "@remi/ui/server";
import { features } from "@/lib/content/landing";

export const FeaturesSection = () => (
  <Section id="features" spacing="lg">
    <Container className="flex flex-col gap-12">
      <div className="flex max-w-2xl flex-col gap-4">
        <Typography variant="eyebrow" tone="muted">
          What it does
        </Typography>
        <Typography as="h2" variant="display" size="4xl" balance>
          Everything a food diary should have been
        </Typography>
        <Typography variant="lead" size="lg">
          Tracking only helps if it survives contact with a normal week, and if
          what comes back is worth the effort of logging.
        </Typography>
      </div>

      {/* The wrappers are passed in rather than imported by FeatureGrid: the grid
          is a server component and these are client islands. */}
      <FeatureGrid
        items={features}
        columns={3}
        as={Stagger}
        itemAs={StaggerItem}
      />
    </Container>
  </Section>
);
