import type { Metadata } from "next";
import { Separator, Typography } from "@remi/ui/server";
import { Prose } from "@/components/company/prose";
import { QuestionList } from "@/components/questions/question-list";
import { author, preparedOn, questions } from "@/lib/questions";

/**
 * The open business questions, linked from the sidebar's Company section like
 * the offer: a page to be opened together or read at leisure, not hunted for
 * by URL. Display-only on purpose — the options give the discussion a shape,
 * and the answers happen in conversation, not in a form. What keeps it private
 * is the console's access gate, not obscurity.
 */
export const metadata: Metadata = {
  title: "Questions ouvertes",
};

/**
 * Questions number continuously across sections, so pairing each section with
 * where its numbering starts keeps the count in one place.
 */
const numberedSections = questions.sections.map((section, index, all) => ({
  section,
  startAt: all
    .slice(0, index)
    .reduce((count, prior) => count + prior.questions.length, 1),
}));

const Questions = () => (
  <div className="flex max-w-4xl flex-col gap-8">
    <div className="flex flex-col gap-3">
      <Typography variant="eyebrow" tone="muted">
        {questions.header.eyebrow}
      </Typography>

      <Typography as="h1" size="2xl" weight="semibold">
        {questions.header.title}
      </Typography>

      <Typography size="sm" tone="muted" className="max-w-2xl">
        {questions.header.lead}
      </Typography>

      <Separator tone="subtle" />

      <div className="flex flex-wrap gap-x-8 gap-y-1">
        <Typography size="xs" tone="muted">
          {questions.header.preparedFor}
        </Typography>
        <Typography size="xs" tone="muted">
          {author} · {preparedOn}
        </Typography>
      </div>
    </div>

    {numberedSections.map(({ section, startAt }) => (
      <QuestionList
        key={section.title}
        title={section.title}
        description={section.lead}
        startAt={startAt}
        questions={section.questions}
      />
    ))}

    <section className="flex flex-col gap-3">
      <Typography as="h2" size="lg" weight="semibold">
        {questions.closing.title}
      </Typography>
      <Prose body={questions.closing.body} />
      <Separator tone="subtle" />
      <Typography size="xs" tone="muted">
        {author} · {preparedOn}
      </Typography>
    </section>
  </div>
);

export default Questions;
