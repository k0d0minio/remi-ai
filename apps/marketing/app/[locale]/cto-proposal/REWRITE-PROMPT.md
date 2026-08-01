# Prompt — interrogate, then rewrite the founding-CTO proposal

Paste everything below the line into Fable 5, in this repository. It is written to be used as-is.

---

You are helping me rewrite a private proposal I am sending to my two prospective co-founders,
Arnaud and Morgane, setting out the terms on which I would join their company as founding CTO.

The current draft lives in `apps/marketing/app/[locale]/cto-proposal/content.ts`, rendered by
`page.tsx` and `proposal-parts.tsx` in the same folder. **Read all three before you say anything.**

The draft is good in places and wrong in three specific ways:

1. **It contradicts itself.** Several terms cannot all be true at once. I have listed the ones I
   know about below; find the rest.
2. **It assumes facts it never checked with me.** Dates, valuations, day rates, who owns what, who
   said what. Some of these are probably wrong and I would be sending a document built on them.
3. **It reads like a presentation.** It argues, it builds a case, it has a "at a glance" section and
   a rhetorical closing. I want a short proposal with clear conditions that a reasonable person can
   say yes or no to.

There is a fourth problem, and it is mine: **I do not properly understand the financial and legal
vocabulary in this document.** Vesting, cliffs, tranches, fully diluted, contribution in kind,
option pools, good and bad leavers, acceleration — I have been using these words without being able
to defend them. I am not sending a document I cannot explain in a meeting.

## Your job, in order

**Phase 1 — interrogate me. Write nothing until this is finished.**

**Phase 2 — show me a written ledger of my answers and get me to confirm it.**

**Phase 3 — rewrite the proposal.**

Do not skip ahead. If I try to rush you to Phase 3, tell me which questions are still open and what
you would have to invent to proceed.

## Phase 1 — how to interrogate me

- **Ask in small batches.** Five to eight questions at a time, grouped by theme. Wait for my answers
  before the next batch. Do not dump forty questions at once.
- **Give me a default for every question.** Phrase it as "my suggested answer is X, because Y — say
  'default' if that is right." I should be able to move fast on the questions where I have no strong
  view, and slow down only where it matters.
- **Teach as you go.** The first time any financial or legal term comes up, define it in one or two
  plain sentences before you ask me anything about it, and show me the number it produces in *my*
  situation, not in the abstract. Example: do not ask "do you want a cliff?" — tell me what a cliff
  is, tell me that a four-year vest backdated to when I started, with no cliff, means roughly 3.75%
  of the company is already mine on the day of signature, and then ask whether that is what I
  intended.
- **Check I actually understood.** After each concept, ask me to say back what it means in my own
  words. If I get it wrong, correct me plainly and move on. No quizzing me on things I clearly know.
- **Challenge my answers.** If something I tell you is implausible, weakens my position, or
  contradicts an earlier answer, say so directly. You are not here to flatter the draft. Where an
  argument in the document would be easy for Arnaud to turn around on me, tell me — I would rather
  hear it from you than from him.
- **Never invent a fact about the company, the people or the money.** If you need it and I have not
  given it to you, ask. If I do not know it either, mark it `[TO CONFIRM]` and keep going.

## The contradictions I already know about — resolve every one with me

Work through these explicitly. For each, tell me what the tension is in plain words, what the
options are, and what you recommend.

1. **"No cash before funding" vs the deferred fee.** The summary says I am asking the company for no
   money, then proposes €450 per day accruing up to €90,000. That is a cash debt. Which is it, and
   how should it be described honestly?
2. **Tranche A: 10% vs the auditor's valuation.** The document says the existing platform is worth
   €85k–€125k, says an auditor will certify its value and that we both accept whatever it says, and
   then fixes the shares at 10%. At a €2.5m valuation, 10% is €250,000 — roughly double the top of
   my own range. These cannot all hold. Is the 10% the ask, or is the auditor's number the ask?
3. **Being paid twice for the same past work.** Tranche A is justified as payment for work already
   done. The deferred fee says "for every day worked before the round closes" — which, read plainly,
   includes the days already worked. Does the deferred fee start at signature or run backwards?
4. **The anti-dilution promise vs the option pool.** One paragraph says any shares issued before the
   round top my holding back up to 25%. The next says a pre-round option pool of up to 10% dilutes
   me pro rata like everyone else. Both cannot be true.
5. **"No board seat requested" vs nine reserved matters.** The consent list is a veto over most
   things a board decides. Asking for less and then asking for more reads as evasive. Do I want the
   veto, the seat, or a shorter list?
6. **2.5 days a week vs the obligations.** The role section claims the entire engineering function,
   on-call, and incident response; the objectives promise 99.5% availability. None of that is
   deliverable in two and a half days a week. Either the commitment goes up, or the promises come
   down.
7. **The arithmetic works against me.** The document says what exists is worth €85k–€125k and that
   5% is worth €125,000. Read coldly, that says the offer on the table already covers everything
   built. Whatever the real argument is, it is not this one. Rebuild it or drop it.
8. **"Eighteen months" is used twice for different periods** — once for work already done, once for
   work still to come — and the start date implies twelve months, not eighteen. Pin the timeline
   down with me.
9. **The €90,000 cap is not a real cap.** At €450 a day it is 200 days, roughly twenty months at the
   proposed commitment, against an assumed nine months to the round. It is presented as a
   reassurance but never binds. Say what it is for, or remove it.
10. **"Nothing here binds anyone, argue with it line by line" vs a fourteen-day deadline** and a
    section about walking away. Decide whether this document is an opening position or an ultimatum,
    and make the whole thing sound like one thing.
11. **"Confirm no one else has been engaged for the role"** as a condition, in a document that also
    acknowledges there is another candidate. If they are already talking to someone, that condition
    is unmeetable as written.

Then find the ones I have missed and bring them to me the same way.

## The assumptions I need you to check with me — do not take any of these on trust

Ask about every one of these before writing anything:

- **The company.** Does the BV/SRL actually exist yet, and is it Belgian? Who holds what today? Is
  there already a shareholders' agreement, a loan, a convertible, or anything promised to anyone?
  (The whole contribution-in-kind mechanism assumes an incorporated Belgian company with an auditor
  process available to it.)
- **The €2.5m valuation.** Where did it come from, is it a real pre-money for a planned round or a
  number Arnaud says in conversation, and is anyone actually raising?
- **The 5% offer.** Who made it, when, in writing or in passing, and have I already responded?
- **The timeline.** Nine months to a round is assumed throughout. Is there a plan, a date, a deck?
- **The dates.** Work is backdated to 1 August 2025 and the document is dated 31 July 2026. Are both
  right? The repository history was reinitialised, so the start date cannot be derived from the
  code — I have to tell you, and everything vested-on-day-one depends on it.
- **The rates.** €650 a day as the Belgian market rate, €450 deferred, €143,000 as the salaried
  equivalent. Where did these come from and do I stand behind them?
- **My current effort.** How many days a week am I really working on this now, and what would I
  actually commit to before and after funding? Do I genuinely want full-time and exclusive?
- **My other work.** Am I willing to end other client engagements, and when?
- **Who built the platform.** Did anyone other than me write any of it? Any contractor, any agency,
  any code from a previous employer, anything I do not have the right to contribute? I am asked to
  warrant this in the document — I should not warrant something we have not checked.
- **Arnaud and Morgane.** What does each of them actually do, full-time or not, paid or not? Is
  Arnaud an investor, an operator, or both? What is my personal relationship with them — friends,
  family, strangers? This decides the tone more than anything else in the document.
- **The other candidate.** Real or assumed? How do I know?
- **The €15,000 MRR backstop.** Is there any revenue today, any pilot, any customer?
- **Language.** The names are French, the marketing site is bilingual. Should this document be in
  French, English, or both? Which one do they read a legal proposal in?
- **The channel.** Is this a web page, an email, a PDF, or something I talk through in a room? The
  right length and tone differ a lot between those.
- **My position.** What is the single term I most want? What am I willing to trade away? What is my
  real walk-away point? And what would I say yes to today if they offered it? The current draft has
  no fallback position in it at all, and I need to decide whether one belongs in the document or
  only in my head.

## Phase 2 — the ledger

Before you write, give me a single list of every answer I gave, every default I accepted, and every
item still marked `[TO CONFIRM]`. Keep it short — a line each. I confirm it, then you write.

## Phase 3 — what the rewritten proposal must be

**Shape.** A proposal with conditions, not a case for the defence:

1. One short paragraph: what I am proposing, in three or four sentences.
2. The terms, as a plain list. Each term, its value, and at most one sentence of reason — and only
   where the term is unusual enough to need one.
3. The conditions: numbered, specific, each one either met or not met.
4. What I commit to in return.
5. What happens next, and by when.

**Length.** Under 1,200 words of body text, excluding the terms list. The current draft is over
4,000. If a paragraph is persuasion rather than a term, a reason, or a condition, cut it.

**Language.** Plain English. Every financial or legal concept gets said in ordinary words first,
with the technical term in brackets after it, once — "shares that become mine gradually over four
years (vesting)". Never the reverse. If a sentence needs a footnote to make sense, rewrite the
sentence. No jargon I have not confirmed I can explain out loud.

**Tone.** Direct and unemotional. No rhetorical questions, no "here is the shape of it", no
manifesto lines, no adversarial framing, no numbers used for effect. I want it to read like someone
who has thought carefully and has nothing to hide — not like someone selling.

**Numbers.** Re-derive every figure from what I tell you and show your working in a short section at
the end that I can check. Do not carry a number over from the current draft because it is there. If
a number does not survive being checked, drop it rather than softening it.

**Honesty.** Where a term favours me, say so plainly rather than dressing it as fairness. That is
the thing most likely to get me a yes.

## Delivery

Give me the rewritten document as plain prose first, in the chat, so I can read it as they would.
Do not touch any files until I approve it.

When I do approve it, port it into `content.ts` in the existing data shape, keeping the file's
TypeScript types and the `satisfies` annotations intact, and update `page.tsx` and
`proposal-parts.tsx` for any section that no longer exists or has changed shape. Follow
`CONVENTIONS.md`. Do not run build, lint, typecheck or format — the CI does that.

Finish by telling me, in a few lines: what is still unconfirmed, which terms are weakest and most
likely to be pushed back on, and what I should be ready to concede first.
