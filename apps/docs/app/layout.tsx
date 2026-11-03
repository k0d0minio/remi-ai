import { Footer, Layout, Navbar } from "nextra-theme-docs";
import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";
import { Head } from "nextra/components";
import { getPageMap } from "nextra/page-map";
import { appHref } from "@remi/services/shared";
import "nextra-theme-docs/style.css";

/**
 * The one place in the repo that spells the brand out rather than importing it
 * from `@remi/ui/server`. next.config.ts keeps this app off the design system on
 * purpose — it is reference material, not product surface — and taking a
 * dependency on it for two string constants would undo that for no gain. The
 * names still have to match `BRAND_NAME` / `BRAND_LEGAL_NAME`. The logo image
 * under `public/` is a copy of `packages/ui/brand/logo/remi-logo.png`.
 *
 * The origins below are the opposite case, and that is why `@remi/services` is
 * the one workspace dependency this app does take: an origin spelled out here
 * would be a second copy of a fact that changes for all four apps on the same
 * day — the day the domain moves — and the copy nobody remembers to edit.
 */
const brandName = "REMI";
const brandLegalName = "Remi AI";

/**
 * `robots` matches `app/robots.ts` and is here for the same reason admin has
 * both: the file stops well-behaved crawlers before they fetch, this stops the
 * ones that fetched anyway from indexing what they read. This site publishes
 * business direction, so neither is optional while it is reachable.
 */
export const metadata: Metadata = {
  title: {
    default: `${brandName} — docs`,
    template: `%s · ${brandName} docs`,
  },
  description: `Comment fonctionne ${brandName} — direction de l’entreprise et référence technique.`,
  robots: { index: false, follow: false },
};

/**
 * The logo. Morgane's image is the brand mark (`packages/ui/brand/logo/`), so
 * the navbar shows the image and types nothing: a typed name would be a second
 * logo this repo would then have to keep in step. The copy under `public/` is
 * the 560 px export; the navbar shows it at 26 px high.
 *
 * "docs" stays in the theme's own sans at a lower weight and opacity: it is the
 * qualifier, not part of the brand.
 *
 * The visible image is `aria-hidden` and the accessible name comes from the
 * hidden label, so a screen reader hears the product name once, as a word.
 * The dark theme lifts the image's brightness: the mark is set for paper.
 */
const logoImageStyle: CSSProperties = {
  display: "block",
  height: "1.625rem",
  width: "auto",
};

const qualifierStyle: CSSProperties = {
  fontSize: "0.9375rem",
  fontWeight: 500,
  letterSpacing: "0.01em",
  lineHeight: 1,
  opacity: 0.65,
};

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
  alignItems: "center",
  gap: "0.5em",
};

const darkLogoCss = "html.dark .remi-logo { filter: brightness(1.7); }";

const Logo = () => (
  <span style={logoStyle}>
    <style>{darkLogoCss}</style>
    <span style={hiddenLabelStyle}>{brandLegalName} docs</span>
    <img
      src="/remi-logo.png"
      alt=""
      aria-hidden="true"
      className="remi-logo"
      style={logoImageStyle}
      width={560}
      height={193}
    />
    <span aria-hidden="true" style={qualifierStyle}>
      docs
    </span>
  </span>
);

/**
 * The way back out. This site is the only surface with no product chrome around
 * it, so without these a reader who arrived from the app has the back button and
 * nothing else. Plain anchors at the navbar's end — Nextra renders `children`
 * after its own controls — and no new tab: the docs are a destination, not a
 * popover over the thing you were doing.
 */
const navLinkStyle: CSSProperties = {
  fontSize: "0.875rem",
  whiteSpace: "nowrap",
};

const OutboundLinks = () => (
  <>
    <a href={appHref("web")} style={navLinkStyle}>
      Application
    </a>
    <a href={appHref("marketing")} style={navLinkStyle}>
      Site
    </a>
  </>
);

const RootLayout = async ({ children }: { children: ReactNode }) => (
  <html lang="fr" dir="ltr" suppressHydrationWarning>
    <Head />
    <body>
      <Layout
        navbar={
          <Navbar logo={<Logo />}>
            <OutboundLinks />
          </Navbar>
        }
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
