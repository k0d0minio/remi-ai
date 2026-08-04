import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import type { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/next";
import { BRAND_NAME } from "@remi/ui/server";
import "./globals.css";

// The Design stage prototypes here and Paul-equivalent stakeholders review the
// deployed URL. Everything on screen is mock data from lib/mock — if a page in
// this app ever needs a fetch, the feature has outgrown the demo and belongs in
// apps/web behind the pipeline.
//
// The copy is in French because the first practitioners and the people they
// support are francophone: a prototype a stakeholder has to translate in their
// head is not showing them the product.

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
    default: `${BRAND_NAME} — maquette`,
    template: `%s · ${BRAND_NAME} maquette`,
  },
  description:
    "Bac à sable de prototypage — données fictives uniquement, jamais un vrai backend.",
  robots: { index: false, follow: false },
};

const RootLayout = ({ children }: { children: ReactNode }) => (
  <html
    lang="fr"
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
