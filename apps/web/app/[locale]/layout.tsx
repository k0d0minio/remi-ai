import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/next";
import { isLocale, locales } from "@remi/services/shared";
import { BRAND_NAME, themeScript } from "@remi/ui/server";
import { getContent } from "@/lib/content";
import "../globals.css";

/**
 * Declared here because a package cannot call `next/font`: the app owns the
 * font and exposes it as the CSS variable `tokens.css` reads. The charter
 * gives one family, Plus Jakarta Sans, weights 400 to 800 (a variable font).
 */
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jakarta",
});

type Params = { locale: string };

export const generateStaticParams = (): Params[] =>
  locales.map((locale) => ({ locale }));

/** Only /en and /fr exist — an unknown locale is a 404, not a half-valid render. */
export const dynamicParams = false;

export const generateMetadata = async ({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> => {
  const { locale } = await params;
  const { meta } = getContent(isLocale(locale) ? locale : "en");

  return {
    title: {
      default: `${BRAND_NAME} — ${meta.title}`,
      template: `%s · ${BRAND_NAME}`,
    },
    description: meta.description,
    robots: { index: false, follow: false },
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
    <html lang={locale} className={jakarta.variable} suppressHydrationWarning>
      <body className="min-h-dvh antialiased">
        {/*
         * First child of <body> so it runs before the browser paints anything
         * below it, which is what stops a dark-mode visitor seeing a white
         * flash. `suppressHydrationWarning` on <html> above is the other half:
         * this script mutates the class React is about to reconcile.
         */}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        {children}
        <Analytics />
      </body>
    </html>
  );
};

export default RootLayout;
