import type { Metadata } from "next";
import {
  Alert,
  AlertDescription,
  AlertTitle,
  Container,
  Section,
  Separator,
  Typography,
} from "@remi/ui/server";
import { author, preparedOn, proposal } from "./content";
import {
  ClauseList,
  FigureGrid,
  ObjectiveList,
  PointList,
  Prose,
  ProposalHeading,
  RightsList,
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
        <Alert variant="info">
          <AlertTitle>{proposal.disclaimer.title}</AlertTitle>
          <AlertDescription>
            <Typography size="sm" tone="muted" className="leading-relaxed">
              {proposal.disclaimer.body}
            </Typography>
          </AlertDescription>
        </Alert>
      </Container>
    </Section>

    <Section tone="muted" spacing="md">
      <Container size="narrow" className="flex flex-col gap-8">
        <ProposalHeading
          index={1}
          title={proposal.headline.title}
          lead={proposal.headline.lead}
        />
        <TermsList terms={proposal.headline.terms} />
      </Container>
    </Section>

    <Section spacing="md">
      <Container size="narrow" className="flex flex-col gap-8">
        <ProposalHeading index={2} title={proposal.starting.title} />
        <Prose body={proposal.starting.body} />
      </Container>
    </Section>

    <Section tone="muted" spacing="md">
      <Container size="narrow" className="flex flex-col gap-10">
        <ProposalHeading
          index={3}
          title={proposal.role.title}
          lead={proposal.role.lead}
        />
        <PointList points={proposal.role.duties} />
        <Separator tone="subtle" />
        <Typography size="lg" className="max-w-2xl leading-relaxed">
          {proposal.role.closing}
        </Typography>
      </Container>
    </Section>

    <Section spacing="md">
      <Container size="narrow" className="flex flex-col gap-10">
        <ProposalHeading index={4} title={proposal.built.title} />
        <Prose body={proposal.built.body} />
        <PointList points={proposal.built.inventory} />
        <Separator tone="subtle" />
        <Prose body={proposal.built.ownership} />
      </Container>
    </Section>

    <Section tone="muted" spacing="md">
      <Container size="narrow" className="flex flex-col gap-10">
        <ProposalHeading
          index={5}
          title={proposal.arithmetic.title}
          lead={proposal.arithmetic.lead}
        />
        <FigureGrid figures={proposal.arithmetic.figures} />
        <Prose body={proposal.arithmetic.closing} />
      </Container>
    </Section>

    <Section spacing="md">
      <Container size="narrow" className="flex flex-col gap-10">
        <ProposalHeading
          index={6}
          title={proposal.structure.title}
          lead={proposal.structure.lead}
        />
        <ClauseList clauses={proposal.structure.clauses} />
      </Container>
    </Section>

    <Section tone="muted" spacing="md">
      <Container size="narrow" className="flex flex-col gap-10">
        <ProposalHeading
          index={7}
          title={proposal.control.title}
          lead={proposal.control.lead}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <RightsList
            title={proposal.control.reservedTitle}
            items={proposal.control.reserved}
          />
          <div className="flex flex-col gap-4">
            <RightsList
              title={proposal.control.authorityTitle}
              items={proposal.control.authority}
            />
            <RightsList
              title={proposal.control.informationTitle}
              items={proposal.control.information}
            />
          </div>
        </div>
      </Container>
    </Section>

    <Section spacing="md">
      <Container size="narrow" className="flex flex-col gap-10">
        <ProposalHeading index={8} title={proposal.vesting.title} />
        <ClauseList clauses={proposal.vesting.clauses} />
      </Container>
    </Section>

    <Section tone="muted" spacing="md">
      <Container size="narrow" className="flex flex-col gap-10">
        <ProposalHeading index={9} title={proposal.ip.title} />
        <ClauseList clauses={proposal.ip.clauses} />
      </Container>
    </Section>

    <Section spacing="md">
      <Container size="narrow" className="flex flex-col gap-10">
        <ProposalHeading
          index={10}
          title={proposal.commitment.title}
          lead={proposal.commitment.lead}
        />
        <PointList points={proposal.commitment.points} />
      </Container>
    </Section>

    <Section tone="muted" spacing="md">
      <Container size="narrow" className="flex flex-col gap-10">
        <ProposalHeading
          index={11}
          title={proposal.objectives.title}
          lead={proposal.objectives.lead}
        />
        <ObjectiveList rows={proposal.objectives.rows} />
      </Container>
    </Section>

    <Section spacing="md">
      <Container size="narrow" className="flex flex-col gap-10">
        <ProposalHeading
          index={12}
          title={proposal.contracting.title}
          lead={proposal.contracting.lead}
        />
        <PointList points={proposal.contracting.points} />
      </Container>
    </Section>

    <Section tone="muted" spacing="md">
      <Container size="narrow" className="flex flex-col gap-8">
        <ProposalHeading
          index={13}
          title={proposal.conditions.title}
          lead={proposal.conditions.lead}
        />
        <RightsList
          title="Before or at signature"
          items={proposal.conditions.items}
        />
      </Container>
    </Section>

    <Section spacing="md">
      <Container size="narrow" className="flex flex-col gap-8">
        <ProposalHeading index={14} title={proposal.alternative.title} />
        <Prose body={proposal.alternative.body} />
      </Container>
    </Section>

    <Section tone="subtle" spacing="lg">
      <Container size="narrow" className="flex flex-col gap-10">
        <ProposalHeading index={15} title={proposal.nextSteps.title} />
        <StepList steps={proposal.nextSteps.steps} />
        <Separator tone="subtle" />
        <Typography size="lg" className="max-w-2xl leading-relaxed">
          {proposal.nextSteps.decision}
        </Typography>
        <Typography size="sm" tone="muted">
          {author} · {preparedOn} · Version 1 · Non-binding
        </Typography>
      </Container>
    </Section>
  </>
);

export default Page;
