import { Container, Typography } from "@remi/ui/server";
import { ImproveDemo } from "@/components/improve-demo";
import { RecipesMock } from "@/components/mocks";
import { FEATURES, FEATURES_SECTION, MOCK } from "@/lib/content/landing";

const mocks = { recipes: RecipesMock, improve: ImproveDemo } as const;

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
          const improve = feature.id === "improve";
          return (
            <article
              key={feature.id}
              className="border-border bg-card flex flex-col gap-2 rounded-2xl border p-5 shadow-sm"
            >
              <div className={improve ? "" : "mb-2"}>
                <Mock />
              </div>
              {/* Under the demo, as Morgane asked: the suggestions follow the profile. */}
              {improve && (
                <Typography size="xs" tone="muted" className="mb-2">
                  {MOCK.improve.personal}
                </Typography>
              )}
              <Typography as="h3" size="lg" weight="semibold">
                {feature.title}
              </Typography>
              <Typography size="sm" tone="muted">
                {feature.text}
              </Typography>
              {improve && (
                <Typography weight="bold" className="text-primary mt-1">
                  {MOCK.improve.message}
                </Typography>
              )}
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
