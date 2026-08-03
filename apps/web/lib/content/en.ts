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
  placeholders: {
    practice: {
      title: "Practice",
      body: "Who needs attention before their next consultation — progress, sticking points and engagement at a glance.",
    },
    frame: {
      title: "Therapeutic frame",
      body: "The préceptes REMI generates inside: what to favour, what is excluded, and how far a suggestion may go.",
    },
    meals: {
      title: "Meals",
      body: "Meal ideas and recipes that follow your plan, adapted to your tastes, your routine and your constraints.",
    },
    steps: {
      title: "Steps",
      body: "Your small steps in order — the one in flight, the ones already held, and what comes next.",
    },
    plan: {
      title: "My plan",
      body: "Your practitioner's recommendations, in words you can act on. They stay the reference.",
    },
  },
  prototypeNote: {
    title: "Foundation only",
    body: "This is the app shell and its data seam. The designs for these screens are prototyped in the demo app first.",
  },
};
