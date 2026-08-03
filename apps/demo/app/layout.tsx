import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
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

// The Design stage prototypes here and Paul-equivalent stakeholders review the
// deployed URL. Everything on screen is mock data from lib/mock — if a page in
// this app ever needs a fetch, the feature has outgrown the demo and belongs in
// apps/web behind the pipeline.

export const metadata: Metadata = {
  title: {
    default: `${BRAND_NAME} demo`,
    template: `%s · ${BRAND_NAME} demo`,
  },
  description: "Prototype sandbox — mock data only, never a real backend.",
};

const RootLayout = ({ children }: { children: React.ReactNode }) => (
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
