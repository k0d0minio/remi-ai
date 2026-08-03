import NextLink from "next/link";
import { localePath, type Locale } from "@remi/services/shared";
import { Button } from "@remi/ui";
import {
  BRAND_LEGAL_NAME,
  Container,
  Link,
  Wordmark,
} from "@remi/ui/server";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { MobileNav } from "@/components/mobile-nav";
import { getContent } from "@/lib/content";

type Props = {
  locale: Locale;
};

/**
 * A server component. Only the mobile panel and the locale switcher need the
 * client, and each is its own island — the header itself, and the links inside
 * it, cost nothing.
 */
export const SiteHeader = ({ locale }: Props) => {
  const content = getContent(locale);

  return (
    <header className="border-border/60 bg-background/80 sticky top-0 z-40 border-b backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between gap-6">
        <NextLink
          href={localePath(locale, "/")}
          aria-label={`${BRAND_LEGAL_NAME}, ${content.header.homeLabel}`}
          className="focus-visible:ring-ring/40 rounded-sm focus-visible:outline-none focus-visible:ring-[3px]"
        >
          <Wordmark />
        </NextLink>

        <nav aria-label="Main" className="hidden items-center gap-8 md:flex">
          {content.nav.map((item) => (
            <Link
              key={item.href}
              as={NextLink}
              href={localePath(locale, item.href)}
              variant="muted"
              className="text-sm"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <LocaleSwitcher locale={locale} />
          <Button asChild variant="ghost" size="sm">
            <NextLink href={localePath(locale, "/contact")}>
              {content.header.contact}
            </NextLink>
          </Button>
          <Button asChild size="sm">
            <NextLink href={localePath(locale, content.header.cta.href)}>
              {content.header.cta.label}
            </NextLink>
          </Button>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <LocaleSwitcher locale={locale} />
          <MobileNav
            locale={locale}
            nav={content.nav}
            header={content.header}
          />
        </div>
      </Container>
    </header>
  );
};
