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
 * Everything here says the same thing as BRAND_TAGLINE in @remi/ui: REMI extends
 * a practitioner's guidance between consultations. It is not a self-serve diet
 * app, and copy that drifts back toward one contradicts the tagline the footer,
 * the social card and every metadata description already carry.
 *
 * What is honest here today:
 *   • `stats` cite published WHO figures about the problem, not about REMI's
 *     performance. Verify each against the current source before launch — they
 *     move, and the adherence figure is from a 2003 report.
 *   • `features` describe intended capability. Cut any that do not ship.
 *
 * What is NOT yet honest and MUST be replaced:
 *   • `testimonials` — placeholder quotes and attributions. Real testimonials,
 *     with consent, or delete the section. Invented ones on a product giving
 *     nutritional advice are worse than an empty page.
 *   • `pricing` — indicative only. Nothing has been decided.
 *   • `logos` — the publications and bodies listed have no relationship with
 *     REMI. Delete or replace with real ones.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const nav = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#pricing", label: "Pricing" },
  { href: "#faq", label: "FAQ" },
] as const;

/**
 * Two sentences, kept apart because the social card sets the second in the
 * brand colour on its own line. The page joins them; nothing retypes them.
 */
const heroTitleLines = [
  "The consultation ends.",
  "The guidance doesn't.",
] as const;

export const hero = {
  eyebrow: "Wellness support between consultations",
  titleLines: heroTitleLines,
  title: heroTitleLines.join(" "),
  subtitle:
    "REMI carries your practitioner's plan into the weeks between appointments — answering the small questions as they come up, and showing your practitioner what actually happened.",
} as const;

/** Figures about the problem, from published sources. Verify before launch. */
export const stats: Stat[] = [
  {
    value: "50%",
    label:
      "is the average adherence to long-term therapy in high-income countries",
    source: "WHO, 2003 — verify before launch",
  },
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
];

export const features: Feature[] = [
  {
    icon: Stethoscope,
    title: "Your practitioner's plan, not a generic one",
    body: "REMI starts from what was agreed in your consultation and works within it. It does not hand you someone else's diet and hope it fits.",
    intent: "primary",
  },
  {
    icon: ClipboardList,
    title: "Logging that takes seconds",
    body: "Describe a meal in plain language and REMI resolves it to portions and nutrients. No weighing, no scrolling a database — because a log nobody keeps tells your practitioner nothing.",
    intent: "info",
  },
  {
    icon: LineChart,
    title: "Trends, not verdicts",
    body: "Patterns across weeks are what change outcomes. REMI shows the direction of travel instead of judging a single day.",
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
    body: "Health data is held to the standard it deserves: encrypted, exportable, and never sold. Your practitioner sees it because you shared it, and you can stop sharing at any time.",
    intent: "neutral",
  },
  {
    icon: Activity,
    title: "Ready for the next consultation",
    body: "Your practitioner opens a clear summary of the weeks in between, so the appointment starts from evidence instead of recall.",
    intent: "info",
  },
];

export const steps = [
  {
    id: "consultation",
    label: "In the consultation",
    title: "Your practitioner sets the direction",
    body: "You agree a plan with the person who knows your situation. REMI holds it — the restrictions, the goal, the reasoning — so nothing has to be remembered or re-explained later.",
  },
  {
    id: "between",
    label: "In between",
    title: "The questions get answered as they arrive",
    body: "The ones too small for an appointment and too immediate to save up. REMI answers within your plan, in plain language, and says when something is a question for your practitioner instead.",
  },
  {
    id: "next",
    label: "Next time",
    title: "The appointment starts from evidence",
    body: "Your practitioner sees what actually happened across the weeks in between — not a recollection of it. The consultation picks up where the last one left off.",
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
    description: "For anyone working to a plan agreed with a practitioner.",
    priceMonthly: "€9",
    priceAnnual: "€7",
    cadence: { monthly: "per month", annual: "per month, billed annually" },
    features: [
      "Everything in Free",
      "Your practitioner's plan, held and applied",
      "Answers between appointments",
      "Full history and trends",
      "Allergy and restriction handling",
    ],
    badge: "Most chosen",
  },
  {
    id: "practice",
    name: "Practice",
    description: "For practitioners supporting clients between consultations.",
    priceMonthly: "€29",
    priceAnnual: "€24",
    cadence: { monthly: "per month", annual: "per month, billed annually" },
    features: [
      "Everything in Plus",
      "Set and update a client's plan",
      "Shared client view",
      "Consultation summaries",
      "Priority support",
    ],
  },
];

export const faqs = [
  {
    id: "medical-advice",
    question: "Is REMI a substitute for seeing a practitioner?",
    answer:
      "No — it is the opposite. REMI extends guidance you have already been given; it does not originate it, and it does not diagnose or treat. Without a practitioner setting the direction, there is nothing for it to carry. Anything clinical goes to them.",
  },
  {
    id: "no-practitioner",
    question: "Can I use REMI without a practitioner?",
    answer:
      "You can log and see your own trends. But the part that makes REMI worth using — guidance shaped by someone who knows your situation — needs that person to exist. If you do not have one yet, treat what you see here as background rather than instruction.",
  },
  {
    id: "sources",
    question: "Where does the guidance come from?",
    answer:
      "From the plan your practitioner set, and from published dietary guidelines and peer-reviewed nutritional science where the plan is silent. REMI names which of the two it is drawing on rather than blurring them together.",
  },
  {
    id: "accuracy",
    question: "How accurate is the logging?",
    answer:
      "Accurate enough to be useful for trends, and not precise enough to be treated as a measurement. Portion estimates from a description or a photograph carry real uncertainty, and REMI shows that uncertainty rather than hiding it behind a confident-looking number.",
  },
  {
    id: "data",
    question: "What happens to my data, and what does my practitioner see?",
    answer:
      "It is encrypted, it is not sold, and it is not used to train models without your explicit consent. Your practitioner sees what you chose to share with them, you can see exactly what that is, and you can stop sharing without losing your own history.",
  },
  {
    id: "conditions",
    question: "Can I use REMI with a diagnosed condition?",
    answer:
      "That is much of the point — clinical dietary restrictions are first-class inputs, not filters bolted on afterwards. Tell your care team you are using it, and treat its output as something to discuss with them rather than act on alone.",
  },
] as const;

/** PLACEHOLDER — none of these organisations has any relationship with REMI. */
export const logos = [
  "Placeholder body",
  "Placeholder journal",
  "Placeholder clinic",
  "Placeholder association",
  "Placeholder review",
] as const;
