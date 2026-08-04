import { Container, Section, Skeleton, VisuallyHidden } from "@remi/ui/server";

/**
 * The header and footer come from the layout above, so this only stands in for
 * the page body — a hero block and the band of content under it, at roughly the
 * measure the real sections use, so the footer does not jump when they arrive.
 *
 * One string in both languages: a loading boundary receives no params, so there
 * is no locale here to pick a dictionary with.
 */
const Loading = () => (
  <Section spacing="lg" aria-live="polite" role="status">
    <VisuallyHidden>Loading · Chargement</VisuallyHidden>

    <Container className="flex flex-col gap-16">
      <div className="flex max-w-2xl flex-col gap-5">
        <Skeleton className="h-3 w-40" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-4/5" />
        <Skeleton className="mt-2 h-5 w-full" />
        <Skeleton className="h-5 w-2/3" />
        <div className="mt-4 flex gap-3">
          <Skeleton className="h-12 w-44" />
          <Skeleton className="h-12 w-36" />
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {["first", "second", "third"].map((column) => (
          <div key={column} className="flex flex-col gap-3">
            <Skeleton className="size-10 rounded-lg" />
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        ))}
      </div>
    </Container>
  </Section>
);

export default Loading;
