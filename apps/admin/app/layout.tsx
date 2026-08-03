import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import type { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/next";
import { BRAND_NAME } from "@remi/ui/server";
import "./globals.css";

/**
 * The same two families, under the same variable names, as every other app —
 * `tokens.css` reads `--font-inter` and `--font-display`, so an app that skips
 * this silently falls back to system fonts and the wordmark loses its serif.
 */
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const display = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: {
    default: `${BRAND_NAME} admin`,
    template: `%s · ${BRAND_NAME} admin`,
  },
  description: `Internal operations for the ${BRAND_NAME} platform.`,
};

const RootLayout = ({ children }: { children: ReactNode }) => (
  <html
    lang="en"
    className={`${inter.variable} ${display.variable}`}
    suppressHydrationWarning
  >
    <body className="min-h-dvh antialiased">
      {children}
      <Analytics />
    </body>
  </html>
);

export default RootLayout;
