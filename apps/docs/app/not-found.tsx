import type { CSSProperties } from "react";

/*
 * Nextra ships no 404 of its own, so without this a stale link to a page that
 * has been renamed lands on Next's unstyled default — the one screen on the
 * reference site that would not look like the reference site.
 *
 * Inline styles for the reason layout.tsx gives at length: this app has no
 * Tailwind pass and no design-system dependency by design. Nothing here names a
 * colour, so the page inherits the docs theme's own light and dark palettes.
 */

export const metadata = {
  title: "Page introuvable",
};

const wrapStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: "1rem",
  padding: "4rem 0",
};

const eyebrowStyle: CSSProperties = {
  fontSize: "0.75rem",
  fontWeight: 500,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  opacity: 0.6,
};

const headingStyle: CSSProperties = {
  fontFamily: "ui-serif, Georgia, serif",
  fontSize: "2.25rem",
  fontWeight: 400,
  lineHeight: 1.1,
  margin: 0,
};

const bodyStyle: CSSProperties = {
  fontSize: "1rem",
  lineHeight: 1.6,
  maxWidth: "34rem",
  opacity: 0.75,
};

const NotFound = () => (
  <div style={wrapStyle}>
    <span style={eyebrowStyle}>404</span>
    <h1 style={headingStyle}>Cette page n’existe pas</h1>
    <p style={bodyStyle}>
      La référence évolue avec le produit : une page peut donc être renommée ou
      fusionnée dans une autre. Partez de la vue d’ensemble, ou utilisez la
      recherche — chaque page est indexée.
    </p>
    <a href="/">Retour à la vue d’ensemble</a>
  </div>
);

export default NotFound;
