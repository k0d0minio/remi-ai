import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/next";
import { isLocale, locales } from "@remi/services/shared";
import { BRAND_NAME } from "@remi/ui/server";
import "../globals.css";

/**
 * Declared here because a package cannot call `next/font`: the app owns the
 * fonts and exposes them as the CSS variables `tokens.css` reads. Without this
 * the display type scale falls back to Georgia.
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

/** Only /en and /fr exist — an unknown locale is a 404, not a half-valid render. */
export const dynamicParams = false;

export const metadata: Metadata = {
  title: {
    default: BRAND_NAME,
    template: `%s · ${BRAND_NAME}`,
  },
  description: "The wellness copilot between consultations.",
  robots: { index: false, follow: false },
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
      <body className="min-h-dvh antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
};

export default RootLayout;
