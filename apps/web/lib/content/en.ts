import type { Content } from "./types";

export const en: Content = {
  shell: {
    navLabel: "Main",
    openNav: "Open navigation",
    closeNav: "Close navigation",
    skipToContent: "Skip to content",
  },
  roles: {
    practitioner: "Practitioner",
    person: "Person",
    switchTo: "Switch surface",
  },
  userMenu: {
    label: "Account menu",
    account: "Account",
    language: "Language",
    signOut: "Sign out",
  },
  signIn: {
    eyebrow: "Pilot",
    headline: "Pick up where your last consultation left off.",
    title: "Sign in",
    lead: "Enter your details to continue.",
    email: "Email",
    emailPlaceholder: "you@example.com",
    password: "Password",
    roleLegend: "Continue as",
    roleHint: "Decides which side of the loop you land on.",
    submit: "Continue",
    pilotNote: "Pilot access only — contact your practitioner.",
  },
  practitionerNav: [
    { href: "/practice", icon: "practice", label: "Practice" },
    { href: "/clients", icon: "clients", label: "Clients" },
    { href: "/frame", icon: "frame", label: "Therapeutic frame" },
  ],
  personNav: [
    { href: "/today", icon: "today", label: "Today" },
    { href: "/meals", icon: "meals", label: "Meals" },
    { href: "/steps", icon: "steps", label: "Steps" },
    { href: "/plan", icon: "plan", label: "My plan" },
  ],
  clients: {
    title: "Clients",
    lead: "The people you support, and where each of them stands between consultations.",
    columns: {
      name: "Name",
      status: "Status",
      readiness: "Readiness",
      nextConsultation: "Next consultation",
      lastActive: "Last active",
    },
    status: {
      invited: "Invited",
      active: "Active",
      paused: "Paused",
      ended: "Ended",
    },
    readiness: {
      exploring: "Exploring",
      committed: "Committed",
      struggling: "Struggling",
    },
    never: "Never",
    empty: {
      title: "No clients yet",
      body: "The people you invite will appear here, with what they have applied since their last consultation.",
    },
  },
  today: {
    title: "Today",
    lead: "One thing at a time, at your pace.",
    currentStep: "Your step this fortnight",
    stepProgress: "Days applied",
    noPlan: {
      title: "No plan yet",
      body: "Your practitioner has not published a plan for you. It will appear here after your next consultation.",
    },
  },
  plan: {
    title: "My plan",
    lead: "What your practitioner recommended, in words you can act on.",
    consultationOn: "consultation on",
    nextReview: "Review on",
    categories: {
      nutrition: "Nutrition",
      habit: "Habit",
      supplement: "Supplement",
      activity: "Activity",
      monitoring: "Follow-up",
    },
    disclaimer: {
      title: "Your practitioner stays the reference",
      body: "REMI applies these recommendations day to day. It does not diagnose and does not replace a consultation — anything clinical belongs to your practitioner.",
    },
    empty: {
      title: "No plan yet",
      body: "Your practitioner has not published a plan for you. It will appear here as soon as they do.",
    },
  },
  meals: {
    title: "Meals",
    lead: "Ideas that follow your plan, adapted to your tastes, your time and what you have in the kitchen.",
    tabs: {
      week: "The week",
      shopping: "Shopping list",
    },
    slots: {
      breakfast: "breakfast",
      lunch: "lunch",
      dinner: "dinner",
      snack: "snack",
    },
    minutes: "min",
    servings: "servings",
    because: "Because your practitioner recommended",
    details: "Ingredients and method",
    shopping: {
      title: "Before the shop",
      body: "Sorted the way the shop is laid out, not the way the recipes are written.",
    },
    empty: {
      title: "No meals yet",
      body: "Meal ideas appear here once your practitioner has published a plan.",
    },
  },
  steps: {
    title: "Your steps",
    lead: "One at a time. The next one waits until this one holds.",
    held: "Steps held",
    progressLabel: "Progress:",
    days: "days",
    status: {
      upcoming: "Upcoming",
      current: "In progress",
      done: "Held",
      skipped: "Skipped",
    },
    empty: {
      title: "No steps yet",
      body: "Your steps appear here once your practitioner has published a plan.",
    },
  },
  placeholders: {
    practice: {
      title: "Practice",
      body: "Who needs attention before their next consultation — progress, sticking points and engagement at a glance.",
    },
    frame: {
      title: "Therapeutic frame",
      body: "The préceptes REMI generates inside: what to favour, what is excluded, and how far a suggestion may go.",
    },
  },
  prototypeNote: {
    title: "Foundation only",
    body: "This is the app shell and its data seam. The designs for these screens are prototyped in the demo app first.",
  },
};
