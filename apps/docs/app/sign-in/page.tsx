import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { CSSProperties } from "react";
import { signIn } from "@/lib/auth/actions";
import { isOperatorSignedIn } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

/**
 * Hand-styled, for the reason the root layout gives: this app has no Tailwind
 * pass and no design-system dependency, and pulling `@remi/ui` in for one form
 * would undo a deliberate boundary to save a few inline styles. The colours come
 * from the theme's own CSS variables so the form follows light and dark with the
 * rest of the site.
 */
const pageStyle: CSSProperties = {
  minHeight: "100dvh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "3rem 1.5rem",
};

const cardStyle: CSSProperties = {
  width: "100%",
  maxWidth: "22rem",
  display: "flex",
  flexDirection: "column",
  gap: "1.5rem",
};

const wordmarkStyle: CSSProperties = {
  fontFamily: "ui-serif, Georgia, serif",
  fontSize: "1.25rem",
  fontWeight: 400,
  letterSpacing: "0.06em",
  lineHeight: 1,
};

const subtitleStyle: CSSProperties = {
  fontSize: "0.875rem",
  opacity: 0.65,
  margin: "0.5rem 0 0",
};

const formStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
};

const fieldStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.375rem",
};

const labelStyle: CSSProperties = {
  fontSize: "0.875rem",
  fontWeight: 500,
};

/*
 * Greys are given as translucent neutrals rather than as hex values, so the same
 * three declarations read correctly against the theme's light and dark
 * backgrounds without this file having to know which one is showing.
 */
const inputStyle: CSSProperties = {
  height: "2.5rem",
  padding: "0 0.75rem",
  borderRadius: "0.375rem",
  border: "1px solid rgba(128, 128, 128, 0.35)",
  background: "transparent",
  color: "inherit",
  font: "inherit",
  fontSize: "0.9375rem",
};

const buttonStyle: CSSProperties = {
  height: "2.5rem",
  borderRadius: "0.375rem",
  border: "1px solid rgba(128, 128, 128, 0.45)",
  background: "rgba(128, 128, 128, 0.12)",
  color: "inherit",
  cursor: "pointer",
  font: "inherit",
  fontSize: "0.9375rem",
  fontWeight: 500,
};

const errorStyle: CSSProperties = {
  fontSize: "0.875rem",
  padding: "0.625rem 0.75rem",
  borderRadius: "0.375rem",
  border: "1px solid rgba(220, 38, 38, 0.35)",
  background: "rgba(220, 38, 38, 0.08)",
  color: "#dc2626",
  margin: 0,
};

/**
 * The one page outside the gate. It reads the session as well, so an operator
 * who is already signed in lands on the docs rather than on a form asking them
 * to do it again.
 */
const Page = async ({
  searchParams,
}: {
  searchParams: Promise<{ failed?: string }>;
}) => {
  if (await isOperatorSignedIn()) {
    redirect("/");
  }

  const { failed } = await searchParams;

  return (
    <main style={pageStyle}>
      <div style={cardStyle}>
        <div>
          <span style={wordmarkStyle}>REMI</span>
          <p style={subtitleStyle}>
            Internal reference — operators only. Sign in with your console
            account.
          </p>
        </div>

        <form action={signIn} style={formStyle}>
          {failed ? (
            <p role="alert" style={errorStyle}>
              That email and password are not valid.
            </p>
          ) : null}

          <div style={fieldStyle}>
            <label htmlFor="email" style={labelStyle}>
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              autoFocus
              style={inputStyle}
            />
          </div>

          <div style={fieldStyle}>
            <label htmlFor="password" style={labelStyle}>
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              style={inputStyle}
            />
          </div>

          <button type="submit" style={buttonStyle}>
            Sign in
          </button>
        </form>
      </div>
    </main>
  );
};

export default Page;
