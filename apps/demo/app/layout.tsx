import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

// The Design stage prototypes here and Paul-equivalent stakeholders review the
// deployed URL. Everything on screen is mock data from lib/mock — if a page in
// this app ever needs a fetch, the feature has outgrown the demo and belongs in
// apps/web behind the pipeline.

export const metadata: Metadata = {
  title: {
    default: "Remi AI demo",
    template: "%s · Remi AI demo",
  },
  description: "Prototype sandbox — mock data only, never a real backend.",
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
