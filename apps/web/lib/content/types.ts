/**
 * The shape every locale dictionary fills in full. One type, two files —
 * TypeScript is what guarantees the French app never silently misses a label
 * the English one has.
 *
 * It covers chrome — navigation, labels, headings, empty states — for both
 * surfaces.
 *
 * Note what is NOT here: a step's title, a recipe's method, a recommendation's
 * detail. Those are data, not chrome — they come from the query layer in the
 * language they were written in, and translating them is a question for the
 * practitioner, not for a dictionary.
 */

import type {
  MealSlot,
  PersonalisationDimension,
  RecommendationCategory,
  SignalKind,
  StepStatus,
} from "@remi/services/shared";
import type { Theme } from "@remi/ui/server";

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
  /**
   * The root layout's metadata. Here rather than hard-coded in `layout.tsx`
   * because the app ships in two languages and a browser tab is copy like any
   * other — an English title over a French page is the same bug as an English
   * button on one.
   */
  meta: {
    /** Follows the brand's title convention: rendered as "REMI — <title>". */
    title: string;
    description: string;
  };
  shell: {
    /** Announced to screen readers on the sidebar and the mobile panel. */
    navLabel: string;
    openNav: string;
    closeNav: string;
    skipToContent: string;
  };
  roles: {
    practitioner: string;
    patient: string;
    /** The dev-only affordance that flips between the two surfaces. */
    switchTo: string;
  };
  userMenu: {
    label: string;
    account: string;
    language: string;
    /** The theme section's heading, and a label for each of the three states. */
    appearance: string;
    themes: Record<Theme, string>;
    /** Heading over the two links that leave for another app. */
    help: string;
    supportCentre: string;
    documentation: string;
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
    /** The two ways out for someone who cannot get in — both separate apps. */
    aboutLink: string;
    helpLink: string;
  };
  practitionerNav: NavItem[];
  patientNav: NavItem[];
  practice: {
    title: string;
    lead: string;
    stats: {
      attention: string;
      active: string;
      adherence: string;
    };
    attention: {
      title: string;
      allClients: string;
      open: string;
      empty: PlaceholderContent;
    };
    signals: {
      title: string;
      /** The four things that flow back up the loop between consultations. */
      kinds: Record<SignalKind, string>;
      empty: PlaceholderContent;
    };
  };
  clients: {
    title: string;
    lead: string;
    /** The link at the end of every row, through to that client's page. */
    open: string;
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
  clientDetail: {
    /** The link back up to the roster. */
    back: string;
    /** "Supported since {since} · next consultation {next}". */
    lead: string;
    preparePlan: string;
    attention: string;
    dimensions: {
      title: string;
      lead: string;
      labels: Record<PersonalisationDimension, string>;
      /** Where each dimension's content came from — never "the AI decided". */
      sources: {
        genotype: string;
        /** "Therapeutic frame · {practitioner}". */
        frame: string;
        questionnaire: string;
        /** "Declared by {name}". */
        declared: string;
      };
      points: {
        readiness: string;
        motivators: string;
        barriers: string;
        dislikes: string;
        allergies: string;
        cooksFor: string;
        cooking: string;
        mealsOut: string;
        shoppingDay: string;
      };
      /** Stands in for an empty list — an absence, stated rather than hidden. */
      none: string;
      /** Follows the number of weekday cooking minutes. */
      minutes: string;
    };
    progress: {
      title: string;
      /** "Step {order} of {total}". */
      stepOf: string;
      label: string;
      days: string;
      empty: PlaceholderContent;
    };
    signals: {
      title: string;
      empty: PlaceholderContent;
    };
  };
  planComposer: {
    title: string;
    /** "Consultation of {date} · {name}". */
    lead: string;
    notes: {
      title: string;
      lead: string;
    };
    structured: {
      title: string;
      /** "Untick what does not fit. Nothing unticked reaches {name}." */
      lead: string;
      /** "{confirmed} of {total} confirmed". */
      count: string;
      publish: string;
    };
    dialog: {
      /** "Publish {name}'s plan?" */
      title: string;
      /** "{count} recommendations become meals and steps in their space…" */
      body: string;
      cancel: string;
      confirm: string;
    };
    published: {
      title: string;
      /** "{name} will see {count} recommendations in their space." */
      body: string;
    };
    empty: PlaceholderContent;
  };
  frame: {
    title: string;
    effects: {
      title: string;
      /** What the frame changes in practice, in REMI's own terms. */
      points: string[];
    };
    principles: {
      title: string;
      /** Follows the count of switched-on principles: "3 active". */
      active: string;
    };
    excluded: PlaceholderContent;
    emphasised: PlaceholderContent;
    add: string;
    save: string;
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
    /** Follows the clinic name: "<clinic> · consultation on 22 Jul 2026". */
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
  /**
   * The shareable patient view at `/p/[token]` — the one public page in this
   * app, reached by link rather than sign-in. Its own copy, not `plan`'s: that
   * section belongs to the parked practitioner world and can go with it.
   */
  patientLink: {
    /** Precedes the patient's name: "Bonjour Claire". */
    greeting: string;
    lead: string;
    objectiveTitle: string;
    recommendationsTitle: string;
    categories: Record<RecommendationCategory, string>;
    empty: string;
    disclaimer: PlaceholderContent;
    /** The beta framing consultants read before giving UX feedback. */
    betaNote: string;
  };
};
