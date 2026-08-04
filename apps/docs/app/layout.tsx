import { Footer, Layout, Navbar } from "nextra-theme-docs";
import type { CSSProperties, ReactNode } from "react";
import { Head } from "nextra/components";
import { getPageMap } from "nextra/page-map";
import "nextra-theme-docs/style.css";

/**
 * The one place in the repo that spells the brand out rather than importing it
 * from `@remi/ui/server`. next.config.ts keeps this app off the design system on
 * purpose — it is reference material, not product surface — and taking a
 * workspace dependency for two string constants would undo that for no gain.
 * The names still have to match `BRAND_NAME` / `BRAND_LEGAL_NAME`.
 */
const brandName = "REMI";
const brandLegalName = "Remi AI";

export const metadata = {
  title: {
    default: `${brandName} — docs`,
    template: `%s · ${brandName} docs`,
  },
  description: `How ${brandName} works — business direction and technical reference.`,
};

/**
 * The wordmark, hand-styled. `@remi/ui`'s `Wordmark` is the canonical one, but
 * this app has no Tailwind pass and no design-system dependency by design, so
 * the mark is spelled out here in inline styles — the same three decisions the
 * component makes, and nothing more: the display serif, set caps, and the
 * tracking that keeps four letters reading as a mark rather than an acronym.
 *
 * The serif is a stack rather than a loaded face. `@remi/ui` falls back to
 * `ui-serif, Georgia` wherever no app has declared `--font-display`, which is
 * exactly this app's situation, so the fallback *is* the match — loading
 * Instrument Serif here would buy a closer mark at the cost of a font request
 * on a reference site that has none.
 *
 * "docs" stays in the theme's own sans at a lower weight and opacity: it is the
 * qualifier, not part of the brand, and typesetting it like one would invent a
 * second wordmark this repo would then have to keep in step.
 */
const wordmarkStyle: CSSProperties = {
  fontFamily: "ui-serif, Georgia, serif",
  fontSize: "1.25rem",
  fontWeight: 400,
  letterSpacing: "0.06em",
  lineHeight: 1,
};

const qualifierStyle: CSSProperties = {
  fontSize: "0.9375rem",
  fontWeight: 500,
  letterSpacing: "0.01em",
  lineHeight: 1,
  opacity: 0.65,
};

/**
 * The visible letters are `aria-hidden` and the accessible name comes from the
 * hidden label, for the reason `Wordmark` gives: leaving both exposed announces
 * the name twice, and a set-caps product name is not reliably read as a word.
 */
const hiddenLabelStyle: CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  margin: -1,
  padding: 0,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  whiteSpace: "nowrap",
  border: 0,
};

const logoStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "baseline",
  gap: "0.4em",
};

const Logo = () => (
  <span style={logoStyle}>
    <span style={hiddenLabelStyle}>{brandLegalName} docs</span>
    <span aria-hidden="true" style={wordmarkStyle}>
      {brandName}
    </span>
    <span aria-hidden="true" style={qualifierStyle}>
      docs
    </span>
  </span>
);

const RootLayout = async ({ children }: { children: ReactNode }) => (
  <html lang="en" dir="ltr" suppressHydrationWarning>
    <Head />
    <body>
      <Layout
        navbar={<Navbar logo={<Logo />} />}
        footer={<Footer>© {brandLegalName}</Footer>}
        pageMap={await getPageMap()}
        docsRepositoryBase="https://github.com/k0d0minio/remi-ai/tree/main/apps/docs"
      >
        {children}
      </Layout>
    </body>
  </html>
);

export default RootLayout;
