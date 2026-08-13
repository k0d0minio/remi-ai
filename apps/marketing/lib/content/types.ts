import type { ComponentType } from "react";
import type { Feature, Stat } from "@remi/ui/server";

/**
 * The shape every locale dictionary fills in full. One type, two files —
 * TypeScript is what guarantees the French site never silently misses a
 * section the English site has.
 */

export type NavItem = {
  /** Path without the locale prefix — the layout adds it. */
  href: string;
  label: string;
};

export type HeroAction = {
  href: string;
  label: string;
  variant: "primary" | "outline";
};

export type HeroContent = {
  eyebrow: string;
  title: string;
  subtitle: string;
  actions: HeroAction[];
};

export type StepContent = {
  title: string;
  body: string;
};

export type FaqContent = {
  id: string;
  question: string;
  answer: string;
};

export type CtaContent = {
  title: string;
  body: string;
  action: { href: string; label: string };
};

export type FeatureSectionContent = {
  eyebrow: string;
  title: string;
  lead?: string;
  items: Feature[];
};

export type PageMeta = {
  title: string;
  description: string;
};

export type RoadmapColumn = {
  /** A lucide icon, uninstantiated — the same contract as `Feature`. */
  icon: ComponentType<{ className?: string }>;
  /**
   * The horizon this column sits on — "in development", "designed, not built".
   * A phase, never a date and never an availability claim.
   */
  status: string;
  title: string;
  body: string;
  /** Each line is an intention. Nothing here is presented as usable today. */
  items: string[];
};

export type RoadmapContent = {
  eyebrow: string;
  title: string;
  lead: string;
  /** Exactly three: now, next, later — the layout is the argument. */
  columns: [RoadmapColumn, RoadmapColumn, RoadmapColumn];
  note: string;
};

/** A heading block with a list under it — the shape most of /trust is made of. */
export type ListSectionContent = {
  eyebrow: string;
  title: string;
  lead: string;
  items: string[];
};

export type Content = {
  nav: NavItem[];
  header: {
    contact: string;
    /** Completes the wordmark link's accessible name: "Remi AI, home". */
    homeLabel: string;
    cta: { href: string; label: string };
    /** Label for the way into the product — a separate app, hence an origin. */
    signIn: string;
    menuLabel: string;
  };
  footer: {
    tagline: string;
    disclaimer: string;
    navLabel: string;
    /** Label for the support centre link — a separate app, hence an origin. */
    support: string;
    /** The same destination as the header's, repeated where a reader ends up. */
    signIn: string;
  };
  home: {
    meta: PageMeta;
    hero: HeroContent;
    stats: {
      eyebrow: string;
      title: string;
      note: string;
      items: Stat[];
    };
    audience: {
      eyebrow: string;
      title: string;
      cards: {
        href: string;
        title: string;
        body: string;
        bullets: string[];
        cta: string;
      }[];
    };
    vision: FeatureSectionContent;
    roadmap: RoadmapContent;
    steps: {
      eyebrow: string;
      title: string;
      items: StepContent[];
    };
    partnership: PartnershipContent;
    faq: {
      eyebrow: string;
      title: string;
      items: FaqContent[];
    };
    cta: CtaContent;
  };
  practitioners: {
    meta: PageMeta;
    hero: HeroContent;
    pains: FeatureSectionContent;
    vision: FeatureSectionContent;
    pilot: {
      eyebrow: string;
      title: string;
      body: string;
      includedTitle: string;
      included: string[];
      conditionsTitle: string;
      conditions: string[];
      pricingNote: string;
      action: { href: string; label: string };
    };
    cta: CtaContent;
  };
  individuals: {
    meta: PageMeta;
    hero: HeroContent;
    steps: {
      eyebrow: string;
      title: string;
      items: StepContent[];
    };
    vision: FeatureSectionContent;
    status: {
      title: string;
      body: string;
    };
    cta: CtaContent;
  };
  about: {
    meta: PageMeta;
    intro: {
      eyebrow: string;
      title: string;
      lead: string;
      body: string;
    };
    team: {
      eyebrow: string;
      title: string;
      members: {
        name: string;
        role: string;
        bio: string;
        quote: string;
        initials: string;
      }[];
    };
    partnership: PartnershipContent;
    principles: {
      eyebrow: string;
      title: string;
      items: StepContent[];
    };
    cta: CtaContent;
  };
  trust: {
    meta: PageMeta;
    intro: {
      eyebrow: string;
      title: string;
      lead: string;
      body: string;
    };
    /** Where REMI actually stands — the alert that keeps the page checkable. */
    status: {
      title: string;
      body: string;
    };
    commitments: FeatureSectionContent;
    residency: ListSectionContent & { note: string };
    frame: {
      eyebrow: string;
      title: string;
      lead: string;
      items: StepContent[];
    };
    never: ListSectionContent;
    questions: ListSectionContent;
    cta: CtaContent;
  };

  contact: {
    meta: PageMeta;
    eyebrow: string;
    title: string;
    lead: string;
    people: {
      name: string;
      role: string;
      email: string;
      phone: string;
    }[];
    form: {
      name: string;
      email: string;
      emailHint: string;
      message: string;
      consent: string;
      submit: string;
      submitting: string;
      successTitle: string;
      successBody: string;
      errorBanner: string;
      /** Shown when the message validated but could not be delivered. */
      deliveryErrorTitle: string;
      deliveryErrorBody: string;
      errors: {
        name: string;
        emailMissing: string;
        emailInvalid: string;
        message: string;
        consent: string;
      };
    };
  };
};

export type PartnershipContent = {
  eyebrow: string;
  title: string;
  body: string;
  points: string[];
  quote: string;
  quoteAuthor: string;
  quoteRole: string;
};
