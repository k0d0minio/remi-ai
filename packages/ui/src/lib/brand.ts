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
 * The canonical one-liner. Marketing copy quotes it; nothing paraphrases
 * it. The estate is French only (Jamie, 2026-11-20), so the table has one
 * entry, keyed by locale.
 *
 * It is the line Morgane wrote for the public site's footer (2 November
 * 2026).
 */
export const BRAND_TAGLINE = {
  fr: "Des recommandations nutritionnelles personnalisées, faciles à appliquer au quotidien.",
} as const;

/**
 * The baseline of the charter (`brand/charte-graphique.md`, section 2): the
 * short line that goes with the logo where the brand presents itself. It does
 * not replace `BRAND_TAGLINE`, which stays the description line for metadata
 * and link previews (Jamie, 2026-11-19, REM-183).
 *
 * The line is Morgane's.
 */
export const BRAND_BASELINE = {
  fr: "Entre recommandation et action",
} as const;

/**
 * The brand as literal hex, for the surfaces that cannot resolve a CSS custom
 * property: `next/og` renders through Satori, which has no browser and no
 * Tailwind pass.
 *
 * Each value tracks a token in `tokens.css` by hand. Move a token there and
 * move it here in the same change, or the social card drifts away from the
 * site it belongs to.
 */
export const BRAND_COLORS = {
  /** `--brand-600`, the primary fill — the logo's R, and the brand on paper. */
  brand600: "#3362ae",
  /** `--brand-300`, the brand lightened to stay legible on `ink`; `brand600` is not. */
  brandOnDark: "#95baee",
  /** `--vital-500`, the logo's teal — the I of the wordmark. */
  teal500: "#00a6a9",
  /** `--foreground`, the text colour of the charter (`text.primary`). */
  ink: "#253348",
  /** `--background`, the page colour of the charter (`surface.page`). */
  paper: "#f4f8fc",
} as const;

/**
 * The logo: Morgane's image, as the charter of 16 November 2026 shows it.
 * The source is `packages/ui/brand/logo/remi-logo-charte.png`. The served file
 * is the same letters with a transparent background. Each app copies it to
 * `public/brand/remi-logo.png`, because a package cannot serve a file. The
 * favicons are images too: each app has its own `app/icon.png` and
 * `app/apple-icon.png`, cut from the same source.
 */
export const BRAND_LOGO = {
  src: "/brand/remi-logo.png",
  width: 725,
  height: 229,
} as const;
