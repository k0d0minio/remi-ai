import { Activity, Check, Droplets, Wheat } from "lucide-react";
import { Container, Typography } from "@remi/ui/server";
import { Faq } from "@/components/faq";
import { SelectOfferButton } from "@/components/select-offer-button";
import { GENETIC, offerById } from "@/lib/content/landing";
import { formatPrice } from "@/lib/site";

const icons: Record<(typeof GENETIC.axes)[number]["icon"], typeof Droplets> = {
  drop: Droplets,
  grain: Wheat,
  thyroid: Activity,
};

/**
 * The teaching block under the offers: what the genetic analysis is and why
 * it costs what it costs. Text from `content/landing.ts`, nuances included.
 */
export const GeneticSection = () => {
  const price = formatPrice(offerById("genetic").price);
  return (
    <section id={GENETIC.anchor} className="pb-16 md:pb-24">
      <Container>
        <article className="border-border bg-card border-t-primary flex flex-col gap-6 rounded-2xl border border-t-4 p-6 shadow-sm md:gap-8 md:p-9">
          <header className="flex max-w-3xl flex-col gap-3">
            <Typography variant="eyebrow" className="text-primary">
              {GENETIC.eyebrow}
            </Typography>
            <Typography as="h2" size="3xl" weight="bold" balance>
              {GENETIC.title}
            </Typography>
            <Typography variant="lead">{GENETIC.intro}</Typography>
          </header>

          <div className="bg-primary-subtle flex flex-col gap-1 rounded-lg px-4 py-3.5">
            <Typography as="h3" weight="semibold">
              {GENETIC.genotype.title}
            </Typography>
            <Typography size="sm" tone="muted">
              {GENETIC.genotype.text}
            </Typography>
          </div>

          <div className="flex flex-col gap-3">
            <Typography as="h3" weight="semibold">
              {GENETIC.axesTitle}
            </Typography>
            <ul className="grid gap-3 md:grid-cols-3 md:gap-4">
              {GENETIC.axes.map((axis) => {
                const Icon = icons[axis.icon];
                return (
                  <li
                    key={axis.id}
                    className="border-border grid grid-cols-[44px_1fr] items-start gap-3 rounded-lg border p-3.5 md:grid-cols-1 md:p-4"
                  >
                    <span className="bg-brand-gradient grid size-11 place-items-center rounded-xl text-white">
                      <Icon aria-hidden="true" className="size-5.5" />
                    </span>
                    <div>
                      <p className="font-extrabold tracking-wide">
                        {axis.gene}{" "}
                        <span className="text-success-text font-semibold tracking-normal">
                          · {axis.topic}
                        </span>
                      </p>
                      <Typography size="sm" tone="muted" className="mt-0.5">
                        {axis.text}
                      </Typography>
                    </div>
                  </li>
                );
              })}
            </ul>
            <Typography size="sm" tone="muted">
              {GENETIC.approach}
            </Typography>
          </div>

          <div className="flex flex-col gap-3">
            <Typography as="h3" weight="semibold">
              {GENETIC.stepsTitle}
            </Typography>
            <ol className="grid gap-3 md:grid-cols-3 md:gap-5">
              {GENETIC.steps.map((step, index) => (
                <li key={step.title} className="grid grid-cols-[32px_1fr] items-start gap-3">
                  <span className="bg-primary text-primary-foreground grid size-8 place-items-center rounded-full text-sm font-bold">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-bold">{step.title}</p>
                    <Typography size="sm" tone="muted">
                      {step.text}
                    </Typography>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="bg-success-subtle grid grid-cols-[32px_1fr] items-start gap-3 rounded-lg px-4 py-3.5 text-sm">
            <span className="bg-success text-success-foreground grid size-8 place-items-center rounded-full">
              <Check aria-hidden="true" className="size-4.5" />
            </span>
            <div>
              <p className="font-bold">{GENETIC.durable.title}</p>
              <p>{GENETIC.durable.text}</p>
            </div>
          </div>

          <div className="bg-warning-subtle grid gap-4 rounded-lg p-4 md:grid-cols-[1fr_auto] md:items-center md:gap-7 md:px-6 md:py-5">
            <div>
              <Typography as="h3" weight="semibold">
                {GENETIC.value.titleBefore}
                {price}
                {GENETIC.value.titleAfter}
              </Typography>
              <Typography size="sm" tone="muted" className="mt-1">
                {GENETIC.value.text}
              </Typography>
            </div>
            <SelectOfferButton offer="genetic" size="lg">
              {GENETIC.value.cta}
              {price}
            </SelectOfferButton>
          </div>

          <div className="flex flex-col gap-2">
            <Typography as="h3" weight="semibold">
              {GENETIC.faqTitle}
            </Typography>
            <Faq items={GENETIC.faq} />
          </div>

          <Typography size="xs" tone="muted" className="border-border border-t pt-4">
            {GENETIC.caution}
          </Typography>
        </article>
      </Container>
    </section>
  );
};
