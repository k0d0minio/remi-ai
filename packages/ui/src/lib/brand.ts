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
 * The canonical one-liner, in both languages the estate ships in. Marketing
 * copy quotes it; nothing paraphrases it.
 *
 * The French is the line Morgane wrote for the public site's footer
 * (2 November 2026) and is the one that is canonical. The English is a
 * translation of it for the product's English surfaces, not a second tagline.
 */
export const BRAND_TAGLINE = {
  en: "Personalised nutrition recommendations, easy to apply every day.",
  fr: "Des recommandations nutritionnelles personnalisées, faciles à appliquer au quotidien.",
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
  /** `--brand-600`, the primary fill — the logo's R, and the brand on paper. */
  brand600: "#045cc7",
  /** `--brand-300`, the brand lightened to stay legible on `ink`; `brand600` is not. */
  brandOnDark: "#76beff",
  /** `--vital-500`, the logo's teal — the I of the wordmark. */
  teal500: "#00a7a8",
  /** `--grey-950`, the navy ink the social card sits on. */
  ink: "#050d1e",
  /** `--grey-50`, the near-white that reads on `ink`. */
  paper: "#f9fafc",
} as const;

/**
 * The brand's mark is the logo image in `packages/ui/brand/logo/` — the
 * gradient wordmark Morgane delivered on 2 November 2026 — and the public site
 * renders that file. The glyph below is the earlier serif R, kept only for the
 * favicons of the product, the console and the docs until those take the logo
 * mark too (`triage/logo-mark-in-every-app`).
 *
 * The glyph: a serif R as outline, drawn on a 100-unit cap height and spanning
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
