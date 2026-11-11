import { ArrowRight, Check, Clock } from "lucide-react";
import { Container, Link, Section, Typography } from "@remi/ui/server";
import { SelectOfferButton } from "@/components/select-offer-button";
import { OFFERS, OFFERS_SECTION } from "@/lib/content/landing";
import { formatPrice } from "@/lib/site";

/** The two pilot formulas, with Morgane's pilot prices. */
export const OffersSection = () => (
  <Section id="offres" spacing="lg">
    <Container className="flex flex-col gap-8">
      <div className="flex max-w-2xl flex-col gap-3">
        <Typography as="h2" size="3xl" weight="bold" balance>
          {OFFERS_SECTION.title}
        </Typography>
        <Typography variant="lead">{OFFERS_SECTION.lead}</Typography>
      </div>

      <div className="grid gap-5 md:grid-cols-2 md:gap-6">
        {OFFERS.map((offer) => (
          <article
            key={offer.id}
            className="border-border bg-card flex flex-col gap-4 rounded-2xl border p-6 shadow-sm md:p-7"
          >
            <Typography as="h3" size="xl" weight="semibold">
              {offer.name}
            </Typography>
            <Typography size="sm" tone="muted">
              {offer.hook}
            </Typography>
            <div className="flex flex-col gap-1.5">
              <p className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                <span className="text-primary text-4xl leading-none font-extrabold tracking-tight">
                  {formatPrice(offer.price)}
                </span>
                <span className="text-muted-foreground text-xs">{OFFERS_SECTION.priceUnit}</span>
              </p>
              <p className="text-muted-foreground text-sm">
                {OFFERS_SECTION.commercialPriceLabel} {formatPrice(offer.commercialPrice)}
              </p>
              <Typography size="xs" tone="muted">
                {OFFERS_SECTION.pilotPriceNote}
              </Typography>
            </div>
            <ul className="border-border flex flex-1 flex-col gap-2.5 border-t pt-4">
              {offer.includes.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm font-medium">
                  <span className="bg-success-subtle text-success-text grid size-5.5 shrink-0 place-items-center rounded-full">
                    <Check aria-hidden="true" className="size-3.5" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            {offer.highlight ? (
              <p className="bg-success-subtle text-success-text flex items-start gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold">
                <Clock aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                {offer.highlight}
              </p>
            ) : null}
            {offer.footnote ? (
              <Typography size="xs" tone="muted">
                {offer.footnote}
              </Typography>
            ) : null}
            <SelectOfferButton offer={offer.id} size="lg">
              {OFFERS_SECTION.cta}
            </SelectOfferButton>
            {offer.learnMore ? (
              <Link href={offer.learnMore.href} variant="standalone" className="self-center text-sm">
                {offer.learnMore.label}
                <ArrowRight aria-hidden="true" />
              </Link>
            ) : null}
          </article>
        ))}
      </div>

      <Typography size="sm" tone="muted" className="text-center">
        {OFFERS_SECTION.note}
      </Typography>
    </Container>
  </Section>
);
