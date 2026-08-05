import type { Metadata } from "next";
import { Separator, Typography } from "@remi/ui/server";
import { FigureRows } from "@/components/offer/figure-rows";
import { PointList } from "@/components/offer/point-list";
import { Prose } from "@/components/offer/prose";
import { author, offer, preparedOn } from "@/lib/offer";

/**
 * Deliberately absent from `navSections`. Every other route in this console is
 * operational and belongs in the sidebar; this one is a private conversation
 * that happens to live at a URL, and a link to it in the operator navigation
 * would put it in front of every future operator who has no business reading
 * it. The whole app is already `noindex` from the root layout, and
 * `app/robots.ts` keeps crawlers off the path as well.
 */
export const metadata: Metadata = {
  title: "Offer",
};

const Offer = () => (
  <div className="flex max-w-4xl flex-col gap-8">
    <div className="flex flex-col gap-3">
      <Typography variant="eyebrow" tone="muted">
        {offer.header.eyebrow}
      </Typography>

      <Typography as="h1" size="2xl" weight="semibold">
        {offer.header.title}
      </Typography>

      <Typography size="sm" tone="muted" className="max-w-2xl">
        {offer.header.lead}
      </Typography>

      <Separator tone="subtle" />

      <div className="flex flex-wrap gap-x-8 gap-y-1">
        <Typography size="xs" tone="muted">
          {offer.header.preparedFor}
        </Typography>
        <Typography size="xs" tone="muted">
          {author} · {preparedOn}
        </Typography>
      </div>
    </div>

    <section className="flex flex-col gap-3">
      <Typography as="h2" size="lg" weight="semibold">
        {offer.agreement.title}
      </Typography>
      <Prose body={offer.agreement.body} />
    </section>

    <section className="flex flex-col gap-4">
      <FigureRows
        intent="info"
        title={offer.reconciliation.title}
        description={offer.reconciliation.lead}
        rows={offer.reconciliation.rows}
      />
      <Prose body={offer.reconciliation.conclusion} />
    </section>

    <FigureRows title={offer.evidence.title} rows={offer.evidence.rows} />

    <PointList title={offer.asking.title} points={offer.asking.points} />

    <PointList
      title={offer.alternatives.title}
      description={offer.alternatives.lead}
      points={offer.alternatives.points}
    />

    <section className="flex flex-col gap-3">
      <Typography as="h2" size="lg" weight="semibold">
        {offer.closing.title}
      </Typography>
      <Prose body={offer.closing.body} />
      <Separator tone="subtle" />
      <Typography size="xs" tone="muted">
        {author} · {preparedOn} · Nothing here is binding
      </Typography>
    </section>
  </div>
);

export default Offer;
