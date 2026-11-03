import { Container, Typography } from "@remi/ui/server";
import { ImproveMock, RecipesMock } from "@/components/mocks";
import { FEATURES, FEATURES_SECTION } from "@/lib/content/landing";

const mocks = { recipes: RecipesMock, improve: ImproveMock } as const;

/** The two things REMI does in this version, and only those two. */
export const FeaturesSection = () => (
  <section
    id="fonctionnement"
    className="from-primary-subtle to-success-subtle bg-linear-to-b py-16 md:py-24"
  >
    <Container className="flex flex-col gap-8">
      <Typography as="h2" size="3xl" weight="bold" balance className="max-w-2xl">
        {FEATURES_SECTION.title}
      </Typography>
      <div className="grid gap-5 md:grid-cols-2">
        {FEATURES.map((feature) => {
          const Mock = mocks[feature.id];
          return (
            <article
              key={feature.id}
              className="border-border bg-card flex flex-col gap-2 rounded-2xl border p-5 shadow-sm"
            >
              <div className="mb-2">
                <Mock />
              </div>
              <Typography as="h3" size="lg" weight="semibold">
                {feature.title}
              </Typography>
              <Typography size="sm" tone="muted">
                {feature.text}
              </Typography>
            </article>
          );
        })}
      </div>
      <Typography size="sm" tone="muted" className="text-center">
        {FEATURES_SECTION.note}
      </Typography>
    </Container>
  </section>
);
