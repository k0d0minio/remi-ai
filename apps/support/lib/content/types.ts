import type { ComponentType } from "react";
import type { AppKey } from "@remi/services/shared";

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

export type SiteLink = {
  /**
   * Which app the link leaves for — this site links out more than it links in.
   * The keys are `@remi/services/shared`'s, so a destination that exists in the
   * catalogue is spellable here and nothing else is.
   */
  target: AppKey;
  /** Path inside that app, locale prefix excluded. */
  path: string;
  label: string;
};

export type Category = {
  /** The route segment this category's articles are published under. */
  slug: string;
  /** A lucide icon component — passed uninstantiated, rendered at one size. */
  icon: ComponentType<{ className?: string }>;
  title: string;
  /** One line under the title. Doubles as the category page's meta description. */
  body: string;
};

/**
 * The blocks an article is built from. A closed union rather than a markdown
 * string: the renderer stays a server component with no parser in it, and a
 * block that does not exist cannot be authored by accident.
 *
 * `heading` carries its own `id` because the table of contents links to it —
 * deriving one by slugifying the text would change every anchor the day someone
 * fixes a typo.
 */
export type ArticleBlock =
  | { kind: "heading"; id: string; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "list"; items: string[] }
  | { kind: "steps"; items: { title: string; body: string }[] }
  | { kind: "columns"; columns: [ArticleColumn, ArticleColumn] }
  | { kind: "note"; intent: NoteIntent; title: string; body: string }
  | { kind: "action"; body: string; link: SiteLink };

/** Two lists side by side — "what REMI does" against "what it never does". */
export type ArticleColumn = {
  intent: "success" | "error" | "info" | "neutral";
  title: string;
  items: string[];
};

/**
 * `warning` is reserved for the two things a reader must not miss: the medical
 * boundary, and a capability that does not exist yet. Spending it on anything
 * else is how a warning stops being read.
 */
export type NoteIntent = "info" | "warning" | "neutral" | "success";

export type Article = {
  /**
   * The route segment, identical in both languages: the locale switcher swaps
   * the prefix and keeps the rest of the path, so a translated slug would send
   * a reader mid-article to a 404.
   */
  slug: string;
  /** The owning category's `slug`, so a renamed category cannot drift from it. */
  category: string;
  title: string;
  /** One sentence. It is the listing row and the page's meta description. */
  summary: string;
  /**
   * ISO 8601 (YYYY-MM-DD): the day the article was last checked against the
   * product, which is a stronger promise than the day the file changed.
   */
  updated: string;
  blocks: ArticleBlock[];
  /** Slugs of articles worth reading next. An unknown slug renders nothing. */
  related?: string[];
};

/**
 * The six surfaces the status page reports on — which is every app there is, so
 * it borrows the catalogue's keys rather than restating them and drifting the
 * day a seventh app exists.
 */
export type ServiceId = AppKey;

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
    /** The status page — an internal route, so it is not a `SiteLink`. */
    status: string;
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
      /** Sits under each card's article list: "3 articles". */
      countLabel: { one: string; many: string };
    };
    popular: {
      eyebrow: string;
      title: string;
      note: string;
      /** Article slugs, in the order they are listed. */
      slugs: string[];
    };
    cta: {
      title: string;
      body: string;
      action: SiteLink;
    };
  };
  /** The five doors. Their order here is their order everywhere. */
  categories: Category[];
  /** Every article on the site, in the order each category lists them. */
  articles: Article[];
  category: {
    eyebrow: string;
    backLabel: string;
    countLabel: { one: string; many: string };
    /** Closes a category page, for the answer that is not in it. */
    missing: { title: string; body: string; action: SiteLink };
  };
  article: {
    /** Breadcrumb back to the owning category — the category's own title follows. */
    backLabel: string;
    updatedLabel: string;
    minutesLabel: string;
    tocLabel: string;
    prevLabel: string;
    nextLabel: string;
    relatedLabel: string;
    helpful: {
      question: string;
      yes: string;
      no: string;
      /** Says the two buttons record nothing, and where to say it instead. */
      note: string;
      action: SiteLink;
    };
  };
  status: {
    meta: PageMeta;
    eyebrow: string;
    title: string;
    lead: string;
    /** The whole page's honesty note: nothing here is measured yet. */
    notice: { title: string; body: string };
    overall: string;
    operational: string;
    services: Record<ServiceId, { name: string; description: string }>;
    /** Follows the percentage: "99.6% · over the last 90 days". */
    uptimeLabel: string;
    /** The two ends of the bar. */
    rangeStart: string;
    rangeEnd: string;
    /** Completes each bar's accessible name: "Product — 90-day history". */
    historyLabel: string;
    legend: { up: string; degraded: string; down: string };
  };
};
