import {
  CreditCard,
  Compass,
  ShieldCheck,
  Stethoscope,
  UtensilsCrossed,
} from "lucide-react";
import { articles } from "./articles/en";
import type { Content } from "./types";

/**
 * The English dictionary. Same test as the public site's: REMI is pre-launch,
 * so the help centre describes what the product does today and says plainly
 * where a capability is not there yet. Nothing here claims a ranking that has
 * not been measured, and no article describes a screen that does not exist.
 */
export const en: Content = {
  header: {
    label: "Support",
    homeLabel: "help centre home",
    languageLabel: "Language",
    product: { target: "product", path: "/", label: "Go to REMI" },
  },

  footer: {
    tagline:
      "The help centre for REMI — how the product works, what it does with your data, and who to ask when it does not.",
    disclaimer:
      "REMI helps people apply their practitioner's recommendations. It does not diagnose, treat, or replace professional care — anything clinical belongs with your practitioner.",
    navLabel: "Footer",
    links: [
      { target: "marketing", path: "/", label: "Main site" },
      {
        target: "marketing",
        path: "/practitioners",
        label: "For practitioners",
      },
      { target: "marketing", path: "/contact", label: "Contact" },
      { target: "product", path: "/", label: "Go to REMI" },
    ],
    status: "Service status",
  },

  home: {
    meta: {
      title: "Help centre",
      description:
        "Answers about REMI: getting started, your plan and meals, what practitioners can see, your account, and how your data is handled.",
    },

    hero: {
      eyebrow: "Help centre",
      title: "How can we help?",
      subtitle:
        "Start with a category, or read the questions people ask first. If the answer is not here, a person will read your message.",
      searchLabel: "Search the help centre",
      searchPlaceholder: "How can we help?",
      searchNote:
        "Search is not connected yet — a box that swallows what you type is worse than no box. Every article is one click away in the categories below.",
    },

    categories: {
      eyebrow: "Browse",
      title: "Five places to look",
      lead: "Each one holds the answers to the questions that category is actually asked. Every article says what REMI does today, and where it stops.",
      countLabel: { one: "article", many: "articles" },
    },

    popular: {
      eyebrow: "Start here",
      title: "The questions we are asked first",
      note: "REMI is in its pilot phase, so this is the order the help centre was written in — not a ranking. Nothing here is measured yet, and this page will never pretend otherwise.",
      slugs: [
        "what-remi-does",
        "what-your-practitioner-sees",
        "how-your-plan-reaches-you",
        "joining-the-pilot",
        "logging-meals",
      ],
    },

    cta: {
      title: "Still stuck?",
      body: "The team is small and reads everything. Tell us what you were trying to do and we will answer — and write the article that should have saved you the message.",
      action: { target: "marketing", path: "/contact", label: "Contact us" },
    },
  },

  categories: [
    {
      slug: "getting-started",
      icon: Compass,
      title: "Getting started",
      body: "What REMI is, who it is for, and how you get into it during the pilot.",
    },
    {
      slug: "plan-and-meals",
      icon: UtensilsCrossed,
      title: "Your plan and meals",
      body: "How your practitioner's recommendations become meals, steps and a plan you can act on.",
    },
    {
      slug: "practitioners",
      icon: Stethoscope,
      title: "For practitioners",
      body: "Running a practice in REMI: your therapeutic frame, what you see between consultations, and inviting the people you support.",
    },
    {
      slug: "account-and-billing",
      icon: CreditCard,
      title: "Account and billing",
      body: "Signing in, switching language, and what billing means while REMI is still in its pilot.",
    },
    {
      slug: "privacy-and-data",
      icon: ShieldCheck,
      title: "Privacy and data",
      body: "What REMI stores, who can see it, and the rights you have over it.",
    },
  ],

  articles,

  category: {
    eyebrow: "Help centre",
    backLabel: "All categories",
    countLabel: { one: "article", many: "articles" },
    missing: {
      title: "Not the answer you needed?",
      body: "This category is written from the questions we are actually asked. If yours is not here, it is a gap worth knowing about — tell us and the article gets written.",
      action: { target: "marketing", path: "/contact", label: "Ask us" },
    },
  },

  article: {
    backLabel: "Back to",
    updatedLabel: "Checked against the product on",
    minutesLabel: "min read",
    tocLabel: "On this page",
    prevLabel: "Previous",
    nextLabel: "Next",
    relatedLabel: "Read next",
    helpful: {
      question: "Was this helpful?",
      yes: "Yes",
      no: "No",
      note: "These two buttons record nothing — there is no feedback pipeline behind them yet, and a control that quietly discards an answer is worse than none. Until there is one, tell us in a sentence and it reaches a person.",
      action: {
        target: "marketing",
        path: "/contact",
        label: "Tell us instead",
      },
    },
  },

  status: {
    meta: {
      title: "Service status",
      description:
        "The state of each REMI surface — the product, the public site, this help centre, the reference site, the operations console and the prototype sandbox.",
    },
    eyebrow: "Status",
    title: "Service status",
    lead: "Six surfaces make up REMI. This page reports on all of them, including the two only the team uses — a status page that hides half the system is a status page nobody trusts.",
    notice: {
      title: "No monitoring is connected yet",
      body: "REMI is pre-launch and nothing here is measured: the ninety days below are placeholder data, kept so this page is ready the day real checks run. Treat it as the shape of the answer, not the answer. When an incident is real, it will be written here in words as well as bars.",
    },
    overall: "All surfaces operational",
    operational: "Operational",
    services: {
      web: {
        name: "Product",
        description:
          "The signed-in surface: your plan, meals and steps, and the practitioner console.",
      },
      marketing: {
        name: "Main site",
        description:
          "The public site — what REMI is, who it is for, and how the pilot works.",
      },
      support: {
        name: "Help centre",
        description: "This site.",
      },
      docs: {
        name: "Reference site",
        description:
          "How REMI is put together, for the people building and running it.",
      },
      admin: {
        name: "Operations console",
        description:
          "Internal only. The team uses it to run the pilot; no visitor ever reaches it.",
      },
      demo: {
        name: "Prototype sandbox",
        description:
          "Where a screen is tried out before it is built. Mock data only, by design.",
      },
    },
    uptimeLabel: "over the last 90 days",
    rangeStart: "90 days ago",
    rangeEnd: "Today",
    historyLabel: "90-day history",
    legend: {
      up: "Operational",
      degraded: "Degraded",
      down: "Outage",
    },
  },
};
