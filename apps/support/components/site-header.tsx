import { ArrowUpRight } from "lucide-react";
import NextLink from "next/link";
import { localePath, type Locale } from "@remi/services/shared";
import { Button } from "@remi/ui";
import {
  BRAND_LEGAL_NAME,
  Container,
  Typography,
  Wordmark,
} from "@remi/ui/server";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { getContent } from "@/lib/content";
import { externalHref } from "@/lib/links";

type Props = {
  locale: Locale;
};

/**
 * A server component. Only the locale switcher needs the client, and it is its
 * own island — the header itself costs nothing.
 *
 * The label beside the wordmark is what stops this reading as the product: a
 * visitor who arrived from a search result needs to know within one glance that
 * they are in the help centre, and one link back to REMI is the only navigation
 * a help centre owes them.
 */
export const SiteHeader = ({ locale }: Props) => {
  const content = getContent(locale);

  return (
    <header className="border-border/60 bg-background/80 sticky top-0 z-40 border-b backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between gap-4">
        <NextLink
          href={localePath(locale, "/")}
          aria-label={`${BRAND_LEGAL_NAME} ${content.header.label}, ${content.header.homeLabel}`}
          className="focus-visible:ring-ring/40 flex items-center gap-2.5 rounded-sm focus-visible:outline-none focus-visible:ring-[3px]"
        >
          <Wordmark />
          <span aria-hidden="true" className="bg-border h-5 w-px" />
          <Typography
            as="span"
            size="sm"
            weight="medium"
            tone="muted"
            aria-hidden="true"
          >
            {content.header.label}
          </Typography>
        </NextLink>

        <div className="flex items-center gap-2 sm:gap-3">
          <LocaleSwitcher
            locale={locale}
            label={content.header.languageLabel}
          />
          <Button asChild variant="outline" size="sm">
            <a href={externalHref(locale, content.header.product)}>
              {content.header.product.label}
              <ArrowUpRight aria-hidden="true" />
            </a>
          </Button>
        </div>
      </Container>
    </header>
  );
};
