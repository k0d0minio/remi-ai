import {
  ChefHat,
  Clock,
  Compass,
  EyeOff,
  Flag,
  Footprints,
  KeyRound,
  LineChart,
  ListChecks,
  Lock,
  NotebookPen,
  ScrollText,
  ShieldCheck,
  ShieldOff,
  Stethoscope,
  TrendingDown,
  UtensilsCrossed,
} from "lucide-react";
import type { Content } from "./types";

/**
 * The English dictionary. Every claim here survives the test in
 * apps/marketing/AGENTS.md: the product is pre-launch, so the site sells the
 * pilot programme and what is being built — never functionality as if it were
 * live. The three statistics carry their sources; the partnership with
 * Dr Mouton / FunMedDev is real and confirmed by the founders. There is no
 * pricing (none is decided), no testimonials, and no invented traction.
 */
export const en: Content = {
  nav: [
    { href: "/practitioners", label: "For practitioners" },
    { href: "/individuals", label: "For you" },
    { href: "/trust", label: "Trust and data" },
    { href: "/about", label: "About" },
  ],

  header: {
    homeLabel: "home",
    contact: "Contact",
    cta: { href: "/contact", label: "Join the pilot" },
    signIn: "Sign in",
    menuLabel: "Menu",
  },

  footer: {
    tagline:
      "The wellness copilot that extends a practitioner's guidance between consultations.",
    disclaimer:
      "REMI helps people apply their practitioner's recommendations. It does not diagnose, treat, or replace professional care — anything clinical belongs with your practitioner.",
    navLabel: "Footer",
    support: "Support centre",
    signIn: "Sign in",
  },

  home: {
    meta: {
      title: "The wellness copilot between consultations",
      description:
        "REMI is being built with health practitioners: it turns their recommendations into daily meals, habits and small steps — and keeps the practitioner in the loop.",
    },
    hero: {
      eyebrow: "In development · first pilot cohort forming",
      title: "Between two consultations, everything is at stake.",
      subtitle:
        "People leave a consultation knowing what to do — then everyday life takes over. REMI is a wellness copilot being built with health practitioners: it turns their recommendations into meals, habits and small steps, and keeps the practitioner in the loop.",
      actions: [
        {
          href: "/practitioners",
          label: "I'm a practitioner",
          variant: "primary",
        },
        {
          href: "/individuals",
          label: "I'm working with one",
          variant: "outline",
        },
      ],
    },
    stats: {
      eyebrow: "Why it matters",
      title: "The gap between advice and daily life is not a detail",
      note: "These figures describe the problem, not REMI's results — REMI has no results to claim yet, and this site will never invent any.",
      items: [
        {
          value: "3 in 4",
          label:
            "deaths worldwide are linked to noncommunicable diseases such as diabetes and heart disease",
          source: "WHO fact sheet, 2024",
        },
        {
          value: "1 in 8",
          label: "people worldwide were living with obesity in 2022",
          source: "WHO, 2024",
        },
        {
          value: "~50%",
          label:
            "average adherence to long-term therapies in high-income countries — lower elsewhere",
          source: "WHO, Adherence to long-term therapies, 2003",
        },
      ],
    },
    audience: {
      eyebrow: "Two sides, one loop",
      title: "Built for the practitioner and the person they support",
      cards: [
        {
          href: "/practitioners",
          title: "You advise. REMI helps them apply.",
          body: "Your recommendations deserve better than being forgotten by Thursday.",
          bullets: [
            "Turn consultation notes into clear, structured recommendations",
            "Give daily support you cannot personally provide between sessions",
            "See what is working — and what is not — before the next consultation",
          ],
          cta: "What we're building for practitioners",
        },
        {
          href: "/individuals",
          title: "Advice you can finally live with.",
          body: "Not another diet app — a companion for the plan you already have.",
          bullets: [
            "Meal ideas that follow the recommendations you were given",
            "One small step at a time, at your pace",
            "Your practitioner stays the reference, and stays informed",
          ],
          cta: "What REMI will do for you",
        },
      ],
    },
    vision: {
      eyebrow: "What we're building",
      title: "The product taking shape",
      lead: "REMI is in active development with its first practitioners. This is what it is being designed to do — and nothing here will be sold as live before it genuinely works.",
      items: [
        {
          icon: NotebookPen,
          title: "From notes to a clear plan",
          body: "Practitioners write recommendations the way they always have. REMI structures them into a plan a person can actually follow at home.",
          intent: "primary",
        },
        {
          icon: UtensilsCrossed,
          title: "Meal ideas that follow the plan",
          body: "Suggestions and recipes aligned with the practitioner's recommendations and the person's tastes, routine and constraints.",
          intent: "success",
        },
        {
          icon: Footprints,
          title: "Small steps, in order",
          body: "No overhaul on day one. One change at a time, at the person's rhythm, so the change has a chance of lasting.",
          intent: "info",
        },
        {
          icon: LineChart,
          title: "Visibility between consultations",
          body: "Practitioners see progress, sticking points and engagement — so the next consultation starts from evidence instead of recall.",
          intent: "info",
        },
        {
          icon: Stethoscope,
          title: "The practitioner stays the reference",
          body: "REMI applies; it never prescribes. The practitioner remains the one who decides, and REMI works strictly within their recommendations.",
          intent: "primary",
        },
        {
          icon: ShieldCheck,
          title: "Privacy by design",
          body: "A Belgian company under GDPR. Data collection kept to what the accompaniment needs, never sold, never shared without consent.",
          intent: "neutral",
        },
      ],
    },
    roadmap: {
      eyebrow: "Roadmap",
      title: "What we are building next",
      lead: "A direction, not a delivery schedule. None of it is available today, and the order is decided with the pilot practitioners rather than announced to them.",
      columns: [
        {
          icon: ListChecks,
          status: "In development",
          title: "Now",
          body: "The core loop, being built with the first pilot practitioners.",
          items: [
            "Turning a practitioner's recommendations into a plan a person can follow at home",
            "Meal ideas and recipes that stay inside that plan",
            "One small step at a time, at the person's own rhythm",
            "Progress signals the practitioner can read before the next consultation",
          ],
        },
        {
          icon: Compass,
          status: "Designed, not built",
          title: "Next",
          body: "Shaped with the pilot cohort, and next in line once the core loop holds.",
          items: [
            "Secure messaging between a practitioner and the people they support",
            "Logging a meal from a photo, so a day is recorded in seconds rather than abandoned",
            "Drafting a plan from consultation notes, for the practitioner to correct and approve",
          ],
        },
        {
          icon: Flag,
          status: "On the horizon",
          title: "Later",
          body: "Intentions we are designing towards, with no date attached to any of them.",
          items: [
            "Labs and biomarkers on a timeline, read alongside the plan they informed",
            "Wearables, where the signal is genuinely worth the noise",
            "Clinics with several practitioners around one person, each seeing their own part",
          ],
        },
      ],
      note: "A line moving from later to next is a conversation with the pilot cohort, not a promise to the market. Ask us where any of it stands — the honest answer is easier to give than the polished one.",
    },
    steps: {
      eyebrow: "How it will work",
      title: "One loop, three moments",
      items: [
        {
          title: "Your practitioner recommends",
          body: "The consultation happens exactly as it does today. The practitioner sets the direction and the recommendations — REMI changes nothing about that.",
        },
        {
          title: "REMI translates",
          body: "Recommendations become concrete daily actions: what to cook tonight, what to pick at the shop, which habit to start this week.",
        },
        {
          title: "Progress flows back",
          body: "Day after day the person is supported, and the practitioner sees how it is going — so the next session adjusts the plan instead of rebuilding it.",
        },
      ],
    },
    partnership: {
      eyebrow: "First partnership",
      title: "Co-designed with functional medicine",
      body: "REMI is developed in partnership with Dr Georges Mouton, founder of the FunMedDev clinic and a European reference in functional medicine. The partnership shapes how REMI translates a practitioner's recommendations into daily guidance, so the accompaniment aligns with real clinical protocols rather than generic advice.",
      points: [
        "A signed partnership with the FunMedDev clinic",
        "REMI's accompaniment co-designed with Dr Mouton's expertise",
        "FunMedDev patients among the first pilot users",
      ],
      quote:
        "Personalisation — that is the word. And AI can support personalisation.",
      quoteAuthor: "Dr Georges Mouton",
      quoteRole: "Founder, FunMedDev — in conversation with the REMI team",
    },
    faq: {
      eyebrow: "FAQ",
      title: "The honest answers first",
      items: [
        {
          id: "available",
          question: "Can I use REMI today?",
          answer:
            "Not yet. REMI is in development and launches with a small pilot cohort of practitioners first. If you want in — as a practitioner or as someone who would like their practitioner involved — get in touch and we will keep you posted.",
        },
        {
          id: "replace",
          question: "Does REMI replace my practitioner?",
          answer:
            "No, and it never will. The practitioner diagnoses, decides and remains the reference. REMI only helps apply what the practitioner has recommended, in daily life, between consultations.",
        },
        {
          id: "medical",
          question: "Is REMI medical advice?",
          answer:
            "No. REMI is a wellness companion that works from your practitioner's recommendations. It does not diagnose, treat or make clinical decisions — anything clinical belongs in a consultation.",
        },
        {
          id: "data",
          question: "What happens to my data?",
          answer:
            "REMI is built by a Belgian company under GDPR. The commitment we are building to: collect only what the accompaniment needs, never sell it, never share it without your consent, and let you export or delete it.",
        },
        {
          id: "price",
          question: "How much will it cost?",
          answer:
            "Pricing is not decided. It is being worked out honestly with the first pilot practitioners, and until it is settled you will not find a number on this site. Ask us where things stand — we will tell you.",
        },
      ],
    },
    cta: {
      title: "Help shape the first version",
      body: "We are looking for a small group of practitioners to build REMI with — and for people who want their practitioner to hear about it.",
      action: { href: "/contact", label: "Get in touch" },
    },
  },

  practitioners: {
    meta: {
      title: "For practitioners — the copilot between your consultations",
      description:
        "REMI is being built to structure your recommendations, support your clients daily, and show you what happens between sessions. A pilot cohort of 15 practitioners is forming.",
    },
    hero: {
      eyebrow: "For practitioners",
      title: "Your consultations change lives. Then comes the gap.",
      subtitle:
        "Between two sessions, the people you support are on their own — and much of what you recommended dissolves into daily life. REMI is being built to close that gap without adding to your workload.",
      actions: [
        { href: "/contact", label: "Apply for the pilot", variant: "primary" },
        { href: "/about", label: "Who is behind REMI", variant: "outline" },
      ],
    },
    pains: {
      eyebrow: "The problem",
      title: "Three things every practitioner knows too well",
      items: [
        {
          icon: Clock,
          title: "Writing up takes time",
          body: "Turning a consultation into clear, structured, personalised recommendations is real work — repeated for every single person you support.",
          intent: "warning",
        },
        {
          icon: EyeOff,
          title: "Then you go blind",
          body: "Between sessions you have no view of what is applied, what is misunderstood, and where someone silently gives up.",
          intent: "warning",
        },
        {
          icon: TrendingDown,
          title: "Motivation fades fast",
          body: "The energy of the consultation rarely survives the second week alone. By the next session, too much ground has been lost.",
          intent: "warning",
        },
      ],
    },
    vision: {
      eyebrow: "What we're building for you",
      title: "Designed to give you time and visibility",
      lead: "This is the practitioner side of REMI as it is being developed with the pilot cohort — described as intent, not as a live feature list.",
      items: [
        {
          icon: NotebookPen,
          title: "Recommendations, structured",
          body: "Start from your raw notes; REMI helps turn them into a clear, shareable plan that stays faithful to your approach.",
          intent: "primary",
        },
        {
          icon: UtensilsCrossed,
          title: "Daily accompaniment, from your plan",
          body: "Meal suggestions and small steps generated strictly within your recommendations — you set the frame, REMI works inside it.",
          intent: "success",
        },
        {
          icon: LineChart,
          title: "See between the sessions",
          body: "Progress, difficulties and engagement, visible at a glance — so consultations start from what actually happened.",
          intent: "info",
        },
        {
          icon: Stethoscope,
          title: "Adjust without waiting",
          body: "When something is not working, refine the guidance remotely instead of losing the weeks until the next appointment.",
          intent: "primary",
        },
      ],
    },
    pilot: {
      eyebrow: "The pilot programme",
      title: "A first cohort of 15 practitioners",
      body: "REMI's first version is being built with a deliberately small group. Pilot practitioners are not beta testers on a mailing list — they shape what gets built, every two weeks, with the founders.",
      includedTitle: "What the pilot includes",
      included: [
        "Early access to each part of REMI as it becomes real",
        "Direct exchanges with the founding team",
        "Genuine influence on what is built, and in what order",
        "Your practice's approach reflected in how REMI guides your clients",
      ],
      conditionsTitle: "How it works",
      conditions: [
        "15 places, reviewed personally — we are looking for engaged practitioners, not sign-ups",
        "No commitment: leave the pilot whenever you want",
        "Your feedback is the point — expect us to ask for it",
      ],
      pricingNote:
        "Pilot terms, including pricing, are being finalised together with the first practitioners. Nothing is published here until it is real — ask us where things stand.",
      action: { href: "/contact", label: "Apply for the pilot" },
    },
    cta: {
      title: "Fifteen practitioners will shape this. Be one of them.",
      body: "Tell us about your practice and what happens to your recommendations after the consultation — that conversation is the application.",
      action: { href: "/contact", label: "Start the conversation" },
    },
  },

  individuals: {
    meta: {
      title: "For you — your practitioner's advice, made livable",
      description:
        "REMI is being built to turn your practitioner's recommendations into meals, habits and small steps that fit your real days — with your practitioner in the loop.",
    },
    hero: {
      eyebrow: "For you",
      title: "You know what to do. REMI helps you actually do it.",
      subtitle:
        "You leave a consultation full of good intentions — then shopping, work and 7pm happen. REMI is being built to support you between sessions, turning your practitioner's recommendations into things you can cook, choose and repeat.",
      actions: [
        { href: "/contact", label: "Keep me posted", variant: "primary" },
        {
          href: "/practitioners",
          label: "I'm a practitioner",
          variant: "outline",
        },
      ],
    },
    steps: {
      eyebrow: "How it will work",
      title: "REMI is used with your practitioner, not instead of them",
      items: [
        {
          title: "Your practitioner sets the direction",
          body: "Your recommendations come from a human who knows you — REMI never invents its own programme.",
        },
        {
          title: "REMI makes it daily",
          body: "Meal ideas, adapted recipes, one small step at a time — shaped to your tastes, routine and constraints.",
        },
        {
          title: "Your practitioner stays close",
          body: "Progress and difficulties reach your practitioner, so the next consultation picks up where you actually are.",
        },
      ],
    },
    vision: {
      eyebrow: "What we're building for you",
      title: "Support that fits real days",
      lead: "This is what REMI is being designed to do for the people practitioners support — in development now, live only when it truly works.",
      items: [
        {
          icon: UtensilsCrossed,
          title: "Meals that follow your plan",
          body: "Suggestions aligned with what your practitioner recommended — not a generic diet pulled from nowhere.",
          intent: "success",
        },
        {
          icon: ChefHat,
          title: "Recipes you will actually cook",
          body: "Adapted to your tastes, your time and what is in your kitchen — because the perfect recipe you skip helps nobody.",
          intent: "primary",
        },
        {
          icon: Footprints,
          title: "One step at a time",
          body: "Progressive change at your rhythm. Small wins that stack, instead of a January overhaul that collapses in March.",
          intent: "info",
        },
        {
          icon: Stethoscope,
          title: "Never alone with it",
          body: "Your practitioner sees how it is going and can adjust — you stop being on your own between appointments.",
          intent: "primary",
        },
      ],
    },
    status: {
      title: "Where REMI stands today",
      body: "REMI is not available yet. It launches first with a small group of practitioners and the people they support. If you would like your practitioner to be part of it — or simply want to know when REMI opens — leave us a message.",
    },
    cta: {
      title: "Want your practitioner in the loop?",
      body: "Tell us who supports you, or just ask to be kept posted — we will let you know when REMI opens.",
      action: { href: "/contact", label: "Leave a message" },
    },
  },

  about: {
    meta: {
      title: "About — the space between advice and real life",
      description:
        "REMI is built in Belgium by Morgane Paquet and Arnaud Ruelle, in partnership with Dr Georges Mouton (FunMedDev), on one conviction: the hard part is not knowing, it is applying.",
    },
    intro: {
      eyebrow: "About REMI",
      title: "The space between advice and real life",
      lead: "Change does not happen in the consultation room. It happens at the supermarket, in the kitchen, at 7pm on a Tuesday.",
      body: "REMI — Reprise En Main Individualisée, roughly “an individualised fresh start” — exists to fill the space between a practitioner's advice and the daily life it lands in. The name is French because the company is: REMI is built in Belgium, first for francophone practitioners and the people they support, with the practitioner kept firmly at the centre.",
    },
    team: {
      eyebrow: "Who is building it",
      title: "Two founders, one conviction",
      members: [
        {
          name: "Morgane Paquet",
          role: "Co-founder — product & nutrition",
          bio: "Training in naturopathy and nutritherapy, and driven by how habits actually change — not how they should.",
          quote:
            "The greatest challenge is not knowing what to do. It is managing to apply it, durably.",
          initials: "MP",
        },
        {
          name: "Arnaud Ruelle",
          role: "Co-founder — strategy & development",
          bio: "Entrepreneurial background, building the company and the product platform behind REMI.",
          quote:
            "Technology should give practitioners more time, and the people they support more support.",
          initials: "AR",
        },
      ],
    },
    partnership: {
      eyebrow: "Partnership",
      title: "Built with functional medicine from day one",
      body: "REMI's first partnership is with Dr Georges Mouton, founder of the FunMedDev clinic and a European reference in functional medicine. His expertise shapes how REMI turns practitioner recommendations into daily accompaniment, and FunMedDev patients will be among the first pilot users.",
      points: [
        "A signed partnership with the FunMedDev clinic",
        "The accompaniment co-designed with Dr Mouton's expertise",
        "Pilot deployment planned with FunMedDev patients",
      ],
      quote:
        "Personalisation — that is the word. And AI can support personalisation.",
      quoteAuthor: "Dr Georges Mouton",
      quoteRole: "Founder, FunMedDev — in conversation with the REMI team",
    },
    principles: {
      eyebrow: "How we work",
      title: "Three commitments this site is held to",
      items: [
        {
          title: "The practitioner stays the reference",
          body: "REMI amplifies a practitioner's work; it never replaces it. If a feature would blur that line, it does not get built.",
        },
        {
          title: "Only claims that are true",
          body: "No invented testimonials, no numbers without sources, no features sold before they exist. What you read here is checkable.",
        },
        {
          title: "Privacy by design",
          body: "A Belgian company under GDPR. Health-adjacent data deserves the strictest treatment there is, from the first line of code.",
        },
      ],
    },
    cta: {
      title: "Talk to the people building it",
      body: "Practitioner, future user, partner or just curious — we answer ourselves.",
      action: { href: "/contact", label: "Contact us" },
    },
  },

  trust: {
    meta: {
      title: "Trust and data — GDPR, residency and the practitioner's frame",
      description:
        "How REMI treats health-adjacent data: GDPR by design, the intent to keep personal data in the EU, the practitioner-controlled frame as the safety model, and a plain list of what REMI never does.",
    },
    intro: {
      eyebrow: "Trust and data",
      title: "Built to be trusted with the space around a consultation",
      lead: "REMI sits next to a clinical relationship — a practitioner's recommendations, and a person's daily life. That only works if the data question is answered before the first client is onboarded, not after.",
      body: "This is the honest version: what is decided, what is intent, and what has not been chosen yet. Every commitment here is one you can hold us to in the pilot conversation, and none of it is a certification we do not have.",
    },
    status: {
      title: "Where REMI stands today",
      body: "REMI is pre-launch. No client data is being processed, no storage vendor is committed, and no certification has been obtained — or claimed. What follows is how the product is being designed: the commitments come first, so the architecture can be held to them.",
    },
    commitments: {
      eyebrow: "GDPR by design",
      title: "Six decisions taken before the first record exists",
      lead: "Protection built in while the schema is still being designed is a different product from protection retrofitted after launch. REMI is built by a Belgian company, so GDPR is the floor here, not the ambition.",
      items: [
        {
          icon: ShieldCheck,
          title: "GDPR is the starting point",
          body: "Lawful basis, purpose limitation and a person's rights over their own data are design inputs to each feature — not a checklist run once, shortly before launch.",
          intent: "primary",
        },
        {
          icon: Lock,
          title: "Collect less than we could",
          body: "Only what the accompaniment actually needs. A field that would be interesting to have, but is not needed to help someone, does not get collected.",
          intent: "neutral",
        },
        {
          icon: KeyRound,
          title: "Access follows the care relationship",
          body: "A practitioner sees the people they support, and nobody else. Access is scoped to the relationship that justifies it, and ends when that relationship does.",
          intent: "info",
        },
        {
          icon: ShieldOff,
          title: "Never sold, never a training set",
          body: "Personal data is not sold, not traded, and not used to train models that serve anyone but the person it belongs to. That is a product decision, not a setting.",
          intent: "success",
        },
        {
          icon: ScrollText,
          title: "Written down, not assumed",
          body: "What is stored, why, for how long and who processes it — recorded as it is built. Sub-processors get named: a vendor we cannot describe is a vendor we do not use.",
          intent: "info",
        },
        {
          icon: Stethoscope,
          title: "Clinical data stays clinical",
          body: "REMI is not the medical record. Diagnoses, prescriptions and clinical history stay in the practitioner's own system; REMI works from the recommendations that come out of it.",
          intent: "primary",
        },
      ],
    },
    residency: {
      eyebrow: "Data residency",
      title: "The intent: personal data stays in the EU",
      lead: "No storage vendor is committed yet. That is deliberate — and it is exactly why residency can still be a selection criterion rather than a migration project.",
      items: [
        "Personal data hosted in the EU, with a Belgian or other EU region as the default for the pilot",
        "Storage is a seam in the codebase rather than a vendor lock-in — choosing a provider means writing one adapter, so residency stays a decision we can make on the merits",
        "Any processing that would leave the EU — an AI provider, for instance — named, documented and justified before it happens, never discovered afterwards",
        "Where a transfer is unavoidable, the safeguards GDPR requires, written into the record rather than into a footnote",
      ],
      note: "This is intent, and worth what a written intent is worth. When the vendor is chosen, this section gets a name, a region and a date — and if the answer turns out differently, this page changes rather than quietly staying the same.",
    },
    frame: {
      eyebrow: "The safety model",
      title: "The practitioner's frame is the safety mechanism",
      lead: "The usual answer to a health AI's safety question is a longer filter list. Ours is structural: REMI holds no clinical opinion of its own, and everything it says has to sit inside a frame the practitioner set.",
      items: [
        {
          title: "The practitioner sets the frame",
          body: "What may be suggested, what must be avoided, and for whom. The frame comes out of the consultation, belongs to the practitioner, and can be tightened at any moment.",
        },
        {
          title: "REMI works strictly inside it",
          body: "Meals, steps and encouragement are generated within the frame. Outside it, REMI does not improvise: it says that it cannot, and points back to the practitioner.",
        },
        {
          title: "Anything clinical goes back to the human",
          body: "A symptom, a medication question, something that has changed — REMI routes it to the practitioner instead of answering it. And what REMI has suggested stays visible to the practitioner, so it can be corrected rather than discovered.",
        },
      ],
    },
    never: {
      eyebrow: "The limits",
      title: "What REMI never does",
      lead: "Product boundaries, not caveats buried in a terms page. If a feature would blur one of these lines it does not get built — and the same commitment sits at the bottom of every page on this site.",
      items: [
        "Never diagnoses. REMI forms no clinical opinion and offers none.",
        "Never treats or prescribes. No dosages, no supplements of its own initiative, no change to anything a practitioner or doctor has set.",
        "Never replaces professional care. It is a wellness companion between consultations, built to send people back to their practitioner rather than to keep them in an app.",
        "Never invents its own programme. Without a practitioner's recommendations behind it, there is no plan for REMI to support.",
        "Never turns a person's data into someone else's product. Not sold, not traded, not a training set.",
      ],
    },
    questions: {
      eyebrow: "Questions we welcome",
      title: "The questions that make this conversation useful",
      lead: "These are what practitioners, clinics and legal teams ask, and not one of them is unwelcome. Where the answer is not decided yet, you get “not decided” and the reason — not a reassuring sentence.",
      items: [
        "Where exactly will our patients' data live, and under whose control?",
        "What is sent to an AI model, to which provider, and what is deliberately kept out of it?",
        "Is REMI a medical device — and what would push it into that category?",
        "Can we sign a data processing agreement before a pilot starts?",
        "Who is responsible for what, between the clinic, the practitioner and REMI?",
        "What happens to our data if we stop — or if REMI does?",
      ],
    },
    cta: {
      title: "Ask us the hard one first",
      body: "The data question is easier to answer before a pilot than during one. Bring your DPO, your legal counsel, or your own list.",
      action: { href: "/contact", label: "Put a question to us" },
    },
  },

  contact: {
    meta: {
      title: "Contact",
      description:
        "Apply for the practitioner pilot, ask about REMI, or just say hello — the founders answer personally.",
    },
    eyebrow: "Contact",
    title: "Talk to us",
    lead: "Pilot applications, questions about REMI, partnerships or press — write to us and the founders answer personally. Please do not share personal health details here: this is not a clinical channel and we cannot advise on it.",
    people: [
      {
        name: "Morgane Paquet",
        role: "Co-founder — product & nutrition",
        email: "morgane@remiai.be",
        phone: "+32 486 12 46 83",
      },
      {
        name: "Arnaud Ruelle",
        role: "Co-founder — strategy & development",
        email: "arnaud@remiai.be",
        phone: "+32 486 16 31 55",
      },
    ],
    form: {
      name: "Your name",
      email: "Email",
      emailHint: "We reply to this address and nothing else.",
      message: "How can we help?",
      consent:
        "I agree that REMI may store this message in order to reply to it.",
      submit: "Send message",
      submitting: "Sending…",
      successTitle: "Message received",
      successBody:
        "Thanks — your message is with us, and we will reply to the address you gave us.",
      errorBanner: "Please check the fields below.",
      deliveryErrorTitle: "Your message could not be sent",
      deliveryErrorBody:
        "Something went wrong on our side, so nothing has reached us. Please write to us directly at the addresses above, or try again in a moment.",
      errors: {
        name: "Please tell us your name.",
        emailMissing: "Please give us an email address to reply to.",
        emailInvalid: "That does not look like an email address.",
        message: "A little more detail will get you a better answer.",
        consent: "We need your agreement before we can hold your message.",
      },
    },
  },
};
