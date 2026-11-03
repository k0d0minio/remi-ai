import NextLink from "next/link";
import { localePath } from "@remi/services/shared";
import { Button } from "@remi/ui";
import { Container, Link } from "@remi/ui/server";
import { Logo } from "@/components/logo";
import { MobileNav } from "@/components/mobile-nav";
import { HEADER, NAV } from "@/lib/content/landing";

const home = localePath("fr", "/");

/**
 * A server component. Only the mobile panel needs the client, and it is its
 * own island. The links are anchors on the one page, prefixed with the
 * page's path so they also work from a legal page.
 */
export const SiteHeader = () => (
  <header className="border-border/60 bg-background/90 sticky top-0 z-40 border-b backdrop-blur-md">
    <Container className="flex h-16 items-center justify-between gap-4">
      <NextLink
        href={`${home}#top`}
        aria-label={HEADER.logoLabel}
        className="focus-visible:ring-ring/40 rounded-sm focus-visible:outline-none focus-visible:ring-[3px]"
      >
        <Logo height={30} priority />
      </NextLink>

      <nav aria-label="Navigation principale" className="hidden items-center gap-6 lg:flex">
        {NAV.map((item) => (
          <Link
            key={item.href}
            as={NextLink}
            href={`${home}${item.href}`}
            variant="muted"
            className="text-sm font-medium"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-2">
        <Button asChild size="sm">
          <NextLink href={`${home}#inscription`}>{HEADER.cta}</NextLink>
        </Button>
        <MobileNav />
      </div>
    </Container>
  </header>
);
