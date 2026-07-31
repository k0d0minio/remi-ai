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

export type Content = {
  nav: NavItem[];
  header: {
    contact: string;
    cta: { href: string; label: string };
    menuLabel: string;
  };
  footer: {
    tagline: string;
    disclaimer: string;
    navLabel: string;
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
