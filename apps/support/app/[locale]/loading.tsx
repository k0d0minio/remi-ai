import { Container, Section, Skeleton, VisuallyHidden } from "@remi/ui/server";

/**
 * The header and footer come from the layout above, so this stands in for the
 * page body only: a search hero, then the category grid the home page and every
 * category page both open with.
 *
 * One string in both languages: a loading boundary receives no params, so there
 * is no locale here to pick a dictionary with.
 */
const Loading = () => (
  <Section spacing="lg" aria-live="polite" role="status">
    <VisuallyHidden>Loading · Chargement</VisuallyHidden>

    <Container className="flex flex-col gap-12">
      <div className="flex max-w-2xl flex-col gap-5">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="mt-2 h-11 w-full max-w-md" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {["first", "second", "third", "fourth", "fifth", "sixth"].map(
          (card) => (
            <div
              key={card}
              className="border-border flex flex-col gap-3 rounded-xl border p-6"
            >
              <Skeleton className="size-9 rounded-lg" />
              <Skeleton className="h-5 w-2/3" />
              <Skeleton className="h-4 w-full" />
            </div>
          ),
        )}
      </div>
    </Container>
  </Section>
);

export default Loading;
