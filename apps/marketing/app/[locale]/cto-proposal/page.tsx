import type { Metadata } from "next";
import { Container, Section, Separator, Typography } from "@remi/ui/server";
import { author, preparedOn, proposal } from "./content";
import {
  PointList,
  ProposalHeading,
  Prose,
  StepList,
  TermsList,
} from "./proposal-parts";

/**
 * A hidden route. It is unlinked from the site, excluded from the sitemap,
 * disallowed in robots.txt and marked noindex here — but it is still served to
 * anyone who knows the URL, so nothing on this page should be more sensitive
 * than what is being sent to Arnaud and Morgane anyway.
 *
 * English only, in both locale segments. The document is a private negotiating
 * position, not part of the bilingual public site.
 */
export const generateMetadata = async (): Promise<Metadata> => ({
  title: proposal.meta.title,
  description: proposal.meta.description,
  robots: { index: false, follow: false, nocache: true },
});

const Page = () => (
  <>
    <Section spacing="lg">
      <Container size="narrow" className="flex flex-col gap-6">
        <Typography variant="eyebrow" tone="muted">
          {proposal.header.eyebrow}
        </Typography>
        <Typography as="h1" variant="display" size="5xl" balance>
          {proposal.header.title}
        </Typography>
        <Typography variant="lead" size="lg">
          {proposal.header.lead}
        </Typography>
        <Separator tone="subtle" />
        <div className="flex flex-wrap gap-x-8 gap-y-1">
          <Typography size="sm" tone="muted">
            {proposal.header.preparedFor}
          </Typography>
          <Typography size="sm" tone="muted">
            {author} · {preparedOn}
          </Typography>
        </div>
      </Container>
    </Section>

    <Section tone="muted" spacing="md">
      <Container size="narrow" className="flex flex-col gap-8">
        <ProposalHeading index={1} title={proposal.opening.title} />
        <Prose body={proposal.opening.body} />
      </Container>
    </Section>

    <Section spacing="md">
      <Container size="narrow" className="flex flex-col gap-8">
        <ProposalHeading index={2} title={proposal.terms.title} />
        <TermsList terms={proposal.terms.items} />
      </Container>
    </Section>

    <Section tone="muted" spacing="md">
      <Container size="narrow" className="flex flex-col gap-8">
        <ProposalHeading
          index={3}
          title={proposal.conditions.title}
          lead={proposal.conditions.lead}
        />
        <StepList steps={proposal.conditions.items} />
      </Container>
    </Section>

    <Section spacing="md">
      <Container size="narrow" className="flex flex-col gap-10">
        <ProposalHeading index={4} title={proposal.commitments.title} />
        <PointList points={proposal.commitments.points} />
      </Container>
    </Section>

    <Section tone="muted" spacing="md">
      <Container size="narrow" className="flex flex-col gap-8">
        <ProposalHeading index={5} title={proposal.next.title} />
        <Prose body={proposal.next.body} />
      </Container>
    </Section>

    <Section tone="subtle" spacing="lg">
      <Container size="narrow" className="flex flex-col gap-8">
        <ProposalHeading index={6} title={proposal.working.title} />
        <Prose body={proposal.working.body} />
        <Separator tone="subtle" />
        <Typography size="sm" tone="muted">
          {author} · {preparedOn} · Version 2 · Non-binding
        </Typography>
      </Container>
    </Section>
  </>
);

export default Page;
