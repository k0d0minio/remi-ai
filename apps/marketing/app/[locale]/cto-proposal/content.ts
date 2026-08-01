/**
 * The founding-CTO proposal, as data.
 *
 * Deliberately NOT in `lib/content/` with the public dictionaries: this is a
 * single-locale private document, not marketing copy, and forcing it through
 * the bilingual `Content` type would make a French translation a compile-time
 * requirement for a page only three people will ever read. If a French version
 * is wanted later, it belongs beside this file, not in the site dictionary.
 *
 * Every figure here is a negotiating position, not a fact about the company.
 * The three constants below are the ones most likely to need changing before
 * this is sent.
 */

/** Whoever sends this. Shown in the header and the sign-off. */
export const author = "Jamie Nisbet";

/** The date printed on the document. */
export const preparedOn = "31 July 2026";

/**
 * The date service equity is backdated to — when work on the platform actually
 * started. The repository history was reinitialised, so this cannot be derived
 * and must be set by hand.
 */
export const workStartedOn = "1 August 2025";

export type Term = { label: string; value: string; note?: string };
export type Point = { label: string; body: string };
/** `body` is readonly so the `as const` arrays below satisfy it unchanged. */
export type Clause = { title: string; body: readonly string[] };
export type Objective = { horizon: string; objective: string; measure: string };

export const proposal = {
  meta: {
    title: "Founding CTO — proposal",
    description:
      "A private proposal for the founding CTO role at Remi AI, prepared for Arnaud and Morgane.",
  },

  header: {
    eyebrow: "Private — not for distribution",
    title: "Founding CTO",
    lead: "A proposal for the terms on which I would join Remi AI as founding CTO — the role as it actually is, the compensation that reflects it, and the conditions that make it work for all three of us.",
    preparedFor: "Prepared for Arnaud and Morgane",
  },

  disclaimer: {
    title: "This document is a proposal, not a contract",
    body: "Nothing here binds anyone. It is written to be argued with — line by line, if that is useful. Figures are indicative and every legal and tax point below should be confirmed by a Belgian corporate lawyer and by accountants on both sides before anything is signed.",
  },

  headline: {
    title: "The proposal at a glance",
    lead: "The detail and the reasoning follow. This is the shape of it.",
    terms: [
      {
        label: "Role",
        value: "Founding CTO — sole owner of the technical function",
      },
      {
        label: "Equity",
        value: "25% of the fully diluted share capital, in two tranches",
        note: "Measured at the close of the first funding round",
      },
      {
        label: "Tranche A — 10%",
        value: "Issued against the contribution of the existing platform",
        note: "Fully vested on issue: the work is already done",
      },
      {
        label: "Tranche B — 15%",
        value: "Service equity, vesting monthly over four years",
        note: `Backdated to ${workStartedOn}, no cliff`,
      },
      {
        label: "Cash before funding",
        value: "None",
        note: "I am not asking the company for money it does not have",
      },
      {
        label: "Deferred fee",
        value: "€450 per day worked, accruing, capped at €90,000",
        note: "Against a €650 market rate — the difference is my contribution",
      },
      {
        label: "Deferred fee settlement",
        value:
          "Converts into the round at a 25% discount, or is repaid in cash, at my election",
      },
      {
        label: "Cash from funding",
        value: "€650 per day excl. VAT, full-time, from the close of the round",
        note: "Reviewed at Series A against the Belgian market",
      },
      {
        label: "Commitment now",
        value: "A minimum of two and a half days a week",
      },
      {
        label: "Commitment after funding",
        value: "Full-time and exclusive within 30 days of close",
      },
      {
        label: "Control",
        value:
          "Consent rights over reserved matters; sole authority over the technical function",
      },
      {
        label: "Intellectual property",
        value:
          "The existing platform is contributed to the company; transfer completes when the shares are issued",
      },
    ] satisfies Term[],
  },

  starting: {
    title: "Where we are",
    body: [
      "The terms discussed so far are 5% of the company and no compensation of any kind until the first round, which Arnaud values at €2.5 million. I want to take that seriously rather than dismiss it, so here is what it is worth in plain numbers.",
      "5% at a €2.5 million valuation is €125,000 of paper. It is unvested, illiquid, contingent on a round that has not happened, and worth nothing at all if that round never closes. Set against roughly eighteen months of carrying the entire engineering function, and against a platform that already exists and was built unpaid, it prices the work I have already delivered at approximately its face value and everything that comes after it at zero.",
      "The constraint behind the offer is real and I respect it: there is no cash flow, and I am not asking the company to invent any. But that constraint cuts both ways. If cash cannot carry any of the compensation, then equity has to carry all of it — and 5% does not.",
    ],
  },

  role: {
    title: "What the role actually is",
    lead: "Not a job description. This is the list of things that stop happening if nobody does them.",
    duties: [
      {
        label: "The entire engineering function",
        body: "There is no team. Until there is money to hire one, every line of code, every deployment, every incident and every architectural decision is mine. This is not a CTO managing engineers; it is a CTO who is also the engineering department.",
      },
      {
        label: "The platform itself",
        body: "Five surfaces — the product, the public site, internal operations, the reference documentation and the prototype sandbox — over a shared design system and a services layer, kept coherent as the product changes underneath them.",
      },
      {
        label: "Health data and GDPR",
        body: "Remi handles data about people’s health, which is special-category data under Article 9 GDPR. Lawful basis, data minimisation, retention, the DPIA, processor agreements, hosting location, subject-access and breach procedure — these are design decisions taken at the architecture level, and getting them wrong is an existential risk to the company rather than a compliance chore.",
      },
      {
        label: "Regulatory posture",
        body: "Judging whether and when the product crosses from wellness tooling into medical-device territory under the MDR, and building so that the answer can change without the platform having to be rewritten.",
      },
      {
        label: "Infrastructure, cost and availability",
        body: "Hosting, the cost curve per active practitioner, uptime, backups, disaster recovery, and the on-call that comes with running a service clinicians depend on.",
      },
      {
        label: "Technical due diligence at the round",
        body: "Investors will interrogate the code, the IP chain, the data posture and the cost model. That is not a document someone else can write, and a weak answer moves the valuation.",
      },
      {
        label: "Hiring and leading the team",
        body: "Once there is funding: defining the roles, recruiting, and being accountable for whether those people ship.",
      },
      {
        label: "Build, buy and vendor decisions",
        body: "Every dependency taken on is a cost and a risk the company carries for years. Choosing them, and being answerable for the choices.",
      },
    ] satisfies Point[],
    closing:
      "Morgane’s domain expertise and customer access are genuinely rare, and Arnaud’s capital is what made a company exist at all. Neither converts into a business without a platform. There is no version of Remi AI where this role is filled badly and the company still works.",
  },

  built: {
    title: "What already exists",
    body: [
      "This is not a proposal to start building. A substantial platform is already written, and it was written before any agreement, in unpaid time.",
    ],
    inventory: [
      {
        label: "A monorepo with five applications",
        body: "The product, the public bilingual marketing site, internal operations, a documentation site and a prototype sandbox — sharing infrastructure rather than duplicating it.",
      },
      {
        label: "A design system",
        body: "A tokenised component library with a client and a server surface, so a change to the brand or the type scale lands everywhere at once instead of being retyped per app.",
      },
      {
        label: "A services layer built as seams",
        body: "Storage, email and AI each behind an interface with a registration point, so committing to a vendor later means writing one adapter rather than rewriting every caller. This is the difference between a prototype and something an investor can be shown.",
      },
      {
        label: "A delivery pipeline",
        body: "Six gated stages from scope to ship, with the checks owned by CI rather than by whoever happens to be at the keyboard. It is what makes the company able to add engineers later without slowing down.",
      },
    ] satisfies Point[],
    ownership: [
      "One thing needs saying directly, because leaving it unsaid would be worse. Under both Belgian and Portuguese law, a freelancer keeps the intellectual property in what they write unless it is assigned in writing. Nothing has been assigned. As things stand today the company does not own the platform it is built on.",
      "I raise this because I want to fix it, not to hold it over anyone. Tranche A is the fix: I contribute the platform to the company formally, as capital, and in exchange I receive shares. That is better for everybody than a handshake — the company gets clean title that survives investor diligence, and the shares are issued for identifiable consideration rather than as a gift, which is a materially better tax position for me and a cleaner cap table for you.",
    ],
  },

  arithmetic: {
    title: "The arithmetic",
    lead: "Three numbers decide whether 5% is defensible.",
    figures: [
      {
        label: "What exists is worth",
        value: "€85,000 – €125,000",
        body: "Roughly 130 to 190 senior days at a €650 Belgian freelance rate. Commissioned from an agency, the same scope is €150,000 to €250,000. That work is delivered and unbilled.",
      },
      {
        label: "Unbilled before the round",
        value: "≈ €62,000",
        body: "Two and a half days a week for an assumed nine months to close is about 95 days. At market rate that is fees I do not charge — of which €43,000 accrues as the deferred fee and the balance is simply given.",
      },
      {
        label: "What 5% is worth",
        value: "€125,000",
        body: "On paper, unvested, and only if the round closes at the assumed valuation. It does not cover what has already been built, let alone the eighteen months that follow.",
      },
    ],
    closing: [
      "The other side of the ledger matters too. Twenty additional percentage points at a €2.5 million valuation is €500,000 of notional value — paid in a currency the company can issue rather than one it does not have. The cash alternative is a CTO salary of roughly €143,000 a year, which is not available, plus the risk of finding someone who will take on health-data architecture, regulatory judgement and investor diligence at a discount and do it well.",
      "That is the trade I am proposing: the company keeps its cash, and pays in the thing it can print.",
    ],
  },

  structure: {
    title: "Proposed structure",
    lead: "Each element with the reason it is shaped that way.",
    clauses: [
      {
        title: "Equity — 25%, in two tranches",
        body: [
          "Tranche A, 10%, issued against a contribution in kind (inbreng in natura / apport en nature) of the existing platform. Under the Belgian Companies Code a contribution in kind to a BV/SRL requires a report from a statutory auditor (bedrijfsrevisor / réviseur d’entreprises). I propose we instruct one jointly and both accept the valuation, whatever it says. These shares are fully vested on issue, because the work they pay for is already finished.",
          "Tranche B, 15%, is service equity for everything that comes next. It vests monthly over 48 months, backdated to when work actually started, with no cliff. A cliff exists to prove that someone will turn up; a working platform has already proved it.",
          "Both tranches are measured on a fully diluted basis at the close of the first funding round. Splitting the number this way is deliberate: it separates what I have already done from what I still owe, so each part can be argued on its own merits rather than the whole thing turning into one number nobody can justify.",
        ],
      },
      {
        title: "Deferred fee — €450 per day, capped at €90,000",
        body: [
          "For every day worked before the round closes, €450 is recorded monthly as a deferred fee. That is against a €650 market rate; the €200 difference is not deferred, it is contributed. The company owes nothing before the round and the accrual is capped at €90,000, so it cannot become a liability that frightens an investor.",
          "At the close of the round, at my election: settled in cash from the proceeds, converted into round shares at a 25% discount to the round price, or any split of the two. The discount is the price of having carried the risk.",
          "If no round has closed within 24 months, the accrued balance falls due on terms agreed in advance, or converts at the last agreed valuation. It does not quietly evaporate. It also survives my departure as a good leaver — a year of unpaid work should not be forfeited by leaving.",
        ],
      },
      {
        title: "Cash from the close of the round",
        body: [
          "€650 per day excluding VAT, full-time, from the day funding lands. This is the market rate for a senior technical lead in Belgium, not a premium, and paying the CTO is one of the things a seed round is raised to do.",
          "Reviewed at Series A against the Belgian market for a CTO of a funded company.",
          "One backstop, because a round is not guaranteed: if no round closes but recurring revenue passes €15,000 a month, half the day rate starts. Success that arrives through customers rather than investors should not leave me working for nothing.",
        ],
      },
      {
        title: "Dilution before the round",
        body: [
          "25% is measured at the close of the first funding round, not on the day of signature. Any shares issued in between top my holding back up, so the number cannot be eroded before it becomes real.",
          "This is protection against pre-round issuance only. The round itself dilutes me exactly as it dilutes everyone, and so does an employee option pool of up to 10% created before the round — that comes out of all shareholders pro rata, mine included. I am not asking to be insulated from investors; I am asking that the figure agreed today still means what it says on the day it matters.",
        ],
      },
    ] satisfies Clause[],
  },

  control: {
    title: "Decision rights",
    lead: "No board seat is requested. What is requested is that a small number of decisions cannot be taken without me, and that the technical function is actually mine to run. Both sit in the shareholders’ agreement.",
    reservedTitle: "Reserved matters — my consent required",
    reserved: [
      "Issuing shares, options, warrants or convertible instruments",
      "Creating or altering share classes, or changing the rights attaching to mine",
      "Selling, merging, restructuring or winding up the company",
      "Borrowing above €50,000, or granting security over the company’s assets",
      "Engaging another CTO, technical lead or development agency",
      "Changing my role, title, scope or terms",
      "Licensing, selling or encumbering the company’s intellectual property",
      "Related-party transactions with any shareholder or connected person",
      "Moving the company’s registered office out of Belgium",
    ],
    authorityTitle: "Sole technical authority",
    authority: [
      "Architecture, technology stack, tooling, infrastructure and vendors",
      "The delivery process, the release schedule and what ships when",
      "Technical hiring — who is engaged and on what terms, within an agreed budget",
      "Security and data-protection design, including the Article 9 posture",
      "The right to refuse a delivery date that cannot be met safely, with a documented alternative offered in its place",
    ],
    informationTitle: "Information rights",
    information: [
      "Monthly management accounts",
      "The cap table on request, and notice of any change to it",
      "Notice of any term sheet, offer or approach within five working days",
    ],
  },

  vesting: {
    title: "Vesting, leavers and acceleration",
    clauses: [
      {
        title: "Vesting",
        body: [
          "Tranche A is fully vested on issue. Tranche B vests in 48 equal monthly instalments, backdated to the date work started, with no cliff.",
        ],
      },
      {
        title: "Good leaver",
        body: [
          "Resignation, removal without cause, illness, incapacity, death, or the company’s material breach of this agreement. A good leaver keeps every vested share. Unvested shares lapse — except on removal without cause or the company’s material breach, where twelve months of vesting accelerate.",
        ],
      },
      {
        title: "Bad leaver — exhaustively defined",
        body: [
          "Fraud, dishonesty, gross misconduct, a criminal conviction connected to the company, or a material breach not remedied within 30 days of written notice. Nothing else. A definition that can be widened later is not a definition.",
          "Even then, vested shares may only be bought back at fair value, not at nominal value. Compulsory transfer at nominal value applies in one circumstance only: proven fraud.",
        ],
      },
      {
        title: "Acceleration on a sale",
        body: [
          "Double trigger. If the company is sold and within twelve months I am terminated or my role is materially diminished, all unvested shares vest immediately. This exists so that an acquirer cannot reclaim the stake by removing me the week after closing.",
        ],
      },
    ] satisfies Clause[],
  },

  ip: {
    title: "Intellectual property",
    clauses: [
      {
        title: "Going forward",
        body: [
          "All intellectual property I create for the company transfers to the company, effective on issue of the shares.",
        ],
      },
      {
        title: "The existing platform",
        body: [
          "Transfers through the tranche A contribution in kind, at the auditor-certified value.",
          "If the shares are not issued within 60 days of signature, no transfer takes effect. In the meantime the company holds a revocable, non-exclusive licence to use the platform, so nothing stops while the paperwork is done.",
        ],
      },
      {
        title: "What stays mine",
        body: [
          "Generic tooling and personal libraries written before this engagement and not part of the contributed platform remain mine, licensed to the company perpetually, irrevocably and royalty-free. The company is never blocked by this; it simply does not acquire work it did not pay for.",
          "Third-party and open-source components stay under their own licences. I warrant, to the best of my knowledge, that the contributed code is free of third-party claims.",
        ],
      },
    ] satisfies Clause[],
  },

  commitment: {
    title: "What I commit to in return",
    lead: "The terms above are one half of a bargain. This is the other half.",
    points: [
      {
        label: "Time, now",
        body: "A minimum of two and a half days a week until the round closes, worked on an agreed and visible schedule.",
      },
      {
        label: "Time, after funding",
        body: "Full-time and exclusive within 30 days of close. Every other client engagement ends.",
      },
      {
        label: "No competing work",
        body: "No engagement with a competing product in this market, at any point, funded or not.",
      },
      {
        label: "The company’s technical face",
        body: "Named CTO for investors, customers and partners. I run technical due diligence, I sit in the investor conversations, and I answer for the platform in public.",
      },
      {
        label: "Reporting",
        body: "A written monthly report against the objectives below, with evidence rather than assertion. If I am not delivering, you should be able to see it from the report rather than hear it from me.",
      },
    ] satisfies Point[],
  },

  objectives: {
    title: "Objectives",
    lead: "Equity this size should be answerable to something. These are the commitments I am willing to be judged against, and they are meant to be argued with and made harder where they are too soft.",
    rows: [
      {
        horizon: "First 90 days",
        objective:
          "A pilot-ready product in the hands of the first practitioner cohort",
        measure:
          "The cohort using it on real work; staging and production environments live; the delivery pipeline running end to end",
      },
      {
        horizon: "First 90 days",
        objective: "The data-protection posture written down, not assumed",
        measure:
          "Lawful basis, retention schedule, subprocessor list and a started DPIA, reviewed by external counsel",
      },
      {
        horizon: "To the round",
        objective: "A platform that carries the pilot without drama",
        measure: "99.5% availability in business hours, measured and published",
      },
      {
        horizon: "To the round",
        objective: "A data room that survives technical diligence",
        measure:
          "Architecture, IP chain, subprocessors and cost model complete, plus a costed twelve-month engineering plan",
      },
      {
        horizon: "Year one after funding",
        objective: "An engineering team that is not just me",
        measure:
          "First two engineers hired, shipping independently within 60 days of joining",
      },
      {
        horizon: "Year one after funding",
        objective: "Delivery speed and unit economics moving the right way",
        measure:
          "Time from merge to production under one day; infrastructure cost per active practitioner tracked and falling",
      },
      {
        horizon: "Ongoing",
        objective: "No incident involving special-category data",
        measure: "Zero reportable breaches under Article 33 GDPR",
      },
    ] satisfies Objective[],
  },

  contracting: {
    title: "Contracting, tax and structure",
    lead: "Flagged rather than resolved. Each of these needs a professional to confirm it before signature, and the answers may change the mechanics — though not the substance — of what is proposed above.",
    points: [
      {
        label: "I contract as an independent",
        body: "Self-employed (indépendant / zelfstandige), invoicing the company for services. Not an employee, and this proposal is not a request for employment.",
      },
      {
        label: "Cross-border tax needs checking",
        body: "I am a Portuguese freelancer holding Belgian nationality. Where I am tax resident determines how both the shares and the fees are taxed, in Belgium and in Portugal, and the two do not necessarily agree. This should be confirmed by an accountant in each country before signature — it may affect the timing of the share issue, not whether it happens.",
      },
      {
        label: "False self-employment",
        body: "Belgian law tests whether a contractor is genuinely autonomous (the schijnzelfstandigheid / faux indépendant test). The technical-authority clause above is not only a negotiating point; it is part of what makes the contracting structure hold up.",
      },
      {
        label: "Why shares for a contribution beat free shares",
        body: "Shares issued against an auditor-certified contribution are consideration for an asset. Shares handed over for services can be treated as professional income and taxed as such, at a valuation the company itself has been quoting at €2.5 million. The contribution-in-kind route is not a technicality — it is the difference between a clean transaction and an avoidable tax bill.",
      },
      {
        label: "VAT",
        body: "Invoiced with Belgian VAT or under the reverse charge depending on where I am established. The accountant decides; it changes the paperwork, not the amounts.",
      },
      {
        label: "Costs",
        body: "The company bears the cost of the auditor’s report and the corporate legal work, as it would for any capital increase.",
      },
    ] satisfies Point[],
  },

  conditions: {
    title: "Conditions to be satisfied",
    lead: "Before signature, or at signature. None of these is unusual; all of them are the kind of thing that is painful to discover afterwards.",
    items: [
      "Full disclosure of the current cap table, the articles of association, and any existing shareholders’ agreement, convertible instrument, loan or security",
      "The shareholders’ agreement and the services agreement executed at the same time as the share issue — not one before the other",
      "The share issue registered in the share register and the UBO register within 30 days",
      "Written confirmation that no other party has been engaged or promised the technical role",
      "Agreement in writing on the size of the employee option pool and how it dilutes",
      "Confirmation that the company holds, or is acquiring, the rights to any material it did not create — brand assets, content, third-party work",
    ],
  },

  alternative: {
    title: "If we cannot agree",
    body: [
      "I would rather build this than not. Morgane has found something real, Arnaud has backed it, and I have already spent months on it without being asked to. That is not the position of someone looking for a reason to walk.",
      "But it is worth being plain about what the alternative looks like, because pretending there isn’t one helps nobody. If we cannot land on terms that reflect the role, I do not disappear — I continue as a paid contractor at market rate, or I do neither, and the platform stays where it is. I would prefer both of those outcomes considerably less than being a founder here.",
      "I also want to say something about the other candidate, since we all know they exist. I have no argument with you talking to them, and I would rather you chose someone else than said yes to me and resented it. The question this document is trying to answer is not who wants the job most. It is whether the terms match what the job actually is.",
    ],
  },

  nextSteps: {
    title: "Next steps",
    steps: [
      "You read this and come back with what you disagree with. Line by line is fine — most of it is negotiable and I have tried to explain the reasoning so you can attack the reasoning rather than the number.",
      "The three of us settle the commercial points between ourselves, before any lawyer is involved and while it is still cheap to change our minds.",
      "A Belgian corporate lawyer papers the shareholders’ agreement, the services agreement and the capital increase. A statutory auditor produces the contribution report.",
      "Signature and share issue on the same day.",
    ],
    decision:
      "I would like a decision in principle within fourteen days of you receiving this — not as pressure, but because I am currently doing the work of a founder on the terms of a volunteer, and that is not a stable arrangement for anyone.",
  },
} as const;
