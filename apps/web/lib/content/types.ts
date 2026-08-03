/**
 * The shape every locale dictionary fills in full. One type, two files —
 * TypeScript is what guarantees the French app never silently misses a label
 * the English one has.
 *
 * This covers the shell's chrome only: navigation, the user menu, empty and
 * placeholder states. Feature copy belongs with the feature.
 *
 * Note what is NOT here: a step's title, a recipe's method, a recommendation's
 * detail. Those are data, not chrome — they come from the query layer in the
 * language they were written in, and translating them is a question for the
 * practitioner, not for a dictionary.
 */

import type {
  MealSlot,
  RecommendationCategory,
  StepStatus,
} from "@remi/services/shared";

export type NavItem = {
  /** Path without the locale prefix — the shell adds it. */
  href: string;
  /** Matches a key in the `icons` map in `components/shell/nav-icons.ts`. */
  icon: string;
  label: string;
};

export type PlaceholderContent = {
  title: string;
  body: string;
};

export type Content = {
  shell: {
    /** Announced to screen readers on the sidebar and the mobile panel. */
    navLabel: string;
    openNav: string;
    closeNav: string;
    skipToContent: string;
  };
  roles: {
    practitioner: string;
    person: string;
    /** The dev-only affordance that flips between the two surfaces. */
    switchTo: string;
  };
  userMenu: {
    label: string;
    account: string;
    language: string;
    signOut: string;
  };
  signIn: {
    /** Sits above the display headline on the brand panel. */
    eyebrow: string;
    /** The display headline. The sentence under it is the brand tagline. */
    headline: string;
    title: string;
    lead: string;
    email: string;
    emailPlaceholder: string;
    password: string;
    /** The role picker — a dev affordance, so both surfaces stay reachable. */
    roleLegend: string;
    roleHint: string;
    submit: string;
    pilotNote: string;
  };
  practitionerNav: NavItem[];
  personNav: NavItem[];
  clients: {
    title: string;
    lead: string;
    columns: {
      name: string;
      status: string;
      readiness: string;
      nextConsultation: string;
      lastActive: string;
    };
    status: {
      invited: string;
      active: string;
      paused: string;
      ended: string;
    };
    readiness: {
      exploring: string;
      committed: string;
      struggling: string;
    };
    never: string;
    empty: PlaceholderContent;
  };
  today: {
    title: string;
    lead: string;
    currentStep: string;
    stepProgress: string;
    noPlan: PlaceholderContent;
  };
  plan: {
    title: string;
    lead: string;
    /** Follows the clinic name: "FunMedDev · consultation on 22 Jul 2026". */
    consultationOn: string;
    /** Prefixes the next consultation's date: "Review on 19 Aug 2026". */
    nextReview: string;
    categories: Record<RecommendationCategory, string>;
    disclaimer: PlaceholderContent;
    empty: PlaceholderContent;
  };
  meals: {
    title: string;
    lead: string;
    tabs: {
      week: string;
      shopping: string;
    };
    slots: Record<MealSlot, string>;
    /** Follows the number in each badge: "12 min", "4 servings". */
    minutes: string;
    servings: string;
    /** The attribution line above every recipe's list of what it honours. */
    because: string;
    /** The disclosure that opens ingredients and method. */
    details: string;
    shopping: PlaceholderContent;
    empty: PlaceholderContent;
  };
  steps: {
    title: string;
    lead: string;
    held: string;
    /** Prefixes a step's title in that step's progress bar label. */
    progressLabel: string;
    /** Follows the count in "4 / 14 days". */
    days: string;
    status: Record<StepStatus, string>;
    empty: PlaceholderContent;
  };
  placeholders: {
    /** Keyed by route segment, so a new placeholder route is one dictionary entry. */
    practice: PlaceholderContent;
    frame: PlaceholderContent;
  };
  prototypeNote: {
    title: string;
    body: string;
  };
};
