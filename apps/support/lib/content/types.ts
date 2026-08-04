import type { ComponentType } from "react";

/**
 * The shape every locale dictionary fills in full. One type, two files —
 * TypeScript is what guarantees the French help centre never silently misses a
 * category the English one has.
 *
 * Article content belongs here too, not in a component: a help centre is copy,
 * and rewording an answer must never mean editing markup.
 */

export type PageMeta = {
  title: string;
  description: string;
};

export type Category = {
  /** The route segment the articles in this category will be published under. */
  slug: string;
  /** A lucide icon component — passed uninstantiated, rendered at one size. */
  icon: ComponentType<{ className?: string }>;
  title: string;
  body: string;
  /** The articles this category is being written to hold. */
  topics: string[];
};

export type Article = {
  /** The slug the article will be published at, once it is written. */
  slug: string;
  title: string;
  /** The owning category's `slug`, so a renamed category cannot drift from it. */
  category: string;
};

export type SiteLink = {
  /** Which app the link leaves for — this site has no second page of its own. */
  target: "marketing" | "product";
  /** Path inside that app, locale prefix excluded. */
  path: string;
  label: string;
};

export type Content = {
  header: {
    /** Sits beside the wordmark: this is REMI's help centre, not REMI. */
    label: string;
    /** Completes the wordmark link's accessible name: "Remi AI support, home". */
    homeLabel: string;
    languageLabel: string;
    product: SiteLink;
  };
  footer: {
    tagline: string;
    disclaimer: string;
    navLabel: string;
    links: SiteLink[];
  };
  home: {
    meta: PageMeta;
    hero: {
      eyebrow: string;
      title: string;
      subtitle: string;
      /** The search field's own label, read out but not drawn. */
      searchLabel: string;
      searchPlaceholder: string;
      /** Says plainly that the field does not search anything yet. */
      searchNote: string;
    };
    categories: {
      eyebrow: string;
      title: string;
      lead: string;
      items: Category[];
    };
    popular: {
      eyebrow: string;
      title: string;
      note: string;
      items: Article[];
    };
    cta: {
      title: string;
      body: string;
      action: SiteLink;
    };
  };
};
