import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/next";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { META } from "@/lib/content/landing";
import { isProduction, siteName, siteUrl } from "@/lib/metadata";
import { underConstruction } from "@/lib/under-construction";
import "../globals.css";

/**
 * One family, self-hosted by `next/font`: no third-party request on the
 * critical path and no layout shift while a webfont arrives. Plus Jakarta
 * Sans is the typeface of the charter, weights 400 to 800.
 */
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jakarta",
});

type Params = { locale: string };

/**
 * The site is French only (Jamie, 2026-11-03). The `[locale]` segment stays,
 * so every address keeps the `/fr` prefix the other apps link to, and `fr`
 * is the one value it takes. The proxy sends every other prefix here.
 */
const locale = "fr";

export const generateStaticParams = (): Params[] => [{ locale }];

export const dynamicParams = false;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: META.title,
    template: `%s · ${siteName}`,
  },
  description: META.description,
  openGraph: {
    siteName,
    locale: "fr_BE",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
  /* robots.txt already says no outside production. The tag covers a page
     reached by a link, which a crawler can still index without fetching it. */
  ...(isProduction ? {} : { robots: { index: false, follow: false } }),
};

const RootLayout = async ({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<Params>;
}) => {
  const { locale: requested } = await params;
  if (requested !== locale) {
    notFound();
  }

  return (
    <html lang="fr" className={jakarta.variable} suppressHydrationWarning>
      <body className="flex min-h-dvh flex-col antialiased">
        {underConstruction ? null : <SiteHeader />}
        <main className="flex-1">{children}</main>
        {underConstruction ? null : <SiteFooter />}
        <Analytics />
      </body>
    </html>
  );
};

export default RootLayout;
