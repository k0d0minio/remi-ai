import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { BRAND_TAGLINE } from "@remi/ui/server";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { siteName, siteUrl } from "@/lib/metadata";
import "./globals.css";

/**
 * Two families, self-hosted by `next/font` so there is no third-party request on
 * the critical path and no layout shift while a webfont arrives.
 *
 * Inter carries everything. Its tabular figures matter here in a way they would
 * not on a generic site: this product is going to render a lot of numbers in
 * columns, and proportional digits make those columns jump.
 *
 * Instrument Serif is headlines only, via Typography's `display` variant. A
 * serif headline over a sans body is the typographic grammar of medical
 * journals and health institutions, which is the register this product needs —
 * and it stops reading as authoritative the moment it leaks into body copy.
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
  metadataBase: new URL(siteUrl),
  title: {
    default: `${siteName} — the wellness copilot between consultations`,
    template: `%s · ${siteName}`,
  },
  description: BRAND_TAGLINE.en,
  openGraph: { siteName, locale: "en_GB", type: "website" },
  twitter: { card: "summary_large_image" },
};

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html
    lang="en"
    className={`${inter.variable} ${display.variable}`}
    suppressHydrationWarning
  >
    <body className="flex min-h-dvh flex-col antialiased">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <Analytics />
    </body>
  </html>
);

export default RootLayout;
