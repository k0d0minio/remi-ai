import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Remi AI admin",
    template: "%s · Remi AI admin",
  },
  description: "Internal operations for the Remi AI platform.",
};

const RootLayout = ({ children }: { children: React.ReactNode }) => (
  <html lang="en" suppressHydrationWarning>
    <body className="min-h-dvh antialiased">
      {children}
      <Analytics />
    </body>
  </html>
);

export default RootLayout;
