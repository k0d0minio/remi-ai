import type { ReactNode } from "react";
import NextLink from "next/link";
import { Badge, Typography } from "@remi/ui/server";
import { DemoMobileNav } from "@/components/demo-mobile-nav";
import { DemoNav } from "@/components/demo-nav";
import { SurfaceSwitcher } from "@/components/surface-switcher";

/**
 * The shell every prototype sits in. It mirrors the one in `apps/web` closely
 * enough that a stakeholder is judging the screens rather than the chrome, and
 * adds the one thing the product will never have: a way to jump between the two
 * sides of the loop.
 */
const DemoLayout = ({ children }: { children: ReactNode }) => (
  <div className="flex min-h-dvh">
    <aside className="border-border bg-card hidden w-64 shrink-0 flex-col gap-6 border-r p-4 md:flex">
      <div className="flex items-center gap-2 px-2">
        <NextLink
          href="/"
          className="focus-visible:ring-ring/40 rounded-sm focus-visible:outline-none focus-visible:ring-[3px]"
        >
          <Typography as="span" variant="display" size="xl">
            REMI
          </Typography>
        </NextLink>
        <Badge variant="warning" tone="subtle" size="sm">
          maquette
        </Badge>
      </div>

      <SurfaceSwitcher />

      <nav aria-label="Principale">
        <DemoNav />
      </nav>
    </aside>

    <div className="flex min-w-0 flex-1 flex-col">
      <header className="border-border bg-background/80 sticky top-0 z-30 flex h-14 items-center gap-3 border-b px-4 backdrop-blur-md md:hidden">
        <DemoMobileNav />
        <Typography as="span" variant="display" size="lg">
          REMI
        </Typography>
      </header>

      <main className="flex-1 px-4 py-8 md:px-8">{children}</main>
    </div>
  </div>
);

export default DemoLayout;
