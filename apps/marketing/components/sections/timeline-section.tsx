import { Container, Section, Typography } from "@remi/ui/server";
import { cn } from "@remi/ui/utils";
import { TIMELINE, TIMELINE_SECTION } from "@/lib/content/landing";

/** The road map, with its dates as the documents state them. */
export const TimelineSection = () => (
  <Section id="calendrier" spacing="md">
    <Container className="flex flex-col gap-8">
      <Typography as="h2" size="3xl" weight="bold" balance className="max-w-2xl">
        {TIMELINE_SECTION.title}
      </Typography>
      <ol className="relative grid gap-0 lg:grid-cols-4 lg:gap-5 lg:pt-1">
        <span
          aria-hidden="true"
          className="bg-primary absolute top-2 bottom-2 left-[7px] w-0.5 opacity-30 lg:top-[11px] lg:right-0 lg:bottom-auto lg:left-0 lg:h-0.5 lg:w-auto"
        />
        {TIMELINE.map((step) => (
          <li key={step.id} className="relative pb-5 pl-9 last:pb-0 lg:pt-8 lg:pb-0 lg:pl-0">
            <span
              aria-hidden="true"
              className={cn(
                "bg-background border-primary absolute top-1 left-0 size-4 rounded-full border-[3px]",
                step.current && "bg-warning border-warning",
              )}
            />
            <Typography size="xs" weight="bold" className="text-primary">
              {step.when}
            </Typography>
            <Typography as="h3" weight="semibold">
              {step.title}
            </Typography>
            <Typography size="sm" tone="muted" className="mt-0.5">
              {step.text}
            </Typography>
          </li>
        ))}
      </ol>
      <Typography size="sm" tone="muted" className="text-center">
        {TIMELINE_SECTION.note}
      </Typography>
    </Container>
  </Section>
);
