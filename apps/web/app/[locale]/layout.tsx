import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/next";
import { defaultLocale, isLocale, locales } from "@remi/services/shared";
import { BRAND_NAME } from "@remi/ui/server";
import { getContent } from "@/lib/content";
import { RequestButton } from "../../../../.icm/_system/request-button/RequestButton";
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

/** Only /fr exists. An unknown locale is a 404, not a half-valid render. */
export const dynamicParams = false;

export const generateMetadata = async ({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> => {
  const { locale } = await params;
  const { meta } = getContent(isLocale(locale) ? locale : defaultLocale);

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
    /*
     * Light only (REM-175). The `.dark` tokens and `themeScript` stay in
     * `@remi/ui` for later, but the app does not inject the script, so the
     * `.dark` class never reaches <html>. A device in dark mode gets the light
     * theme of the charter.
     */
    <html lang={locale} className={jakarta.variable}>
      <body className="min-h-dvh antialiased">
        {children}
        <RequestButton />
        <Analytics />
      </body>
    </html>
  );
};

export default RootLayout;
