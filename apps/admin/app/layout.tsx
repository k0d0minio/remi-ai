import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import type { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/next";
import { BRAND_NAME } from "@remi/ui/server";
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

/**
 * Light only (REM-175). The `.dark` tokens and `themeScript` stay in `@remi/ui`
 * for later, but the console does not inject the script, so the `.dark` class
 * never reaches <html>. A device in dark mode gets the light theme of the
 * charter.
 */
const RootLayout = ({ children }: { children: ReactNode }) => (
  <html lang="fr" className={jakarta.variable}>
    <body className="min-h-dvh antialiased">
      {children}
      <Analytics />
    </body>
  </html>
);

export default RootLayout;
