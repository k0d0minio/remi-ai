/**
 * The brand's single home. Five Next apps read their name, tagline and
 * social-card colours from here, so a rename is one edit rather than a grep.
 *
 * The two names are not interchangeable, and the split is the whole point of
 * having both: `BRAND_NAME` is the product — what a person reads in a heading,
 * a nav bar or a metadata title. `BRAND_LEGAL_NAME` is the company, and belongs
 * only where the law expects the entity: the © line, terms, an invoice.
 */

/** The product. Copy, headings, metadata titles. */
export const BRAND_NAME = "REMI";

/** The company. © lines and legal text only — never a heading. */
export const BRAND_LEGAL_NAME = "Remi AI";

/**
 * The canonical one-liner, in both languages the product ships in. Marketing
 * copy quotes it; nothing paraphrases it.
 *
 * The French is not a translation of the English — it is the line the francophone
 * copy was written in, and `apps/marketing/lib/content/fr.ts` is where it came
 * from. Translating the English afresh would produce a second, slightly different
 * French tagline, which is the exact thing this module exists to prevent.
 */
export const BRAND_TAGLINE = {
  en: "The wellness copilot that extends a practitioner's guidance between consultations.",
  fr: "Le copilote bien-être qui prolonge l'accompagnement du praticien entre deux consultations.",
} as const;

/**
 * The brand as literal hex, for the two surfaces that cannot resolve a CSS
 * custom property: `next/og` renders through Satori, which has no browser and
 * no Tailwind pass, and `app/icon.svg` is a static file no stylesheet reaches.
 *
 * Each value tracks a token in `tokens.css` by hand. Move a token there and
 * move it here in the same change, or the social card and the favicon drift
 * away from the site they belong to.
 */
export const BRAND_COLORS = {
  /** `--brand-600`, the primary fill — the icon square, and the brand on paper. */
  brand600: "#1762b6",
  /** The brand lightened to stay legible on `ink`; `brand600` is not. */
  brandOnDark: "#6b8dff",
  /** `--grey-950`, the dark surface the social card sits on. */
  ink: "#0b1220",
  /** `--grey-50`, the near-white that reads on `ink`. */
  paper: "#f7f8fa",
} as const;

/**
 * The mark: a serif R as outline, drawn on a 100-unit cap height and spanning
 * x 8…90. Outline plus counter in one path, so it needs `fill-rule="evenodd"`.
 *
 * A path rather than a `<text>` element because the icon has to render where no
 * font is loaded — `next/og` rasterises through resvg, which draws paths and
 * cannot be relied on for type. It is the same reason `Wordmark` and this are
 * separate things: one is text, the other is a shape that looks like text.
 *
 * Each app's `app/icon.svg` carries a copy — a static metadata file is served
 * verbatim and cannot import. Change the glyph here and in those five files
 * together; nothing else can enforce it.
 */
export const BRAND_GLYPH_PATH =
  "M12 0 L48 0 C66 0 76 10 76 26 C76 42 66 50 50 52 L60 54 L76 92 L90 92 L90 100 L56 100 L56 92 L64 92 L46 56 L34 56 L34 92 L46 92 L46 100 L8 100 L8 92 L20 92 L20 8 L12 8 Z M34 11 L46 11 C54 11 60 16 60 26 C60 36 54 41 46 41 L34 41 Z";

/** The glyph's own box, for an `<svg viewBox>` that crops to the mark exactly. */
export const BRAND_GLYPH_VIEW_BOX = "8 0 82 100";
