import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import type { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/next";
import { BRAND_NAME, themeScript } from "@remi/ui/server";
import "./globals.css";

/**
 * The same family, under the same variable name, as every other app:
 * `tokens.css` reads `--font-jakarta`, so an app that skips this silently
 * falls back to system fonts.
 */
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: {
    default: `${BRAND_NAME} — console`,
    template: `%s · console ${BRAND_NAME}`,
  },
  description: `Console interne ${BRAND_NAME} — gestion des profils patients.`,
  robots: { index: false, follow: false },
};

const RootLayout = ({ children }: { children: ReactNode }) => (
  <html lang="fr" className={jakarta.variable} suppressHydrationWarning>
    <body className="min-h-dvh antialiased">
      {/*
       * First child of <body> so it runs before the browser paints anything
       * below it, which is what stops a dark-mode operator seeing a white
       * flash. `suppressHydrationWarning` on <html> above is the other half:
       * this script mutates the class React is about to reconcile.
       */}
      <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      {children}
      <Analytics />
    </body>
  </html>
);

export default RootLayout;
