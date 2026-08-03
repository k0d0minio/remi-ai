import NextLink from "next/link";
import { Button } from "@remi/ui";
import { BRAND_LEGAL_NAME, Container, Link, Wordmark } from "@remi/ui/server";
import { MobileNav } from "@/components/mobile-nav";
import { nav } from "@/lib/content/landing";

/**
 * A server component. Only the mobile panel needs state, and it is its own
 * island — the header itself, and the links inside it, cost nothing.
 */
export const SiteHeader = () => (
  <header className="border-border/60 bg-background/80 sticky top-0 z-40 border-b backdrop-blur-md">
    <Container className="flex h-16 items-center justify-between gap-6">
      <NextLink
        href="/"
        aria-label={`${BRAND_LEGAL_NAME}, home`}
        className="focus-visible:ring-ring/40 rounded-sm focus-visible:outline-none focus-visible:ring-[3px]"
      >
        <Wordmark />
      </NextLink>

      <nav aria-label="Main" className="hidden items-center gap-8 md:flex">
        {nav.map((item) => (
          <Link
            key={item.href}
            as={NextLink}
            href={item.href}
            variant="muted"
            className="text-sm"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="hidden items-center gap-3 md:flex">
        <Button asChild variant="ghost" size="sm">
          <NextLink href="/contact">Contact</NextLink>
        </Button>
        <Button asChild size="sm">
          <NextLink href="#pricing">Get started</NextLink>
        </Button>
      </div>

      <MobileNav />
    </Container>
  </header>
);
