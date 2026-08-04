import { Search } from "lucide-react";
import { Container, Input, Section, Typography } from "@remi/ui/server";
import type { Content } from "@/lib/content/types";

type Props = {
  content: Content["home"]["hero"];
};

const searchId = "support-search";

/**
 * The entry screen: a question, and one obvious place to put an answer.
 *
 * The field is disabled, and says so underneath. There is no index to search
 * yet, and a box that swallows what a stuck person types is worse than no box —
 * so it shows the shape the help centre will take without pretending to be it.
 * When search lands, this becomes a client island and the note goes.
 */
export const SearchHero = ({ content }: Props) => (
  <Section spacing="lg" tone="subtle">
    <Container size="narrow" className="flex flex-col items-center gap-6">
      <Typography variant="eyebrow" tone="muted">
        {content.eyebrow}
      </Typography>

      <Typography
        as="h1"
        variant="display"
        size="5xl"
        balance
        className="text-center md:text-6xl"
      >
        {content.title}
      </Typography>

      <Typography variant="lead" size="lg" balance className="text-center">
        {content.subtitle}
      </Typography>

      <div className="mt-2 flex w-full flex-col items-center gap-3">
        {/* `VisuallyHidden` renders a span, which cannot carry `htmlFor` — a
            label is one of the few places the clipping class goes on the
            element itself. */}
        <Typography as="label" htmlFor={searchId} className="sr-only">
          {content.searchLabel}
        </Typography>

        <div className="relative w-full">
          <Search
            aria-hidden="true"
            className="text-muted-foreground pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2"
          />
          <Input
            id={searchId}
            type="search"
            size="lg"
            disabled
            placeholder={content.searchPlaceholder}
            aria-describedby={`${searchId}-note`}
            className="h-14 rounded-full pl-12 pr-5 text-base md:text-base"
          />
        </div>

        <Typography id={`${searchId}-note`} size="sm" tone="muted">
          {content.searchNote}
        </Typography>
      </div>
    </Container>
  </Section>
);
