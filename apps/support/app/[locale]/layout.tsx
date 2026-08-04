import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/next";
import { isLocale, locales } from "@remi/services/shared";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getContent } from "@/lib/content";
import { siteName, siteUrl } from "@/lib/metadata";
import "../globals.css";

/**
 * The same two families as the public site, self-hosted by `next/font` under
 * the same CSS variable names — a visitor sent here from a page on the main
 * site should not notice they changed origin.
 *
 * Inter carries everything; its `latin` subset includes the accented range
 * French needs. Instrument Serif is headlines only, via Typography's `display`
 * variant.
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

type Params = { locale: string };

export const generateStaticParams = (): Params[] =>
  locales.map((locale) => ({ locale }));

/**
 * Only /en and /fr exist. The proxy already redirects everything else, but
 * this closes the door at the router too: an unknown locale is a 404, not a
 * page rendered with a half-valid param.
 */
export const dynamicParams = false;

export const generateMetadata = async ({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> => {
  const { locale } = await params;
  const content = getContent(isLocale(locale) ? locale : "en");

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: `${siteName} — ${content.home.meta.title}`,
      template: `%s · ${siteName} ${content.header.label}`,
    },
    description: content.home.meta.description,
    openGraph: {
      siteName,
      locale: locale === "fr" ? "fr_BE" : "en_GB",
      type: "website",
    },
    twitter: { card: "summary_large_image" },
  };
};

const RootLayout = async ({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<Params>;
}) => {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${display.variable}`}
      suppressHydrationWarning
    >
      <body className="flex min-h-dvh flex-col antialiased">
        <SiteHeader locale={locale} />
        <main className="flex-1">{children}</main>
        <SiteFooter locale={locale} />
        <Analytics />
      </body>
    </html>
  );
};

export default RootLayout;
