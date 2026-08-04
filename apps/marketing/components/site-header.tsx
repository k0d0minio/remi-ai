import NextLink from "next/link";
import { appHref, localePath, type Locale } from "@remi/services/shared";
import { Button } from "@remi/ui";
import { BRAND_LEGAL_NAME, Container, Link, Wordmark } from "@remi/ui/server";
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

        {/* Four links plus the buttons: the gap tightens at md so the row does
            not wrap between the tablet breakpoint and a laptop width, which is
            also why sign-in only joins the row at lg. */}
        <nav
          aria-label="Main"
          className="hidden items-center gap-6 md:flex lg:gap-8"
        >
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
          {/* A plain anchor: the product is its own deployment, so the router
              cannot navigate into it. Held back to lg because the md row is
              already full at two buttons — between the two breakpoints the
              footer carries the same link, and below md the mobile panel does. */}
          <Button asChild variant="ghost" size="sm" className="hidden lg:flex">
            <a href={appHref("web", "/", locale)}>{content.header.signIn}</a>
          </Button>
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
