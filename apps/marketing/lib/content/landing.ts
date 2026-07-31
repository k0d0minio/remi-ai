import {
  Activity,
  Apple,
  ClipboardList,
  LineChart,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import type { Feature, PricingTier, Stat } from "@remi/ui/server";

/**
 * The landing page's copy, in one place, so a wording change never means editing
 * a component.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * BEFORE LAUNCH — this file contains placeholder content.
 *
 * apps/marketing/AGENTS.md: "Claims must be true and checkable: if the product
 * cannot do it today, the page does not say it can. When a claim involves a
 * number, the number comes from somewhere real, and the page says where."
 *
 * What is honest here today:
 *   • `stats` cite published WHO figures about the problem, not about Remi's
 *     performance. Verify each against the current fact sheet before launch —
 *     they move.
 *   • `features` describe intended capability. Cut any that do not ship.
 *
 * What is NOT yet honest and MUST be replaced:
 *   • `testimonials` — placeholder quotes and attributions. Real testimonials,
 *     with consent, or delete the section. Invented ones on a product giving
 *     nutritional advice are worse than an empty page.
 *   • `pricing` — indicative only. Nothing has been decided.
 *   • `logos` — the publications and bodies listed have no relationship with
 *     Remi. Delete or replace with real ones.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const nav = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
] as const;

export const hero = {
  eyebrow: "Nutrition, with a clinician behind it",
  title: "Know what you eat. Understand what it does.",
  subtitle:
    "Remi turns an everyday food log into structured nutritional insight, reviewed against clinical guidance — so the advice you act on has a reason behind it.",
} as const;

/** Figures about the problem, from published sources. Verify before launch. */
export const stats: Stat[] = [
  {
    value: "1 in 8",
    label: "people worldwide were living with obesity in 2022",
    source: "WHO",
  },
  {
    value: "2×",
    label: "adult obesity has more than doubled since 1990",
    source: "WHO",
  },
  {
    value: "8",
    label: "of the top risk factors for early death are diet-related",
    source: "Placeholder — verify or remove",
  },
];

export const features: Feature[] = [
  {
    icon: ClipboardList,
    title: "Logging that takes seconds",
    body: "Describe a meal in plain language and Remi resolves it to portions and nutrients. No weighing, no scrolling a database.",
    intent: "primary",
  },
  {
    icon: Stethoscope,
    title: "Guidance with a source",
    body: "Every recommendation names the guideline it comes from, so you and your clinician can see the reasoning rather than a score.",
    intent: "info",
  },
  {
    icon: LineChart,
    title: "Trends, not verdicts",
    body: "Patterns across weeks are what change outcomes. Remi shows the direction of travel instead of judging a single day.",
    intent: "success",
  },
  {
    icon: Apple,
    title: "Built around real diets",
    body: "Allergies, intolerances, cultural and religious requirements, and clinical restrictions are inputs, not afterthoughts.",
    intent: "success",
  },
  {
    icon: ShieldCheck,
    title: "Your data stays yours",
    body: "Health data is held to the standard it deserves: encrypted, exportable, and never sold. You can delete all of it in one action.",
    intent: "neutral",
  },
  {
    icon: Activity,
    title: "Ready for your care team",
    body: "Export a clear summary your dietitian or GP can actually read, so an appointment starts from evidence instead of recall.",
    intent: "info",
  },
];

export const steps = [
  {
    id: "log",
    label: "Log",
    title: "Tell Remi what you ate",
    body: "Type it, speak it, or photograph it. Remi handles the translation into portions, nutrients and timing — the part that makes people give up on food diaries by week two.",
  },
  {
    id: "understand",
    label: "Understand",
    title: "See what it means, and why",
    body: "Remi maps your intake against the guidance relevant to you and explains the gap in plain language, citing what the recommendation is based on.",
  },
  {
    id: "act",
    label: "Act",
    title: "Change one thing at a time",
    body: "Rather than a diet, you get the single adjustment likely to matter most this week — and a way to tell whether it worked.",
  },
] as const;

/** PLACEHOLDER. Replace with real, consented testimonials or delete the section. */
export const testimonials = [
  {
    id: "placeholder-1",
    quote:
      "This is placeholder copy standing in for a real testimonial. It exists so the layout can be reviewed, and must be replaced before launch.",
    author: "Placeholder name",
    role: "Placeholder role",
    initials: "PN",
    rating: 5,
  },
  {
    id: "placeholder-2",
    quote:
      "A second placeholder quote, held here to show how two cards sit beside each other at this width.",
    author: "Placeholder name",
    role: "Placeholder role",
    initials: "PN",
    rating: 5,
  },
  {
    id: "placeholder-3",
    quote:
      "A third placeholder, so the three-column arrangement can be judged honestly before any real quote exists.",
    author: "Placeholder name",
    role: "Placeholder role",
    initials: "PN",
    rating: 4,
  },
] as const;

/**
 * PLACEHOLDER pricing — nothing has been decided.
 *
 * `action` is omitted: it is a `Button`, which is a client component, so the
 * section builds it and passes it in. Content files hold copy, not elements.
 */
export const pricing: Omit<PricingTier, "action">[] = [
  {
    id: "free",
    name: "Free",
    description: "Enough to find out whether logging sticks for you.",
    priceMonthly: "€0",
    priceAnnual: "€0",
    cadence: { monthly: "forever", annual: "forever" },
    features: [
      "Unlimited meal logging",
      "Daily nutrient breakdown",
      "Fourteen days of history",
    ],
  },
  {
    id: "plus",
    name: "Plus",
    description: "For anyone managing a condition or a real goal.",
    priceMonthly: "€9",
    priceAnnual: "€7",
    cadence: { monthly: "per month", annual: "per month, billed annually" },
    features: [
      "Everything in Free",
      "Guidance with cited sources",
      "Full history and trends",
      "Clinician-ready exports",
      "Allergy and restriction handling",
    ],
    badge: "Most chosen",
  },
  {
    id: "care",
    name: "Care",
    description: "For practices supporting clients between appointments.",
    priceMonthly: "€29",
    priceAnnual: "€24",
    cadence: { monthly: "per month", annual: "per month, billed annually" },
    features: [
      "Everything in Plus",
      "Shared client view",
      "Consultation summaries",
      "Priority support",
    ],
  },
];

export const faqs = [
  {
    id: "medical-advice",
    question: "Is Remi a substitute for medical advice?",
    answer:
      "No. Remi is a tracking and decision-support tool. It can show you what you are eating and what published guidance says about it, but it does not diagnose, treat, or replace a conversation with your doctor or a registered dietitian. Anything clinical should go through them.",
  },
  {
    id: "sources",
    question: "Where does the nutritional guidance come from?",
    answer:
      "From published dietary guidelines and peer-reviewed nutritional science. Remi names the source behind each recommendation rather than presenting a number with no provenance, so you can check it or take it to your clinician.",
  },
  {
    id: "accuracy",
    question: "How accurate is the logging?",
    answer:
      "Accurate enough to be useful for trends, and not precise enough to be treated as a measurement. Portion estimates from a description or a photograph carry real uncertainty, and Remi shows that uncertainty rather than hiding it behind a confident-looking number.",
  },
  {
    id: "data",
    question: "What happens to my data?",
    answer:
      "It is encrypted, it is not sold, and it is not used to train models without your explicit consent. You can export everything in a portable format or delete all of it permanently, in one action, at any time.",
  },
  {
    id: "conditions",
    question: "Can I use Remi with a diagnosed condition?",
    answer:
      "Many people will want to, and Remi is built to handle clinical dietary restrictions as first-class inputs. Tell your care team you are using it, and treat its output as something to discuss with them rather than act on alone.",
  },
] as const;

/** PLACEHOLDER — none of these organisations has any relationship with Remi. */
export const logos = [
  "Placeholder body",
  "Placeholder journal",
  "Placeholder clinic",
  "Placeholder association",
  "Placeholder review",
] as const;
