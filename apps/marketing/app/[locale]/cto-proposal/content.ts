/**
 * The founding-CTO proposal, as data.
 *
 * Deliberately NOT in `lib/content/` with the public dictionaries: this is a
 * single-locale private document, not marketing copy, and forcing it through
 * the bilingual `Content` type would make a French translation a compile-time
 * requirement for a page only three people will ever read. If a French version
 * is wanted later, it belongs beside this file, not in the site dictionary.
 *
 * Every figure derives from two confirmed inputs — a €120/hour invoiced rate
 * and an average commitment of two days a week — and is restated with its
 * working in the closing section so the reader can check it.
 */

/** Whoever sends this. Shown in the header and the sign-off. */
export const author = "Jamie Nisbet";

/** The date printed on the document. Set to the date it is actually sent. */
export const preparedOn = "1 August 2026";

export type Point = { label: string; body: string };

export const proposal = {
  meta: {
    title: "Founding CTO — proposal",
    description:
      "A private proposal for the founding CTO role at Remi AI, prepared for Arnaud and Morgane.",
  },

  header: {
    eyebrow: "Private — not for distribution",
    title: "Founding CTO",
    lead: "The terms on which I would join Remi AI as founding CTO — what I am asking for, what I commit to in return, and the conditions to be met before we sign.",
    preparedFor: "Prepared for Arnaud and Morgane",
  },

  opening: {
    title: "What I am proposing",
    body: [
      "You asked me to join Remi as founding CTO, and the figure mentioned on our call was 5%, with nothing paid until a funding round. I want the role, on different terms: I take responsibility for Remi’s entire technical side at an average of two days a week, unpaid until the company is funded, in exchange for 10% of the company, earned over four years. The terms are below; every one of them is open to discussion, and nothing here binds anyone until lawyers have put it on paper.",
    ],
  },

  terms: {
    title: "The terms",
    items: [
      {
        label: "Role",
        body: "Founding CTO. I own the technical function: architecture, the platform, delivery, the design of how we handle data, technical hiring, and answering for the technology to investors and customers.",
      },
      {
        label: "Time",
        body: "An average of two days a week, on a schedule you can see. This is a floor I can honestly keep, not a ceiling. I continue my other, non-competing client work.",
      },
      {
        label: "Equity",
        body: "10% of the company, counting every share that exists or has been promised (fully diluted). The shares become mine gradually, month by month over four years (vesting). Nothing becomes mine in the first twelve months (a cliff); at month twelve the first 2.5% arrives at once, then about 0.21% per month. If I stop showing up in the first year, you owe me nothing.",
      },
      {
        label: "If you remove me without fault",
        body: "The cliff is waived and a further twelve months of shares vest. This term favours me, and I am asking for it plainly: without it, the cliff could be used to end the engagement in month eleven at no cost.",
      },
      {
        label: "Cash before funding",
        body: "None. No salary, no fee, no debt building up quietly. If real revenue arrives before any round, we agree pay for my days at that point.",
      },
      {
        label: "Cash after funding",
        body: "From the close of a round, the company pays my standard rate of €120 per hour, invoiced, for days actually worked. The round budget includes the first engineering hires within an agreed period, so the daily building is done by a team I steer.",
      },
      {
        label: "The code I have written",
        body: "The codebase I have started is assigned to the company in writing at signature. Until then, the company may use it under licence.",
      },
      {
        label: "Employee options",
        body: "A pool of shares reserved for future employees (option pool), its size agreed in writing, diluting all shareholders proportionally, me included.",
      },
      {
        label: "Future share issues",
        body: "When new shares are issued, I have the right to buy my proportional part first, at the same price (pre-emption), so I can choose to keep my percentage. This costs the company nothing.",
      },
      {
        label: "Decisions that need my consent",
        body: "Three only: changing the rights attached to my shares or creating shares that rank above them; issuing shares outside the agreed pool or a genuine funding round; and transactions between the company and a shareholder or their connected persons. No board seat is requested. These three protect my stake; everything else is yours to run.",
      },
      {
        label: "Information",
        body: "Monthly management accounts; the cap table on request; notice of any term sheet or offer within five working days.",
      },
      {
        label: "If I leave",
        body: "Leaving normally — resignation, illness, removal without fault — I keep what has vested and lose the rest. Only fraud, gross misconduct, or a serious breach I fail to fix within 30 days of written notice makes me a bad leaver, in which case even vested shares can be bought back — at their real value, or at the founding price only for proven fraud. The list is short and closed on purpose.",
      },
      {
        label: "If the company is sold",
        body: "If, within twelve months of a sale, the buyer removes me or hollows out the role, all my unvested shares vest at once (double trigger). Both events must happen; a sale alone changes nothing.",
      },
      {
        label: "Competition",
        body: "No work on a competing product in Remi’s market while I hold this role. My other client work is otherwise unrestricted.",
      },
    ] satisfies Point[],
  },

  conditions: {
    title: "Conditions",
    lead: "Each of these is either met or not met before we sign.",
    items: [
      "Disclosure of the cap table, the articles of association, any loan, convertible or promise of shares or roles to anyone, the material contracts (including the funmeddev agreement), and confirmation of the €50,000 investment — paid or committed, total or first instalment.",
      "The shareholders’ agreement and my services agreement are signed on the same day as the share issue — neither before the other.",
      "The share issue is entered in the share register and the UBO register within 30 days.",
      "The option pool’s size and mechanics are agreed in writing.",
      "Confirmation that the company owns, or is acquiring, the rights to any material it did not create — brand assets, content, third-party work.",
    ],
  },

  commitments: {
    title: "What I commit to",
    points: [
      {
        label: "Time, from signature",
        body: "An average of two days a week, on a visible schedule.",
      },
      {
        label: "The product",
        body: "A working product in the hands of the funmeddev pilot within twelve months of signature — judged by practitioners using it on real work, not by a demo.",
      },
      {
        label: "Data protection",
        body: "Remi will handle health data, which the GDPR treats as special-category. I commit to writing the data-protection posture down — lawful basis, retention, processors, an impact assessment underway — and having it reviewed by external counsel.",
      },
      {
        label: "Reporting",
        body: "A short written monthly report of what shipped, so you can see delivery rather than take my word for it.",
      },
      {
        label: "After a round closes",
        body: "The first engineers hired within the agreed period, with my time continuing at the agreed level. If you ever want me full-time and exclusive, that is a separate conversation with a competitive package attached.",
      },
    ] satisfies Point[],
  },

  next: {
    title: "What happens next",
    body: [
      "Read this and tell me where you disagree — any line. Then the three of us talk it through, ideally within the next couple of weeks. Once we have agreed the commercial points between ourselves, a Belgian corporate lawyer papers the shareholders’ agreement, the services agreement and the share issue, and we sign everything on the same day.",
      "This is not an ultimatum; it is simply the terms on which I would say yes.",
    ],
  },

  working: {
    title: "The numbers, so you can check them",
    body: [
      "My rate is €120 per hour, invoiced — €960 for an eight-hour day. It is what my clients pay today.",
      "Two days a week is roughly 92 working days a year. Unbilled, that is about €88,000 of fees I will not charge in the first year. That is what “no cash before funding” costs me, and what the 10% pays for.",
      "As I understand it, the cash invested in the company to date is €50,000, for 50% — to be confirmed at disclosure.",
      "On our call, 5% was mentioned against a €2.5 million valuation — €125,000 on paper. No round exists yet, so I have deliberately priced nothing in this document off that valuation.",
      "The vesting arithmetic: 10% over 48 months is about 0.21% per month; nothing vests before month twelve, then 2.5% at once, then monthly.",
    ],
  },
} as const;
