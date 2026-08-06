/**
 * The founding-CTO offer, as data.
 *
 * A private page inside the operator console rather than a document, so it can
 * be opened and talked through in the room instead of sent ahead and read
 * alone. It sits in the sidebar under "Company" so it can be reached mid
 * conversation; what keeps it private is the console's access gate, not
 * obscurity.
 *
 * Every figure traces to one of three sources — the €120/hour invoiced rate,
 * the two-days-a-week commitment, or the repository's own commit history — and
 * each is restated with its working beside it, so nothing here has to be taken
 * on trust.
 */

export const author = "Jamie Nisbet";

/** The date of the conversation this page was written for. */
export const preparedOn = "6 August 2026";

export type Row = { label: string; value: string; detail: string };
export type Point = { label: string; body: string };

export const offer = {
  header: {
    eyebrow: "Private — for our conversation",
    title: "The founding CTO offer",
    lead: "Why I think the number is closer to 10% than 5% — and what I would suggest if it cannot be.",
    preparedFor: "For Morgane and Arnaud",
  },

  agreement: {
    title: "Where we already agree",
    body: [
      "Before anything else: I want to build this, with you. The demand side of REMI is real and it is not mine — the FunMedDev relationship, the practitioners who have already said yes, and the clinical judgement behind the therapeutic frame all came from you two. LivingMatrix reached 600 practices at $129 a month through exactly that kind of channel, and nobody has run that play in Europe yet. That is worth saying plainly rather than negotiating around.",
      "What follows is one argument, three facts, and three alternatives. If you disagree with a line of it, say so and we will work it out in the room. This is a conversation, not a position paper.",
    ],
  },

  reconciliation: {
    title: "The one thing that does not reconcile",
    lead: "Two numbers came up on our call — a €2.5 million valuation, and 5%. I do not think both can be right at the same time.",
    rows: [
      {
        label: "What two days a week is worth",
        value: "€176,000 / year",
        detail:
          "Slicing Pie, the standard model for part-time founders, values a contribution at its market rate and doubles the part that is not paid in cash, because unpaid work carries the risk. €120 an hour, two days a week, doubled.",
      },
      {
        label: "What that buys at a €2.5M valuation",
        value: "≈ 7% in year one",
        detail:
          "€176,000 measured against €2.5 million. That is the first year alone, before the second one starts.",
      },
      {
        label: "What is on the table",
        value: "5%",
        detail:
          "Which prices a year of at-risk contribution below what your own valuation says that contribution is worth.",
      },
    ] satisfies Row[],
    conclusion: [
      "So either the valuation is €2.5 million and the equity is higher than 5%, or the equity is 5% and the valuation is a good deal lower. I am genuinely happy to have either conversation — I just do not think we can hold both numbers at once.",
      "And the two things that carry a €2.5 million valuation, a complete team and a working product, are the two things I would be joining to supply. Right now they are being priced in before they exist.",
    ],
  },

  evidence: {
    title: "Three facts behind it",
    rows: [
      {
        label: "The benchmark range",
        value: "10–20%",
        detail:
          "A paid fractional CTO gets 1–8%. An unpaid, full-time technical cofounder joining late gets 20–35%. An unpaid two-day-a-week founding CTO who also wrote the entire codebase sits between the two. 10% is the bottom of that range, not the top.",
      },
      {
        label: "Forgone in year one",
        value: "€88,000",
        detail:
          "€120 an hour invoiced, roughly 92 working days a year, none of it charged. That is what “no cash before funding” actually costs, and it repeats in year two if the round is slow.",
      },
      {
        label: "Already built, sole-authored",
        value: "29,511 lines",
        detail:
          "Six deployed apps, a design system, a services layer and a delivery pipeline across 310 TypeScript files — every commit in the log under one name, written in six days. Assigned to the company in writing on the day we sign.",
      },
    ] satisfies Row[],
  },

  asking: {
    title: "What I am asking for",
    points: [
      {
        label: "Equity",
        body: "10% fully diluted, earned month by month over four years, with nothing at all before month twelve.",
      },
      {
        label: "Time",
        body: "An average of two days a week, on a schedule you can see. A floor I can honestly keep, not a ceiling.",
      },
      {
        label: "Cash before funding",
        body: "None. No salary, no fee, nothing accruing quietly in the background.",
      },
      {
        label: "The two protections",
        body: "The twelve-month cliff protects you — if I do not deliver, you owe me nothing. The good-leaver waiver protects me, so that cliff cannot be used to end this in month eleven at no cost. I would like both, and I think both are fair.",
      },
    ] satisfies Point[],
  },

  alternatives: {
    title: "If 10% is not available",
    lead: "If the cap table genuinely cannot move, I would much rather find the shape that works than let a percentage point end it. Three ways, in the order I would take them.",
    points: [
      {
        label: "Milestone step-ups",
        body: "6% now, a further 2% when the pilot backend ships, a further 2% if my time goes to three days a week. You would be paying in equity only for outcomes you can see, and nothing changes today.",
      },
      {
        label: "Fees that accrue from signature",
        body: "From the day we sign until a round closes, my hours accrue at €120 an hour as a deferred fee — paid out of the round, and capped so it can never eat into the raise. At two days a week that is roughly €100,000 over twelve months. Not a bonus: a deferral of money I would otherwise be billing elsewhere.",
      },
      {
        label: "A top-up at the first round",
        body: "We sign at 5% now, and I am restored toward 10% when the first money arrives, ahead of the new-money dilution.",
      },
    ] satisfies Point[],
  },

  closing: {
    title: "Where I stand",
    body: [
      "None of this is an ultimatum, and there is no version of tomorrow where I walk out over a percentage point. I like working with you both, and I think REMI is worth several years of my life.",
      "What I do not want is to sign the version where the whole technical risk sits on my side of the table, at a price set by a valuation I would be the one creating. Tell me where you disagree, and let us fix it here rather than after the lawyers are involved.",
    ],
  },
} as const;
