import {
  CreditCard,
  Compass,
  ShieldCheck,
  Stethoscope,
  UtensilsCrossed,
} from "lucide-react";
import type { Content } from "./types";

/**
 * The English dictionary. Same test as the public site's: REMI is pre-launch,
 * so the help centre describes what the product is being built to do and never
 * an answer it cannot give yet. The categories below are the shape the articles
 * will fill — nothing here claims an article already exists, and nothing claims
 * a ranking that has not been measured.
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
        "Search arrives with the first articles — until then, the categories below are the whole help centre.",
    },

    categories: {
      eyebrow: "Browse",
      title: "Five places to look",
      lead: "Each one is being written alongside the pilot. The questions listed are what the articles will answer.",
      items: [
        {
          slug: "getting-started",
          icon: Compass,
          title: "Getting started",
          body: "What REMI is, who it is for, and what happens in your first week with it.",
          topics: [
            "What REMI does, and what it deliberately does not do",
            "Setting up after your practitioner invites you",
            "What to expect in your first week",
          ],
        },
        {
          slug: "plan-and-meals",
          icon: UtensilsCrossed,
          title: "Your plan and meals",
          body: "How your practitioner's recommendations become meals, habits and small daily steps.",
          topics: [
            "Where your meal suggestions come from",
            "Swapping a meal you cannot or will not eat",
            "Allergies, intolerances and foods to avoid",
          ],
        },
        {
          slug: "practitioners",
          icon: Stethoscope,
          title: "For practitioners",
          body: "Running a practice in REMI: recommendations, what you see between consultations, and where your judgement stays the reference.",
          topics: [
            "Turning consultation notes into recommendations",
            "What you can see between two consultations",
            "Inviting someone you support",
          ],
        },
        {
          slug: "account-and-billing",
          icon: CreditCard,
          title: "Account and billing",
          body: "Signing in, changing your details, and how billing will work once there is something to bill for.",
          topics: [
            "Signing in and recovering access",
            "Changing your email or your details",
            "Closing your account, and what happens to your data",
          ],
        },
        {
          slug: "privacy-and-data",
          icon: ShieldCheck,
          title: "Privacy and data",
          body: "What REMI stores, who can see it, and the rights you have over it.",
          topics: [
            "What your practitioner can and cannot see",
            "Where your data is stored, and for how long",
            "Exporting or deleting everything REMI holds",
          ],
        },
      ],
    },

    popular: {
      eyebrow: "Start here",
      title: "The questions we are asked first",
      note: "REMI is in its pilot phase, so this is the order the help centre is being written in — not a ranking. Nothing here is measured yet, and this page will never pretend otherwise.",
      items: [
        {
          slug: "what-remi-does",
          title: "What REMI does, and what it deliberately does not do",
          category: "getting-started",
        },
        {
          slug: "what-your-practitioner-sees",
          title: "What your practitioner can and cannot see",
          category: "privacy-and-data",
        },
        {
          slug: "swapping-a-meal",
          title: "Swapping a meal you cannot or will not eat",
          category: "plan-and-meals",
        },
        {
          slug: "invite-someone-you-support",
          title: "Inviting someone you support",
          category: "practitioners",
        },
        {
          slug: "signing-in",
          title: "Signing in and recovering access",
          category: "account-and-billing",
        },
      ],
    },

    cta: {
      title: "Still stuck?",
      body: "The team is small and reads everything. Tell us what you were trying to do and we will answer — and write the article that should have saved you the message.",
      action: { target: "marketing", path: "/contact", label: "Contact us" },
    },
  },
};
