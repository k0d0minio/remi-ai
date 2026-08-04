"use client";

import type { CSSProperties } from "react";

/*
 * The same shape as not-found.tsx beside it, and inline-styled for the same
 * reason: this app runs no Tailwind pass and takes no design-system dependency.
 *
 * `error.message` is not rendered. The docs site is public, and a server string
 * is the one thing on a page like this that could say more than it should.
 */

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

const buttonStyle: CSSProperties = {
  font: "inherit",
  fontSize: "0.875rem",
  padding: "0.5rem 1rem",
  borderRadius: "0.375rem",
  border: "1px solid currentColor",
  background: "transparent",
  color: "inherit",
  cursor: "pointer",
};

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

const ErrorBoundary = ({ error, reset }: Props) => (
  <div style={wrapStyle}>
    <span style={eyebrowStyle}>Error</span>
    <h1 style={headingStyle}>This page did not load</h1>
    <p style={bodyStyle}>
      The reference is still there — something on our side failed on the way to
      it. Try again, and quote the reference below if it keeps happening.
    </p>
    {error.digest ? <span style={eyebrowStyle}>{error.digest}</span> : null}
    <button type="button" onClick={reset} style={buttonStyle}>
      Try again
    </button>
  </div>
);

export default ErrorBoundary;
